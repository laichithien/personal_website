"""
Dynamic Agent Factory - Builds agents from database configuration.

This allows changing agent behavior (prompt, tools, model) via database
updates without redeploying code.
"""

from pydantic_ai import Agent
from sqlmodel import Session, select
from sqlalchemy.ext.asyncio import AsyncSession
from src.database.models import AgentConfig, AgentToolLink, ToolDefinition
from src.agent.registry import get_tool, ToolFunction


class AgentNotFoundError(Exception):
    """Raised when agent configuration is not found."""
    pass


class AgentFactory:
    """Factory for creating configured AI agents."""

    def __init__(self, session: Session):
        self.session = session

    def load_agent(self, slug: str) -> Agent:
        """
        Load and configure an agent by its slug.

        Args:
            slug: Unique identifier for the agent (e.g., "portfolio-assistant")

        Returns:
            Configured Pydantic-AI Agent instance

        Raises:
            AgentNotFoundError: If agent config not found or inactive
        """
        # 1. Fetch agent configuration
        config = self.session.exec(
            select(AgentConfig)
            .where(AgentConfig.slug == slug)
            .where(AgentConfig.is_active == True)
        ).first()

        if not config:
            raise AgentNotFoundError(f"Agent '{slug}' not found or inactive")

        # 2. Fetch assigned tools
        tools = self._load_agent_tools(config.id)

        # 3. Build and return agent
        return Agent(
            model=f"{config.model_provider}:{config.model_name}",
            system_prompt=config.system_prompt,
            tools=tools,
        )

    def _load_agent_tools(self, agent_id: int) -> list[ToolFunction]:
        """Load tool functions assigned to an agent."""
        # Get tool links
        links = self.session.exec(
            select(AgentToolLink).where(AgentToolLink.agent_id == agent_id)
        ).all()

        tools = []
        for link in links:
            # Get tool definition
            tool_def = self.session.get(ToolDefinition, link.tool_id)
            if tool_def and tool_def.is_active:
                # Map to actual function
                tool_fn = get_tool(tool_def.name)
                if tool_fn:
                    tools.append(tool_fn)

        return tools


def get_agent(slug: str, session: Session) -> Agent:
    """
    Convenience function to get a configured agent (sync version).

    Args:
        slug: Agent identifier
        session: Database session

    Returns:
        Configured Agent instance
    """
    factory = AgentFactory(session)
    return factory.load_agent(slug)


# ==========================================
# Async Factory (for use with AsyncSession)
# ==========================================

class AsyncAgentFactory:
    """Async factory for creating configured AI agents."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def load_agent(self, slug: str) -> Agent:
        """Load and configure an agent by its slug (async)."""
        # 1. Fetch agent configuration
        result = await self.session.execute(
            select(AgentConfig)
            .where(AgentConfig.slug == slug)
            .where(AgentConfig.is_active == True)
        )
        config = result.scalar_one_or_none()

        if not config:
            raise AgentNotFoundError(f"Agent '{slug}' not found or inactive")

        # 2. Fetch assigned tools
        tools = await self._load_agent_tools(config.id)

        # 3. Build and return agent
        return Agent(
            model=f"{config.model_provider}:{config.model_name}",
            system_prompt=config.system_prompt,
            tools=tools,
        )

    async def _load_agent_tools(self, agent_id: int) -> list[ToolFunction]:
        """Load tool functions assigned to an agent (async)."""
        result = await self.session.execute(
            select(AgentToolLink).where(AgentToolLink.agent_id == agent_id)
        )
        links = result.scalars().all()

        tools = []
        for link in links:
            result = await self.session.execute(
                select(ToolDefinition).where(ToolDefinition.id == link.tool_id)
            )
            tool_def = result.scalar_one_or_none()
            if tool_def and tool_def.is_active:
                tool_fn = get_tool(tool_def.name)
                if tool_fn:
                    tools.append(tool_fn)

        return tools


async def get_agent_async(slug: str, session: AsyncSession) -> Agent:
    """
    Async convenience function to get a configured agent.

    Args:
        slug: Agent identifier
        session: Async database session

    Returns:
        Configured Agent instance
    """
    factory = AsyncAgentFactory(session)
    return await factory.load_agent(slug)
