"""Authentication service with JWT and bcrypt."""

from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from src.config import settings
from src.database.models import AdminUser


class AuthService:
    """Service for authentication operations."""

    @staticmethod
    def verify_password(plain_password: str, password_hash: str) -> bool:
        """Verify password against bcrypt hash."""
        try:
            return bcrypt.checkpw(
                plain_password.encode("utf-8"),
                password_hash.encode("utf-8"),
            )
        except Exception:
            return False

    @staticmethod
    def hash_password(password: str) -> str:
        """Generate bcrypt hash for a password."""
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    @staticmethod
    def create_access_token(
        data: dict, expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT access token."""
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + (
            expires_delta
            or timedelta(minutes=settings.jwt_access_token_expire_minutes)
        )
        to_encode.update({"exp": expire, "type": "access"})
        return jwt.encode(
            to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
        )

    @staticmethod
    def create_refresh_token(data: dict) -> str:
        """Create JWT refresh token."""
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(
            days=settings.jwt_refresh_token_expire_days
        )
        to_encode.update({"exp": expire, "type": "refresh"})
        return jwt.encode(
            to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
        )

    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> Optional[dict]:
        """Verify JWT token and return payload."""
        try:
            payload = jwt.decode(
                token,
                settings.jwt_secret_key,
                algorithms=[settings.jwt_algorithm],
            )
            if payload.get("type") != token_type:
                return None
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.PyJWTError:
            return None

    @staticmethod
    async def get_admin_by_username(db: AsyncSession, username: str) -> Optional[AdminUser]:
        """Get admin user by username."""
        statement = select(AdminUser).where(
            AdminUser.username == username,
            AdminUser.is_active == True
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_admin_by_id(db: AsyncSession, admin_id: int) -> Optional[AdminUser]:
        """Get admin user by ID."""
        statement = select(AdminUser).where(
            AdminUser.id == admin_id,
            AdminUser.is_active == True
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    @staticmethod
    async def authenticate_admin(db: AsyncSession, username: str, password: str) -> Optional[AdminUser]:
        """Authenticate admin user against database."""
        admin = await AuthService.get_admin_by_username(db, username)
        if not admin:
            return None
        if not AuthService.verify_password(password, admin.password_hash):
            return None
        # Update last login
        admin.last_login = datetime.utcnow()
        db.add(admin)
        await db.commit()
        await db.refresh(admin)
        return admin

    @staticmethod
    async def create_admin(db: AsyncSession, username: str, password: str) -> AdminUser:
        """Create a new admin user."""
        admin = AdminUser(
            username=username,
            password_hash=AuthService.hash_password(password),
        )
        db.add(admin)
        await db.commit()
        await db.refresh(admin)
        return admin

    @staticmethod
    async def change_password(db: AsyncSession, admin: AdminUser, new_password: str) -> AdminUser:
        """Change admin password."""
        admin.password_hash = AuthService.hash_password(new_password)
        admin.updated_at = datetime.utcnow()
        db.add(admin)
        await db.commit()
        await db.refresh(admin)
        return admin

    @staticmethod
    async def init_default_admin(db: AsyncSession) -> Optional[AdminUser]:
        """Initialize default admin if no admin exists."""
        # Check if any admin exists
        statement = select(AdminUser)
        result = await db.execute(statement)
        existing = result.scalar_one_or_none()
        if existing:
            return None

        # Create default admin from config
        default_username = settings.admin_username
        default_password = settings.default_admin_password

        if not default_username or not default_password:
            return None

        return await AuthService.create_admin(db, default_username, default_password)
