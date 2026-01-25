"""Admin system settings endpoints."""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps.auth import CurrentAdmin
from src.api.schemas.admin import (
    SystemSettingCreate,
    SystemSettingResponse,
    SystemSettingUpdate,
)
from src.database.connection import get_db
from src.database.models import SystemSetting

router = APIRouter(prefix="/settings", tags=["admin-settings"])

# Define known settings with their defaults and descriptions
KNOWN_SETTINGS = {
    "resume_url": {
        "description": "URL to download CV/Resume (PDF)",
        "is_sensitive": False,
        "default": "",
    },
    "calendly_link": {
        "description": "Calendly link for scheduling meetings",
        "is_sensitive": False,
        "default": "",
    },
    "github_username": {
        "description": "GitHub username for profile stats",
        "is_sensitive": False,
        "default": "",
    },
    "github_token": {
        "description": "GitHub personal access token for API requests (optional, for higher rate limits)",
        "is_sensitive": True,
        "default": "",
    },
}


def _mask_sensitive_value(value: str) -> str:
    """Mask sensitive values for display."""
    if len(value) <= 4:
        return "****"
    return value[:2] + "*" * (len(value) - 4) + value[-2:]


@router.get("", response_model=list[SystemSettingResponse])
async def list_settings(
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """List all system settings."""
    result = await db.execute(select(SystemSetting))
    settings = list(result.scalars().all())

    # Add any missing known settings with defaults
    existing_keys = {s.key for s in settings}
    for key, info in KNOWN_SETTINGS.items():
        if key not in existing_keys:
            # Return virtual setting with default
            settings.append(
                SystemSetting(
                    id=0,  # Virtual, not in DB
                    key=key,
                    value=info["default"],
                    description=info["description"],
                    is_sensitive=info["is_sensitive"],
                    updated_at=datetime.utcnow(),
                )
            )

    return [
        SystemSettingResponse(
            id=s.id,
            key=s.key,
            value=_mask_sensitive_value(s.value) if s.is_sensitive and s.value else s.value,
            description=s.description,
            is_sensitive=s.is_sensitive,
            updated_at=s.updated_at,
        )
        for s in settings
    ]


@router.get("/{key}", response_model=SystemSettingResponse)
async def get_setting(
    key: str,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific system setting."""
    result = await db.execute(
        select(SystemSetting).where(SystemSetting.key == key)
    )
    setting = result.scalar_one_or_none()

    if not setting:
        # Check if it's a known setting
        if key in KNOWN_SETTINGS:
            info = KNOWN_SETTINGS[key]
            return SystemSettingResponse(
                id=0,
                key=key,
                value=info["default"],
                description=info["description"],
                is_sensitive=info["is_sensitive"],
                updated_at=datetime.utcnow(),
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Setting not found",
        )

    return SystemSettingResponse(
        id=setting.id,
        key=setting.key,
        value=_mask_sensitive_value(setting.value) if setting.is_sensitive and setting.value else setting.value,
        description=setting.description,
        is_sensitive=setting.is_sensitive,
        updated_at=setting.updated_at,
    )


@router.put("/{key}", response_model=SystemSettingResponse)
async def upsert_setting(
    key: str,
    data: SystemSettingUpdate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Create or update a system setting."""
    result = await db.execute(
        select(SystemSetting).where(SystemSetting.key == key)
    )
    setting = result.scalar_one_or_none()

    if setting:
        # Update existing
        if data.value is not None:
            setting.value = data.value
        if data.description is not None:
            setting.description = data.description
        if data.is_sensitive is not None:
            setting.is_sensitive = data.is_sensitive
        setting.updated_at = datetime.utcnow()
    else:
        # Create new
        # Get defaults from known settings if available
        defaults = KNOWN_SETTINGS.get(key, {})

        setting = SystemSetting(
            key=key,
            value=data.value if data.value is not None else defaults.get("default", ""),
            description=data.description if data.description is not None else defaults.get("description", ""),
            is_sensitive=data.is_sensitive if data.is_sensitive is not None else defaults.get("is_sensitive", False),
            updated_at=datetime.utcnow(),
        )
        db.add(setting)

    await db.commit()
    await db.refresh(setting)

    return SystemSettingResponse(
        id=setting.id,
        key=setting.key,
        value=_mask_sensitive_value(setting.value) if setting.is_sensitive and setting.value else setting.value,
        description=setting.description,
        is_sensitive=setting.is_sensitive,
        updated_at=setting.updated_at,
    )


@router.post("", response_model=SystemSettingResponse, status_code=status.HTTP_201_CREATED)
async def create_setting(
    data: SystemSettingCreate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Create a new system setting."""
    # Check for duplicate key
    result = await db.execute(
        select(SystemSetting).where(SystemSetting.key == data.key)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Setting with this key already exists",
        )

    setting = SystemSetting(
        key=data.key,
        value=data.value,
        description=data.description,
        is_sensitive=data.is_sensitive,
        updated_at=datetime.utcnow(),
    )
    db.add(setting)
    await db.commit()
    await db.refresh(setting)

    return SystemSettingResponse(
        id=setting.id,
        key=setting.key,
        value=_mask_sensitive_value(setting.value) if setting.is_sensitive and setting.value else setting.value,
        description=setting.description,
        is_sensitive=setting.is_sensitive,
        updated_at=setting.updated_at,
    )


@router.delete("/{key}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_setting(
    key: str,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Delete a system setting."""
    result = await db.execute(
        select(SystemSetting).where(SystemSetting.key == key)
    )
    setting = result.scalar_one_or_none()

    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Setting not found",
        )

    await db.delete(setting)
    await db.commit()
