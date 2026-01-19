"""Unit tests for auth service."""

import pytest
import pytest_asyncio
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from src.services.auth import AuthService
from src.database.models import AdminUser


class TestPasswordHashing:
    """Tests for password hashing functions."""

    def test_hash_password_returns_different_hash_each_time(self):
        """Each call to hash_password should return a different hash (due to salt)."""
        password = "testpassword"
        hash1 = AuthService.hash_password(password)
        hash2 = AuthService.hash_password(password)

        assert hash1 != hash2
        assert hash1.startswith("$2b$")  # bcrypt prefix
        assert hash2.startswith("$2b$")

    def test_verify_password_correct_password(self):
        """verify_password should return True for correct password."""
        password = "testpassword123"
        password_hash = AuthService.hash_password(password)

        assert AuthService.verify_password(password, password_hash) is True

    def test_verify_password_wrong_password(self):
        """verify_password should return False for wrong password."""
        password = "testpassword123"
        password_hash = AuthService.hash_password(password)

        assert AuthService.verify_password("wrongpassword", password_hash) is False

    def test_verify_password_empty_password(self):
        """verify_password should handle empty password."""
        password_hash = AuthService.hash_password("somepassword")

        assert AuthService.verify_password("", password_hash) is False

    def test_verify_password_invalid_hash(self):
        """verify_password should return False for invalid hash."""
        assert AuthService.verify_password("password", "invalid_hash") is False


class TestJWTTokens:
    """Tests for JWT token creation and verification."""

    def test_create_access_token(self):
        """create_access_token should create a valid JWT."""
        data = {"sub": "testuser", "admin_id": 1}
        token = AuthService.create_access_token(data)

        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0

        # Verify the token
        payload = AuthService.verify_token(token, "access")
        assert payload is not None
        assert payload["sub"] == "testuser"
        assert payload["admin_id"] == 1
        assert payload["type"] == "access"

    def test_create_refresh_token(self):
        """create_refresh_token should create a valid JWT."""
        data = {"sub": "testuser", "admin_id": 1}
        token = AuthService.create_refresh_token(data)

        assert token is not None
        assert isinstance(token, str)

        # Verify the token
        payload = AuthService.verify_token(token, "refresh")
        assert payload is not None
        assert payload["sub"] == "testuser"
        assert payload["type"] == "refresh"

    def test_verify_token_wrong_type(self):
        """verify_token should fail when token type doesn't match."""
        data = {"sub": "testuser", "admin_id": 1}
        access_token = AuthService.create_access_token(data)
        refresh_token = AuthService.create_refresh_token(data)

        # Access token should fail when checked as refresh
        assert AuthService.verify_token(access_token, "refresh") is None

        # Refresh token should fail when checked as access
        assert AuthService.verify_token(refresh_token, "access") is None

    def test_verify_token_invalid_token(self):
        """verify_token should return None for invalid token."""
        assert AuthService.verify_token("invalid.token.here", "access") is None
        assert AuthService.verify_token("", "access") is None

    def test_create_access_token_with_custom_expiry(self):
        """create_access_token should accept custom expiry."""
        data = {"sub": "testuser", "admin_id": 1}
        token = AuthService.create_access_token(data, expires_delta=timedelta(hours=1))

        payload = AuthService.verify_token(token, "access")
        assert payload is not None


class TestAdminDatabaseOperations:
    """Tests for admin database operations."""

    @pytest.mark.asyncio
    async def test_create_admin(self, async_session: AsyncSession):
        """create_admin should create an admin in the database."""
        admin = await AuthService.create_admin(
            async_session,
            username="newadmin",
            password="password123"
        )

        assert admin is not None
        assert admin.id is not None
        assert admin.username == "newadmin"
        assert admin.password_hash != "password123"  # Should be hashed
        assert admin.is_active is True
        assert admin.created_at is not None

    @pytest.mark.asyncio
    async def test_get_admin_by_username(self, async_session: AsyncSession, test_admin: AdminUser):
        """get_admin_by_username should return admin if exists."""
        admin = await AuthService.get_admin_by_username(async_session, test_admin.username)

        assert admin is not None
        assert admin.username == test_admin.username

    @pytest.mark.asyncio
    async def test_get_admin_by_username_not_found(self, async_session: AsyncSession):
        """get_admin_by_username should return None if not found."""
        admin = await AuthService.get_admin_by_username(async_session, "nonexistent")

        assert admin is None

    @pytest.mark.asyncio
    async def test_get_admin_by_id(self, async_session: AsyncSession, test_admin: AdminUser):
        """get_admin_by_id should return admin if exists."""
        admin = await AuthService.get_admin_by_id(async_session, test_admin.id)

        assert admin is not None
        assert admin.id == test_admin.id

    @pytest.mark.asyncio
    async def test_get_admin_by_id_not_found(self, async_session: AsyncSession):
        """get_admin_by_id should return None if not found."""
        admin = await AuthService.get_admin_by_id(async_session, 9999)

        assert admin is None

    @pytest.mark.asyncio
    async def test_authenticate_admin_success(self, async_session: AsyncSession):
        """authenticate_admin should return admin for correct credentials."""
        # Create admin with known password
        await AuthService.create_admin(async_session, "authtest", "correctpassword")

        admin = await AuthService.authenticate_admin(
            async_session,
            username="authtest",
            password="correctpassword"
        )

        assert admin is not None
        assert admin.username == "authtest"
        assert admin.last_login is not None  # Should be updated

    @pytest.mark.asyncio
    async def test_authenticate_admin_wrong_password(self, async_session: AsyncSession):
        """authenticate_admin should return None for wrong password."""
        await AuthService.create_admin(async_session, "authtest2", "correctpassword")

        admin = await AuthService.authenticate_admin(
            async_session,
            username="authtest2",
            password="wrongpassword"
        )

        assert admin is None

    @pytest.mark.asyncio
    async def test_authenticate_admin_user_not_found(self, async_session: AsyncSession):
        """authenticate_admin should return None for non-existent user."""
        admin = await AuthService.authenticate_admin(
            async_session,
            username="nonexistent",
            password="anypassword"
        )

        assert admin is None

    @pytest.mark.asyncio
    async def test_change_password(self, async_session: AsyncSession, test_admin: AdminUser):
        """change_password should update the password hash."""
        old_hash = test_admin.password_hash

        updated_admin = await AuthService.change_password(
            async_session,
            test_admin,
            "newpassword456"
        )

        assert updated_admin.password_hash != old_hash
        assert AuthService.verify_password("newpassword456", updated_admin.password_hash)
        assert not AuthService.verify_password("testpassword123", updated_admin.password_hash)

    @pytest.mark.asyncio
    async def test_init_default_admin_creates_admin(self, async_session: AsyncSession):
        """init_default_admin should create admin if none exists."""
        # Ensure no admin exists first (clean session)
        admin = await AuthService.init_default_admin(async_session)

        assert admin is not None
        assert admin.username == "admin"  # From default config

    @pytest.mark.asyncio
    async def test_init_default_admin_skips_if_exists(self, async_session: AsyncSession, test_admin: AdminUser):
        """init_default_admin should return None if admin already exists."""
        admin = await AuthService.init_default_admin(async_session)

        assert admin is None  # Should not create another admin
