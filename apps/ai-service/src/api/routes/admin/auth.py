"""Admin authentication endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps.auth import CurrentAdmin
from src.api.schemas.admin import (
    AdminInfo,
    ChangePasswordRequest,
    ChangePasswordResponse,
    LoginRequest,
    LoginResponse,
)
from src.config import settings
from src.database.connection import get_db
from src.database.models import AdminUser
from src.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["admin-auth"])


@router.post("/login", response_model=LoginResponse)
async def login(
    request: Request,
    response: Response,
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Admin login endpoint.

    Authenticates admin and sets httpOnly cookies for access and refresh tokens.
    """
    # Authenticate against database
    admin = await AuthService.authenticate_admin(
        db, credentials.username, credentials.password
    )
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    # Create tokens with admin_id
    token_data = {
        "sub": admin.username,
        "admin_id": admin.id,
        "authenticated_at": datetime.now(timezone.utc).isoformat(),
    }
    access_token = AuthService.create_access_token(token_data)
    refresh_token = AuthService.create_refresh_token(token_data)

    # Set cookies
    is_production = not settings.debug
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=settings.jwt_access_token_expire_minutes * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=settings.jwt_refresh_token_expire_days * 24 * 60 * 60,
    )

    return LoginResponse(success=True, message="Login successful")


@router.post("/logout", response_model=LoginResponse)
async def logout(response: Response):
    """
    Admin logout endpoint.

    Clears authentication cookies.
    """
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return LoginResponse(success=True, message="Logout successful")


@router.post("/refresh", response_model=LoginResponse)
async def refresh_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """
    Refresh access token using refresh token.
    """
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token provided",
        )

    payload = AuthService.verify_token(refresh_token, "refresh")
    if not payload:
        response.delete_cookie(key="access_token")
        response.delete_cookie(key="refresh_token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    # Verify admin still exists and is active
    admin_id = payload.get("admin_id")
    if admin_id:
        admin = await AuthService.get_admin_by_id(db, admin_id)
        if not admin:
            response.delete_cookie(key="access_token")
            response.delete_cookie(key="refresh_token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Admin user not found or inactive",
            )

    # Create new access token
    token_data = {
        "sub": payload["sub"],
        "admin_id": payload.get("admin_id"),
        "authenticated_at": payload.get(
            "authenticated_at", datetime.now(timezone.utc).isoformat()
        ),
    }
    new_access_token = AuthService.create_access_token(token_data)

    # Set new access token cookie
    is_production = not settings.debug
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=settings.jwt_access_token_expire_minutes * 60,
    )

    return LoginResponse(success=True, message="Token refreshed")


@router.get("/me", response_model=AdminInfo)
async def get_current_admin_info(admin: CurrentAdmin):
    """
    Get current admin information.

    Requires valid authentication.
    """
    # Get authenticated_at from token payload
    payload = getattr(admin, "_token_payload", {})
    authenticated_at_str = payload.get("authenticated_at")
    authenticated_at = (
        datetime.fromisoformat(authenticated_at_str)
        if authenticated_at_str
        else datetime.now(timezone.utc)
    )

    return AdminInfo(
        id=admin.id,
        username=admin.username,
        authenticated_at=authenticated_at,
        last_login=admin.last_login,
    )


@router.post("/change-password", response_model=ChangePasswordResponse)
async def change_password(
    password_data: ChangePasswordRequest,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """
    Change admin password.

    Requires current password for verification.
    """
    # Verify current password
    if not AuthService.verify_password(password_data.current_password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    # Update password
    await AuthService.change_password(db, admin, password_data.new_password)

    return ChangePasswordResponse(
        success=True,
        message="Password changed successfully",
    )
