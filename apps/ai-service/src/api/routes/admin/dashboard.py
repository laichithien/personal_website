"""Admin dashboard endpoints."""

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps.auth import CurrentAdmin
from src.api.schemas.admin import DashboardStats, RecentActivity
from src.database.connection import get_db
from src.database.models import (
    AgentConfig,
    ChatMessage,
    ChatSession,
    KnowledgeDocument,
    ToolDefinition,
)

router = APIRouter(prefix="/dashboard", tags=["admin-dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard statistics."""
    today = datetime.utcnow().date()
    today_start = datetime.combine(today, datetime.min.time())

    # Agent counts
    total_agents_result = await db.execute(select(func.count(AgentConfig.id)))
    total_agents = total_agents_result.scalar() or 0

    active_agents_result = await db.execute(
        select(func.count(AgentConfig.id)).where(AgentConfig.is_active == True)
    )
    active_agents = active_agents_result.scalar() or 0

    # Tool count
    total_tools_result = await db.execute(select(func.count(ToolDefinition.id)))
    total_tools = total_tools_result.scalar() or 0

    # Document count
    total_documents_result = await db.execute(
        select(func.count(KnowledgeDocument.id))
    )
    total_documents = total_documents_result.scalar() or 0

    # Session counts
    total_sessions_result = await db.execute(select(func.count(ChatSession.id)))
    total_sessions = total_sessions_result.scalar() or 0

    sessions_today_result = await db.execute(
        select(func.count(ChatSession.id)).where(
            ChatSession.created_at >= today_start
        )
    )
    sessions_today = sessions_today_result.scalar() or 0

    # Message counts
    total_messages_result = await db.execute(select(func.count(ChatMessage.id)))
    total_messages = total_messages_result.scalar() or 0

    messages_today_result = await db.execute(
        select(func.count(ChatMessage.id)).where(
            ChatMessage.created_at >= today_start
        )
    )
    messages_today = messages_today_result.scalar() or 0

    return DashboardStats(
        total_agents=total_agents,
        active_agents=active_agents,
        total_tools=total_tools,
        total_documents=total_documents,
        total_sessions=total_sessions,
        total_messages=total_messages,
        sessions_today=sessions_today,
        messages_today=messages_today,
    )


@router.get("/recent-activity", response_model=list[RecentActivity])
async def get_recent_activity(
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Get recent activity for dashboard."""
    # Get recent sessions
    sessions_result = await db.execute(
        select(ChatSession)
        .order_by(ChatSession.created_at.desc())
        .limit(5)
    )
    recent_sessions = sessions_result.scalars().all()

    # Get recent messages
    messages_result = await db.execute(
        select(ChatMessage)
        .order_by(ChatMessage.created_at.desc())
        .limit(5)
    )
    recent_messages = messages_result.scalars().all()

    activities = []

    for session in recent_sessions:
        activities.append(
            RecentActivity(
                type="session",
                description=f"New chat session started with {session.agent_slug}",
                timestamp=session.created_at,
            )
        )

    for message in recent_messages:
        activities.append(
            RecentActivity(
                type="message",
                description=f"New {message.role} message: {message.content[:50]}...",
                timestamp=message.created_at,
            )
        )

    # Sort by timestamp
    activities.sort(key=lambda x: x.timestamp, reverse=True)

    return activities[:10]
