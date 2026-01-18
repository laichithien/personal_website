"""
Tool Registry - Maps database tool names to actual Python functions.

When adding a new tool:
1. Create the function in src/agent/tools/
2. Add mapping here
3. Insert into database via seed script or admin API
"""

from typing import Callable, Any
from src.agent.tools import search, info

# Type alias for tool functions
ToolFunction = Callable[..., Any]

# Central registry mapping tool names to implementations
AVAILABLE_TOOLS: dict[str, ToolFunction] = {
    # Search tools
    "search_projects": search.search_projects,
    "search_knowledge": search.search_knowledge,

    # Info retrieval tools
    "get_cv_info": info.get_cv_info,
    "get_contact_info": info.get_contact_info,
    "get_tech_stack": info.get_tech_stack,

    # Utility tools
    "calculator": info.calculator,
}


def get_tool(name: str) -> ToolFunction | None:
    """Get tool function by name."""
    return AVAILABLE_TOOLS.get(name)


def list_available_tools() -> list[str]:
    """List all registered tool names."""
    return list(AVAILABLE_TOOLS.keys())
