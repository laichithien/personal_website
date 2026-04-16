"""
Tool Registry - action-oriented tools only.

Profile/portfolio context is injected directly into the prompt at request time,
so tools here should be reserved for side effects or external actions.
"""

from typing import Callable, Any
from src.agent.tools import actions

# Type alias for tool functions
ToolFunction = Callable[..., Any]

# Central registry mapping tool names to implementations
AVAILABLE_TOOLS: dict[str, ToolFunction] = {
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
