"""Admin chat session endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.api.deps.auth import CurrentAdmin
from src.api.schemas.admin import (
    BulkDeleteRequest,
    ChatMessageResponse,
    ChatSessionDetailResponse,
    ChatSessionResponse,
    PaginatedResponse,
)
from src.database.connection import get_db
from src.database.models import ChatMessage, ChatSession

router = APIRouter(prefix="/sessions", tags=["admin-sessions"])


@router.get("", response_model=PaginatedResponse)
async def list_sessions(
    admin: CurrentAdmin,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List all chat sessions with pagination."""
    # Get total count
    count_result = await db.execute(select(func.count(ChatSession.id)))
    total = count_result.scalar()

    # Get paginated sessions with message count
    offset = (page - 1) * per_page
    result = await db.execute(
        select(ChatSession)
        .options(selectinload(ChatSession.messages))
        .order_by(ChatSession.last_activity.desc())
        .offset(offset)
        .limit(per_page)
    )
    sessions = result.scalars().all()

    items = [
        ChatSessionResponse(
            id=session.id,
            session_id=str(session.session_id),
            agent_slug=session.agent_slug,
            user_identifier=session.user_identifier,
            message_count=len(session.messages),
            created_at=session.created_at,
            last_activity=session.last_activity,
        )
        for session in sessions
    ]

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=(total + per_page - 1) // per_page,
    )


@router.get("/{session_id}", response_model=ChatSessionDetailResponse)
async def get_session(
    session_id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Get chat session with all messages."""
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.id == session_id)
        .options(selectinload(ChatSession.messages))
    )
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    messages = [
        ChatMessageResponse(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            tool_calls=list(msg.tool_calls.keys()) if msg.tool_calls else None,
            created_at=msg.created_at,
        )
        for msg in sorted(session.messages, key=lambda m: m.created_at)
    ]

    return ChatSessionDetailResponse(
        id=session.id,
        session_id=str(session.session_id),
        agent_slug=session.agent_slug,
        user_identifier=session.user_identifier,
        message_count=len(session.messages),
        created_at=session.created_at,
        last_activity=session.last_activity,
        messages=messages,
    )


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Delete a chat session and its messages."""
    result = await db.execute(
        select(ChatSession).where(ChatSession.id == session_id)
    )
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    # Delete messages first
    await db.execute(
        delete(ChatMessage).where(ChatMessage.session_id == session_id)
    )

    # Delete session
    await db.delete(session)
    await db.commit()


@router.delete("/bulk", status_code=status.HTTP_204_NO_CONTENT)
async def bulk_delete_sessions(
    data: BulkDeleteRequest,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Bulk delete chat sessions."""
    if not data.ids:
        return

    # Delete messages for all sessions
    await db.execute(
        delete(ChatMessage).where(ChatMessage.session_id.in_(data.ids))
    )

    # Delete sessions
    await db.execute(
        delete(ChatSession).where(ChatSession.id.in_(data.ids))
    )

    await db.commit()
