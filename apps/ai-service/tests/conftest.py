"""Pytest fixtures for testing."""

import asyncio
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlmodel import SQLModel

from src.main import app
from src.database.connection import get_db
from src.database.models import AdminUser
from src.services.auth import AuthService


# Use SQLite for testing (in-memory)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def async_engine():
    """Create async engine for each test."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        future=True,
    )
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def async_session(async_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create async session for each test."""
    async_session_maker = async_sessionmaker(
        async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with async_session_maker() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def async_client(async_session) -> AsyncGenerator[AsyncClient, None]:
    """Create async test client with overridden database dependency."""

    async def override_get_db():
        yield async_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def sync_client() -> Generator[TestClient, None, None]:
    """Create sync test client for simple tests."""
    with TestClient(app) as client:
        yield client


@pytest_asyncio.fixture(scope="function")
async def test_admin(async_session: AsyncSession) -> AdminUser:
    """Create a test admin user."""
    admin = await AuthService.create_admin(
        async_session,
        username="testadmin",
        password="testpassword123"
    )
    return admin


@pytest_asyncio.fixture(scope="function")
async def admin_tokens(async_session: AsyncSession, test_admin: AdminUser) -> dict:
    """Create access and refresh tokens for test admin."""
    from datetime import datetime, timezone

    token_data = {
        "sub": test_admin.username,
        "admin_id": test_admin.id,
        "authenticated_at": datetime.now(timezone.utc).isoformat(),
    }
    access_token = AuthService.create_access_token(token_data)
    refresh_token = AuthService.create_refresh_token(token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
    }
