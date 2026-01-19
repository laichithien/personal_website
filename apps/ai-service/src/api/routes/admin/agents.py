"""Admin agent configuration endpoints."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.api.deps.auth import CurrentAdmin
from src.database.models import AdminUser
from src.api.schemas.admin import (
    AgentConfigCreate,
    AgentConfigResponse,
    AgentConfigUpdate,
    AgentToolLink,
)
from src.database.connection import get_db
from src.database.models import AgentConfig, AgentToolLink as AgentToolLinkModel, ToolDefinition

router = APIRouter(prefix="/agents", tags=["admin-agents"])


@router.get("", response_model=list[AgentConfigResponse])
async def list_agents(
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """List all agent configurations."""
    result = await db.execute(
        select(AgentConfig).options(selectinload(AgentConfig.tool_links))
    )
    agents = result.scalars().all()

    return [
        AgentConfigResponse(
            id=agent.id,
            slug=agent.slug,
            name=agent.name,
            model_provider=agent.model_provider,
            model_name=agent.model_name,
            system_prompt=agent.system_prompt,
            temperature=agent.temperature,
            is_active=agent.is_active,
            created_at=agent.created_at,
            updated_at=agent.updated_at,
            tool_count=len(agent.tool_links),
        )
        for agent in agents
    ]


@router.get("/{agent_id}", response_model=AgentConfigResponse)
async def get_agent(
    agent_id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Get agent configuration by ID."""
    result = await db.execute(
        select(AgentConfig)
        .where(AgentConfig.id == agent_id)
        .options(selectinload(AgentConfig.tool_links))
    )
    agent = result.scalar_one_or_none()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    return AgentConfigResponse(
        id=agent.id,
        slug=agent.slug,
        name=agent.name,
        model_provider=agent.model_provider,
        model_name=agent.model_name,
        system_prompt=agent.system_prompt,
        temperature=agent.temperature,
        is_active=agent.is_active,
        created_at=agent.created_at,
        updated_at=agent.updated_at,
        tool_count=len(agent.tool_links),
    )


@router.post("", response_model=AgentConfigResponse, status_code=status.HTTP_201_CREATED)
async def create_agent(
    data: AgentConfigCreate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Create a new agent configuration."""
    # Check for duplicate slug
    result = await db.execute(
        select(AgentConfig).where(AgentConfig.slug == data.slug)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Agent with this slug already exists",
        )

    agent = AgentConfig(
        slug=data.slug,
        name=data.name,
        system_prompt=data.system_prompt,
        model_provider=data.model_provider,
        model_name=data.model_name,
        temperature=data.temperature,
        is_active=data.is_active,
    )
    db.add(agent)
    await db.commit()
    await db.refresh(agent)

    return AgentConfigResponse(
        id=agent.id,
        slug=agent.slug,
        name=agent.name,
        model_provider=agent.model_provider,
        model_name=agent.model_name,
        system_prompt=agent.system_prompt,
        temperature=agent.temperature,
        is_active=agent.is_active,
        created_at=agent.created_at,
        updated_at=agent.updated_at,
        tool_count=0,
    )


@router.put("/{agent_id}", response_model=AgentConfigResponse)
async def update_agent(
    agent_id: int,
    data: AgentConfigUpdate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Update an agent configuration."""
    result = await db.execute(
        select(AgentConfig)
        .where(AgentConfig.id == agent_id)
        .options(selectinload(AgentConfig.tool_links))
    )
    agent = result.scalar_one_or_none()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(agent, field, value)
    agent.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(agent)

    return AgentConfigResponse(
        id=agent.id,
        slug=agent.slug,
        name=agent.name,
        model_provider=agent.model_provider,
        model_name=agent.model_name,
        system_prompt=agent.system_prompt,
        temperature=agent.temperature,
        is_active=agent.is_active,
        created_at=agent.created_at,
        updated_at=agent.updated_at,
        tool_count=len(agent.tool_links),
    )


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Delete an agent configuration."""
    result = await db.execute(
        select(AgentConfig).where(AgentConfig.id == agent_id)
    )
    agent = result.scalar_one_or_none()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    # Delete tool links first
    await db.execute(
        select(AgentToolLinkModel).where(AgentToolLinkModel.agent_id == agent_id)
    )

    await db.delete(agent)
    await db.commit()


@router.post("/{agent_id}/tools", response_model=AgentConfigResponse)
async def link_tools_to_agent(
    agent_id: int,
    data: AgentToolLink,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Link tools to an agent."""
    # Get agent
    result = await db.execute(
        select(AgentConfig)
        .where(AgentConfig.id == agent_id)
        .options(selectinload(AgentConfig.tool_links))
    )
    agent = result.scalar_one_or_none()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    # Verify all tools exist
    result = await db.execute(
        select(ToolDefinition).where(ToolDefinition.id.in_(data.tool_ids))
    )
    tools = result.scalars().all()
    if len(tools) != len(data.tool_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Some tools not found",
        )

    # Remove existing links
    for link in agent.tool_links:
        await db.delete(link)

    # Create new links
    for tool_id in data.tool_ids:
        link = AgentToolLinkModel(agent_id=agent_id, tool_id=tool_id)
        db.add(link)

    agent.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(agent)

    # Reload with tool links
    result = await db.execute(
        select(AgentConfig)
        .where(AgentConfig.id == agent_id)
        .options(selectinload(AgentConfig.tool_links))
    )
    agent = result.scalar_one()

    return AgentConfigResponse(
        id=agent.id,
        slug=agent.slug,
        name=agent.name,
        model_provider=agent.model_provider,
        model_name=agent.model_name,
        system_prompt=agent.system_prompt,
        temperature=agent.temperature,
        is_active=agent.is_active,
        created_at=agent.created_at,
        updated_at=agent.updated_at,
        tool_count=len(agent.tool_links),
    )
