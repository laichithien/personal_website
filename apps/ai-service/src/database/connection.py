from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from contextlib import asynccontextmanager
from src.config import settings

# IMPORTANT: Use async driver (postgresql+asyncpg)
DATABASE_URL = settings.database_url.replace(
    "postgresql://", "postgresql+asyncpg://"
)

# Create async engine with connection pool
async_engine = create_async_engine(
    DATABASE_URL,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

# Session factory
async_session_maker = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db() -> None:
    """Initialize database tables (run once at startup)."""
    async with async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


@asynccontextmanager
async def get_session():
    """Async context manager for database sessions."""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# Dependency for FastAPI (async)
async def get_db():
    """FastAPI dependency for async database session."""
    async with async_session_maker() as session:
        yield session


# ==========================================
# Sync session for tools (runs in threadpool)
# ==========================================

sync_engine = create_engine(
    settings.database_url,  # Use sync driver (postgresql://)
    echo=settings.debug,
    pool_pre_ping=True,
    pool_size=3,
    max_overflow=5,
)


def get_sync_session():
    """Sync session for tools that run in threadpool."""
    with Session(sync_engine) as session:
        yield session
