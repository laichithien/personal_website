"""
Tool Registry - Maps database tool names to actual Python functions.

When adding a new tool:
1. Create the function in src/agent/tools/
2. Add mapping here
3. Insert into database via seed script or admin API
"""

from typing import Callable, Any
from src.agent.tools import portfolio, actions

# Type alias for tool functions
ToolFunction = Callable[..., Any]

# Central registry mapping tool names to implementations
AVAILABLE_TOOLS: dict[str, ToolFunction] = {
    # ===========================================
    # Search Tools (Unified)
    # ===========================================
    "search_profile": portfolio.search_profile,

    # ===========================================
    # Action Tools
    # ===========================================
    "send_cv": actions.send_cv,
    "save_contact": actions.save_contact,
    "schedule_meeting": actions.schedule_meeting,
    "fetch_github_stats": actions.fetch_github_stats,

    # ===========================================
    # Utility Tools
    # ===========================================
    "calculator": actions.calculator,
}


def get_tool(name: str) -> ToolFunction | None:
    """Get tool function by name."""
    return AVAILABLE_TOOLS.get(name)


def list_available_tools() -> list[str]:
    """List all registered tool names."""
    return list(AVAILABLE_TOOLS.keys())
