"""Integration tests for auth API endpoints."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.models import AdminUser
from src.services.auth import AuthService


class TestLoginEndpoint:
    """Tests for POST /api/admin/auth/login."""

    @pytest.mark.asyncio
    async def test_login_success(self, async_client: AsyncClient, async_session: AsyncSession):
        """Login should succeed with correct credentials and set cookies."""
        # Create test admin
        await AuthService.create_admin(async_session, "logintest", "password123")

        response = await async_client.post(
            "/api/admin/auth/login",
            json={"username": "logintest", "password": "password123"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Login successful"

        # Check cookies are set
        assert "access_token" in response.cookies
        assert "refresh_token" in response.cookies

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, async_client: AsyncClient, async_session: AsyncSession):
        """Login should fail with wrong password."""
        await AuthService.create_admin(async_session, "logintest2", "password123")

        response = await async_client.post(
            "/api/admin/auth/login",
            json={"username": "logintest2", "password": "wrongpassword"}
        )

        assert response.status_code == 401
        data = response.json()
        assert data["detail"] == "Invalid username or password"

    @pytest.mark.asyncio
    async def test_login_user_not_found(self, async_client: AsyncClient):
        """Login should fail for non-existent user."""
        response = await async_client.post(
            "/api/admin/auth/login",
            json={"username": "nonexistent", "password": "anypassword"}
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_login_missing_credentials(self, async_client: AsyncClient):
        """Login should fail with missing credentials."""
        response = await async_client.post(
            "/api/admin/auth/login",
            json={}
        )

        assert response.status_code == 422  # Validation error


class TestLogoutEndpoint:
    """Tests for POST /api/admin/auth/logout."""

    @pytest.mark.asyncio
    async def test_logout_clears_cookies(self, async_client: AsyncClient):
        """Logout should clear authentication cookies."""
        response = await async_client.post("/api/admin/auth/logout")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Logout successful"


class TestRefreshEndpoint:
    """Tests for POST /api/admin/auth/refresh."""

    @pytest.mark.asyncio
    async def test_refresh_token_success(
        self,
        async_client: AsyncClient,
        test_admin: AdminUser,
        admin_tokens: dict
    ):
        """Refresh should succeed with valid refresh token."""
        # Set refresh token cookie
        async_client.cookies.set("refresh_token", admin_tokens["refresh_token"])

        response = await async_client.post("/api/admin/auth/refresh")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Token refreshed"
        assert "access_token" in response.cookies

    @pytest.mark.asyncio
    async def test_refresh_without_token(self, async_client: AsyncClient):
        """Refresh should fail without refresh token."""
        response = await async_client.post("/api/admin/auth/refresh")

        assert response.status_code == 401
        data = response.json()
        assert data["detail"] == "No refresh token provided"

    @pytest.mark.asyncio
    async def test_refresh_invalid_token(self, async_client: AsyncClient):
        """Refresh should fail with invalid refresh token."""
        async_client.cookies.set("refresh_token", "invalid.token.here")

        response = await async_client.post("/api/admin/auth/refresh")

        assert response.status_code == 401


class TestMeEndpoint:
    """Tests for GET /api/admin/auth/me."""

    @pytest.mark.asyncio
    async def test_me_success(
        self,
        async_client: AsyncClient,
        test_admin: AdminUser,
        admin_tokens: dict
    ):
        """Me endpoint should return admin info when authenticated."""
        async_client.cookies.set("access_token", admin_tokens["access_token"])

        response = await async_client.get("/api/admin/auth/me")

        assert response.status_code == 200
        data = response.json()
        assert data["username"] == test_admin.username
        assert "authenticated_at" in data
        assert "id" in data

    @pytest.mark.asyncio
    async def test_me_without_token(self, async_client: AsyncClient):
        """Me endpoint should fail without authentication."""
        response = await async_client.get("/api/admin/auth/me")

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_me_invalid_token(self, async_client: AsyncClient):
        """Me endpoint should fail with invalid token."""
        async_client.cookies.set("access_token", "invalid.token.here")

        response = await async_client.get("/api/admin/auth/me")

        assert response.status_code == 401


class TestChangePasswordEndpoint:
    """Tests for POST /api/admin/auth/change-password."""

    @pytest.mark.asyncio
    async def test_change_password_success(
        self,
        async_client: AsyncClient,
        async_session: AsyncSession,
        test_admin: AdminUser,
        admin_tokens: dict
    ):
        """Change password should succeed with correct current password."""
        async_client.cookies.set("access_token", admin_tokens["access_token"])

        response = await async_client.post(
            "/api/admin/auth/change-password",
            json={
                "current_password": "testpassword123",
                "new_password": "newpassword456"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Password changed successfully"

        # Verify new password works
        admin = await AuthService.authenticate_admin(
            async_session,
            test_admin.username,
            "newpassword456"
        )
        assert admin is not None

    @pytest.mark.asyncio
    async def test_change_password_wrong_current(
        self,
        async_client: AsyncClient,
        test_admin: AdminUser,
        admin_tokens: dict
    ):
        """Change password should fail with wrong current password."""
        async_client.cookies.set("access_token", admin_tokens["access_token"])

        response = await async_client.post(
            "/api/admin/auth/change-password",
            json={
                "current_password": "wrongpassword",
                "new_password": "newpassword456"
            }
        )

        assert response.status_code == 400
        data = response.json()
        assert data["detail"] == "Current password is incorrect"

    @pytest.mark.asyncio
    async def test_change_password_short_new_password(
        self,
        async_client: AsyncClient,
        test_admin: AdminUser,
        admin_tokens: dict
    ):
        """Change password should fail with short new password."""
        async_client.cookies.set("access_token", admin_tokens["access_token"])

        response = await async_client.post(
            "/api/admin/auth/change-password",
            json={
                "current_password": "testpassword123",
                "new_password": "short"
            }
        )

        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_change_password_without_auth(self, async_client: AsyncClient):
        """Change password should fail without authentication."""
        response = await async_client.post(
            "/api/admin/auth/change-password",
            json={
                "current_password": "anypassword",
                "new_password": "newpassword456"
            }
        )

        assert response.status_code == 401


class TestProtectedEndpoints:
    """Tests for authentication on protected admin endpoints."""

    @pytest.mark.asyncio
    async def test_agents_list_requires_auth(self, async_client: AsyncClient):
        """Agents list endpoint should require authentication."""
        response = await async_client.get("/api/admin/agents")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_tools_list_requires_auth(self, async_client: AsyncClient):
        """Tools list endpoint should require authentication."""
        response = await async_client.get("/api/admin/tools")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_knowledge_list_requires_auth(self, async_client: AsyncClient):
        """Knowledge list endpoint should require authentication."""
        response = await async_client.get("/api/admin/knowledge")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_sessions_list_requires_auth(self, async_client: AsyncClient):
        """Sessions list endpoint should require authentication."""
        response = await async_client.get("/api/admin/sessions")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_dashboard_stats_requires_auth(self, async_client: AsyncClient):
        """Dashboard stats endpoint should require authentication."""
        response = await async_client.get("/api/admin/dashboard/stats")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_protected_endpoint_with_valid_token(
        self,
        async_client: AsyncClient,
        test_admin: AdminUser,
        admin_tokens: dict
    ):
        """Protected endpoints should work with valid token."""
        async_client.cookies.set("access_token", admin_tokens["access_token"])

        response = await async_client.get("/api/admin/agents")
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_protected_endpoint_with_bearer_header(
        self,
        async_client: AsyncClient,
        test_admin: AdminUser,
        admin_tokens: dict
    ):
        """Protected endpoints should work with Bearer token header."""
        response = await async_client.get(
            "/api/admin/agents",
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"}
        )
        assert response.status_code == 200
