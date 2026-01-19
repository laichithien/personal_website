"""Admin tool definition endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.api.deps.auth import CurrentAdmin
from src.api.schemas.admin import (
    ToolDefinitionCreate,
    ToolDefinitionResponse,
    ToolDefinitionUpdate,
)
from src.database.connection import get_db
from src.database.models import ToolDefinition

router = APIRouter(prefix="/tools", tags=["admin-tools"])


@router.get("", response_model=list[ToolDefinitionResponse])
async def list_tools(
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """List all tool definitions."""
    result = await db.execute(
        select(ToolDefinition).options(selectinload(ToolDefinition.agent_links))
    )
    tools = result.scalars().all()

    return [
        ToolDefinitionResponse(
            id=tool.id,
            name=tool.name,
            description=tool.description,
            is_active=tool.is_active,
            created_at=tool.created_at,
            agent_count=len(tool.agent_links),
        )
        for tool in tools
    ]


@router.get("/{tool_id}", response_model=ToolDefinitionResponse)
async def get_tool(
    tool_id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Get tool definition by ID."""
    result = await db.execute(
        select(ToolDefinition)
        .where(ToolDefinition.id == tool_id)
        .options(selectinload(ToolDefinition.agent_links))
    )
    tool = result.scalar_one_or_none()

    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found",
        )

    return ToolDefinitionResponse(
        id=tool.id,
        name=tool.name,
        description=tool.description,
        is_active=tool.is_active,
        created_at=tool.created_at,
        agent_count=len(tool.agent_links),
    )


@router.post("", response_model=ToolDefinitionResponse, status_code=status.HTTP_201_CREATED)
async def create_tool(
    data: ToolDefinitionCreate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Create a new tool definition."""
    # Check for duplicate name
    result = await db.execute(
        select(ToolDefinition).where(ToolDefinition.name == data.name)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tool with this name already exists",
        )

    tool = ToolDefinition(
        name=data.name,
        description=data.description,
        is_active=data.is_active,
    )
    db.add(tool)
    await db.commit()
    await db.refresh(tool)

    return ToolDefinitionResponse(
        id=tool.id,
        name=tool.name,
        description=tool.description,
        is_active=tool.is_active,
        created_at=tool.created_at,
        agent_count=0,
    )


@router.put("/{tool_id}", response_model=ToolDefinitionResponse)
async def update_tool(
    tool_id: int,
    data: ToolDefinitionUpdate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Update a tool definition."""
    result = await db.execute(
        select(ToolDefinition)
        .where(ToolDefinition.id == tool_id)
        .options(selectinload(ToolDefinition.agent_links))
    )
    tool = result.scalar_one_or_none()

    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found",
        )

    # Check for duplicate name if updating
    if data.name and data.name != tool.name:
        result = await db.execute(
            select(ToolDefinition).where(ToolDefinition.name == data.name)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tool with this name already exists",
            )

    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tool, field, value)

    await db.commit()
    await db.refresh(tool)

    return ToolDefinitionResponse(
        id=tool.id,
        name=tool.name,
        description=tool.description,
        is_active=tool.is_active,
        created_at=tool.created_at,
        agent_count=len(tool.agent_links),
    )


@router.delete("/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tool(
    tool_id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Delete a tool definition."""
    result = await db.execute(
        select(ToolDefinition).where(ToolDefinition.id == tool_id)
    )
    tool = result.scalar_one_or_none()

    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found",
        )

    await db.delete(tool)
    await db.commit()
