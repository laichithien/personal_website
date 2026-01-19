import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config import settings
from src.database.connection import init_db, async_session_maker
from src.api.routes import chat, portfolio
from src.api.routes.admin import admin_router
from src.services.auth import AuthService

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    await init_db()

    # Initialize default admin user if not exists
    async with async_session_maker() as db:
        admin = await AuthService.init_default_admin(db)
        if admin:
            logger.info(f"Created default admin user: {admin.username}")
        else:
            logger.info("Admin user already exists or not configured")

    yield
    # Shutdown
    pass


app = FastAPI(
    title="The Transparent Core - AI Service",
    description="AI Agent backend for portfolio website",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router)
app.include_router(portfolio.router)
app.include_router(admin_router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "0.1.0",
    }


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": "The Transparent Core - AI Service",
        "version": "0.1.0",
        "docs": "/docs",
    }
