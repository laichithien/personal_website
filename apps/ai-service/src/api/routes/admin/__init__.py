"""Admin API routes module."""

from fastapi import APIRouter

from src.api.routes.admin import auth, agents, tools, knowledge, sessions, dashboard, portfolio, settings

# Create main admin router
admin_router = APIRouter(prefix="/api/admin", tags=["admin"])

# Include sub-routers
admin_router.include_router(auth.router)
admin_router.include_router(agents.router)
admin_router.include_router(tools.router)
admin_router.include_router(knowledge.router)
admin_router.include_router(sessions.router)
admin_router.include_router(dashboard.router)
admin_router.include_router(portfolio.router)
admin_router.include_router(settings.router)

__all__ = ["admin_router"]
