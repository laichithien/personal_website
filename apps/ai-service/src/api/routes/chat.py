import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from src.database.connection import get_db
from src.database.models import ChatSession, ChatMessage
from src.agent.factory import get_agent_async, AgentNotFoundError
from src.api.schemas import (
    ChatRequest,
    ChatResponse,
    ChatHistoryResponse,
    ChatHistoryItem,
)

# CRITICAL: Import Pydantic-AI message types for history
from pydantic_ai.messages import (
    ModelRequest,
    ModelResponse,
    TextPart,
    UserPromptPart,
)

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/{agent_slug}", response_model=ChatResponse)
async def chat(
    agent_slug: str,
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Send a message to an AI agent and receive a response.

    Args:
        agent_slug: Identifier for the agent (e.g., "portfolio-assistant")
        request: Chat message and optional session ID

    Returns:
        AI response with session tracking
    """
    try:
        # 1. Load agent from database config (async version)
        agent = await get_agent_async(agent_slug, db)
    except AgentNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    # 2. Get or create session (ASYNC)
    session_id = request.session_id or str(uuid.uuid4())
    result = await db.execute(
        select(ChatSession).where(ChatSession.session_id == session_id)
    )
    chat_session = result.scalar_one_or_none()

    if not chat_session:
        chat_session = ChatSession(
            session_id=session_id,
            agent_slug=agent_slug,
        )
        db.add(chat_session)
        await db.commit()
        await db.refresh(chat_session)

    # 3. Save user message
    user_message = ChatMessage(
        session_id=chat_session.id,
        role="user",
        content=request.message,
    )
    db.add(user_message)
    await db.flush()

    # 4. Load conversation history for context (ASYNC)
    history_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == chat_session.id)
        .order_by(ChatMessage.created_at)
        .limit(20)
    )
    history = history_result.scalars().all()

    # 5. Convert DB messages to Pydantic-AI format (CRITICAL!)
    context_messages = []
    for msg in history[:-1]:  # Exclude current user message
        if msg.role == "user":
            context_messages.append(
                ModelRequest(parts=[UserPromptPart(content=msg.content)])
            )
        elif msg.role == "assistant":
            context_messages.append(
                ModelResponse(parts=[TextPart(content=msg.content)])
            )

    # 6. Run agent with properly formatted history
    try:
        result = await agent.run(
            request.message,
            message_history=context_messages,
        )
        response_text = result.data

        # Extract tool calls if any
        tool_calls = None
        if result.all_messages():
            tool_calls = [
                str(msg) for msg in result.all_messages()
                if hasattr(msg, 'parts') and any(
                    hasattr(p, 'tool_name') for p in getattr(msg, 'parts', [])
                )
            ]
    except Exception as e:
        response_text = f"I apologize, but I encountered an error: {str(e)}"
        tool_calls = None

    # 7. Save assistant response
    assistant_message = ChatMessage(
        session_id=chat_session.id,
        role="assistant",
        content=response_text,
    )
    db.add(assistant_message)

    # 8. Update session activity and commit
    chat_session.last_activity = datetime.utcnow()
    await db.commit()

    return ChatResponse(
        response=response_text,
        session_id=session_id,
        tool_calls=tool_calls if tool_calls else None,
    )


@router.get("/{agent_slug}/history/{session_id}", response_model=ChatHistoryResponse)
async def get_history(
    agent_slug: str,
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get chat history for a session."""
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.session_id == session_id)
        .where(ChatSession.agent_slug == agent_slug)
    )
    chat_session = result.scalar_one_or_none()

    if not chat_session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == chat_session.id)
        .order_by(ChatMessage.created_at)
    )
    messages = messages_result.scalars().all()

    return ChatHistoryResponse(
        session_id=session_id,
        messages=[
            ChatHistoryItem(
                role=msg.role,
                content=msg.content,
                timestamp=msg.created_at,
            )
            for msg in messages
        ],
    )
