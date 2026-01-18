# Backend Implementation Guide

**Document:** Implementation Guide - FastAPI Backend
**Project:** The Transparent Core
**Stack:** Python 3.11+, FastAPI, Pydantic-AI, SQLModel, PostgreSQL (pgvector)

---

## 1. Project Structure

```bash
apps/ai-service/
├── src/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry
│   ├── config.py               # Settings management
│   │
│   ├── database/
│   │   ├── __init__.py
│   │   ├── connection.py       # Database connection
│   │   └── models.py           # SQLModel schemas
│   │
│   ├── agent/
│   │   ├── __init__.py
│   │   ├── factory.py          # Dynamic agent builder
│   │   ├── registry.py         # Tool registry
│   │   └── tools/
│   │       ├── __init__.py
│   │       ├── search.py       # Search tools
│   │       └── info.py         # Info retrieval tools
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── schemas.py          # Pydantic request/response schemas
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── chat.py         # Chat endpoints
│   │       └── admin.py        # Admin endpoints (optional)
│   │
│   └── services/
│       ├── __init__.py
│       └── knowledge.py        # RAG/Knowledge management
│
├── alembic/                    # Database migrations
│   ├── versions/
│   ├── env.py
│   └── alembic.ini
│
├── tests/
│   ├── __init__.py
│   ├── test_chat.py
│   └── test_tools.py
│
├── scripts/
│   └── seed_data.py            # Initial data seeding
│
├── requirements.txt
├── pyproject.toml
└── Dockerfile
```

---

## 2. Configuration

### 2.1. Settings Management

```python
# src/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database
    database_url: str = "postgresql://localhost:5432/ai_agent_db"

    # AI
    gemini_api_key: str = ""
    default_model_provider: str = "google-gla"
    default_model_name: str = "gemini-1.5-flash"

    # Application
    debug: bool = False
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3333"]


settings = Settings()
```

---

## 3. Database Layer

### 3.1. Connection Manager

> **⚠️ CRITICAL: Async Database Access**
>
> FastAPI endpoints using `async def` MUST use `AsyncSession` to avoid blocking the event loop.
> Using sync `Session` inside async functions will block ALL concurrent requests!

```python
# src/database/connection.py
from sqlmodel import SQLModel
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
from sqlmodel import create_engine, Session

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
```

### 3.2. Database Models

```python
# src/database/models.py
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column


# ==========================================
# Agent Configuration Tables
# ==========================================

class AgentConfig(SQLModel, table=True):
    """Configuration for AI agent instances."""

    __tablename__ = "agent_configs"

    id: Optional[int] = Field(default=None, primary_key=True)
    slug: str = Field(unique=True, index=True)  # e.g., "portfolio-assistant"
    name: str
    model_provider: str = "google-gla"
    model_name: str = "gemini-1.5-flash"
    system_prompt: str
    temperature: float = 0.7
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    tool_links: list["AgentToolLink"] = Relationship(back_populates="agent")


class ToolDefinition(SQLModel, table=True):
    """Registry of available tools."""

    __tablename__ = "tool_definitions"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)  # Must match function name
    description: str  # For LLM to understand tool purpose
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    agent_links: list["AgentToolLink"] = Relationship(back_populates="tool")


class AgentToolLink(SQLModel, table=True):
    """Many-to-many link between agents and tools."""

    __tablename__ = "agent_tool_links"

    agent_id: int = Field(foreign_key="agent_configs.id", primary_key=True)
    tool_id: int = Field(foreign_key="tool_definitions.id", primary_key=True)

    # Relationships
    agent: AgentConfig = Relationship(back_populates="tool_links")
    tool: ToolDefinition = Relationship(back_populates="agent_links")


# ==========================================
# Chat & Memory Tables
# ==========================================

class ChatSession(SQLModel, table=True):
    """Chat session for conversation tracking."""

    __tablename__ = "chat_sessions"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(unique=True, index=True)  # UUID
    agent_slug: str = Field(index=True)
    user_identifier: Optional[str] = None  # Optional user tracking
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    messages: list["ChatMessage"] = Relationship(back_populates="session")


class ChatMessage(SQLModel, table=True):
    """Individual chat messages."""

    __tablename__ = "chat_messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="chat_sessions.id", index=True)
    role: str  # "user" | "assistant" | "system"
    content: str
    tool_calls: Optional[str] = None  # JSON string of tool calls
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    session: ChatSession = Relationship(back_populates="messages")


# ==========================================
# Knowledge Base Tables (RAG)
# ==========================================

class KnowledgeDocument(SQLModel, table=True):
    """Documents for RAG knowledge base."""

    __tablename__ = "knowledge_documents"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str
    source: str  # "cv", "project", "manual"
    metadata: Optional[str] = None  # JSON metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    chunks: list["KnowledgeChunk"] = Relationship(back_populates="document")


class KnowledgeChunk(SQLModel, table=True):
    """Chunked content with vector embeddings."""

    __tablename__ = "knowledge_chunks"

    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: int = Field(foreign_key="knowledge_documents.id", index=True)
    content: str
    embedding: list[float] = Field(sa_column=Column(Vector(768)))  # Gemini embedding size
    chunk_index: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    document: KnowledgeDocument = Relationship(back_populates="chunks")
```

---

## 4. Agent System

### 4.1. Tool Registry

```python
# src/agent/registry.py
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
```

### 4.2. Tool Implementations

> **📝 Note: Tool Database Access**
>
> Tools use **sync** `Session` (not `AsyncSession`) because Pydantic-AI runs
> non-async tools in a threadpool. This is acceptable for V1/MVP.
>
> For V2, consider using `RunContext` dependency injection for cleaner architecture.

```python
# src/agent/tools/search.py
"""Search-related tools for the AI agent."""

from sqlmodel import Session, select
from src.database.connection import sync_engine  # Use sync engine for tools
from src.database.models import KnowledgeChunk, KnowledgeDocument


def search_projects(query: str, limit: int = 5) -> str:
    """
    Search through project descriptions and information.

    Args:
        query: Search query string
        limit: Maximum number of results

    Returns:
        Formatted string of matching projects
    """
    # In production, use vector similarity search
    # For MVP, use simple text matching
    with Session(sync_engine) as session:
        results = session.exec(
            select(KnowledgeDocument)
            .where(KnowledgeDocument.source == "project")
            .where(KnowledgeDocument.content.ilike(f"%{query}%"))
            .limit(limit)
        ).all()

        if not results:
            return "No matching projects found."

        formatted = []
        for doc in results:
            formatted.append(f"- {doc.title}: {doc.content[:200]}...")

        return "\n".join(formatted)


def search_knowledge(query: str, limit: int = 3) -> str:
    """
    Semantic search through knowledge base using vector embeddings.

    Args:
        query: Natural language query
        limit: Maximum number of results

    Returns:
        Relevant knowledge chunks
    """
    # TODO: Implement vector similarity search with pgvector
    # For now, return placeholder
    return f"Knowledge search for: {query}"
```

```python
# src/agent/tools/info.py
"""Information retrieval tools for the AI agent."""


def get_cv_info() -> str:
    """
    Get comprehensive CV/resume information about Thiện.

    Returns:
        Formatted CV information
    """
    return """
    Name: Thiện
    Role: AI Engineer @ Vexere

    Experience:
    - AI/ML system development
    - Data pipeline architecture with PySpark
    - Agentic AI systems and RAG implementations
    - Full-stack development (Python, TypeScript)

    Skills:
    - Languages: Python, TypeScript, SQL
    - AI/ML: Pydantic-AI, LangChain, RAG, Embeddings
    - Data: PySpark, PostgreSQL, pgvector
    - DevOps: Docker, Kubernetes, Terraform
    - Frontend: Next.js, React, Tailwind CSS

    Interests:
    - Homelab & Self-hosting
    - Game Development
    - Music (Guitar, Piano)
    """


def get_contact_info() -> str:
    """
    Get contact information.

    Returns:
        Contact details
    """
    return """
    Email: contact@yourdomain.com
    GitHub: github.com/chithien
    LinkedIn: linkedin.com/in/chithien
    Website: yourdomain.com
    """


def get_tech_stack() -> str:
    """
    Get detailed technology stack information.

    Returns:
        Technology stack details
    """
    return """
    Backend:
    - Python 3.11+ with FastAPI
    - Pydantic-AI for agent orchestration
    - SQLModel + PostgreSQL + pgvector

    Frontend:
    - Next.js 14 with App Router
    - Tailwind CSS + shadcn/ui
    - Framer Motion for animations

    Infrastructure:
    - Docker Compose orchestration
    - Cloudflare Tunnel for secure exposure
    - Self-hosted on homelab
    """


def calculator(expression: str) -> str:
    """
    Evaluate a mathematical expression.

    Args:
        expression: Math expression (e.g., "2 + 2", "10 * 5")

    Returns:
        Calculation result
    """
    try:
        # Safe eval for simple math
        allowed_chars = set("0123456789+-*/.() ")
        if not all(c in allowed_chars for c in expression):
            return "Error: Invalid characters in expression"

        result = eval(expression)
        return f"{expression} = {result}"
    except Exception as e:
        return f"Error calculating: {str(e)}"
```

### 4.3. Agent Factory

```python
# src/agent/factory.py
"""
Dynamic Agent Factory - Builds agents from database configuration.

This allows changing agent behavior (prompt, tools, model) via database
updates without redeploying code.
"""

from pydantic_ai import Agent
from sqlmodel import Session, select
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

from sqlalchemy.ext.asyncio import AsyncSession


class AsyncAgentFactory:
    """Async factory for creating configured AI agents."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def load_agent(self, slug: str) -> Agent:
        """Load and configure an agent by its slug (async)."""
        # 1. Fetch agent configuration
        result = await self.session.exec(
            select(AgentConfig)
            .where(AgentConfig.slug == slug)
            .where(AgentConfig.is_active == True)
        )
        config = result.first()

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
        result = await self.session.exec(
            select(AgentToolLink).where(AgentToolLink.agent_id == agent_id)
        )
        links = result.all()

        tools = []
        for link in links:
            tool_def = await self.session.get(ToolDefinition, link.tool_id)
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
```

---

## 5. API Layer

### 5.1. Request/Response Schemas

```python
# src/api/schemas.py
from pydantic import BaseModel, Field
from datetime import datetime


# ==========================================
# Chat Schemas
# ==========================================

class ChatRequest(BaseModel):
    """Request body for chat endpoint."""
    message: str = Field(..., min_length=1, max_length=4000)
    session_id: str | None = None


class ChatResponse(BaseModel):
    """Response body for chat endpoint."""
    response: str
    session_id: str
    tool_calls: list[str] | None = None


class ChatHistoryItem(BaseModel):
    """Single message in chat history."""
    role: str
    content: str
    timestamp: datetime


class ChatHistoryResponse(BaseModel):
    """Response for chat history endpoint."""
    session_id: str
    messages: list[ChatHistoryItem]


# ==========================================
# Admin Schemas (Optional)
# ==========================================

class AgentConfigCreate(BaseModel):
    """Request body for creating agent config."""
    slug: str
    name: str
    system_prompt: str
    model_provider: str = "google-gla"
    model_name: str = "gemini-1.5-flash"
    temperature: float = 0.7


class AgentConfigResponse(BaseModel):
    """Response for agent config."""
    id: int
    slug: str
    name: str
    is_active: bool


class ToolDefinitionCreate(BaseModel):
    """Request body for creating tool definition."""
    name: str
    description: str


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    database: str
```

### 5.2. Chat Routes

> **⚠️ CRITICAL: Pydantic-AI Message History Format**
>
> Pydantic-AI does NOT accept simple `[{"role": "user", "content": "..."}]` dicts.
> You MUST use `ModelRequest` and `ModelResponse` objects from `pydantic_ai.messages`.

```python
# src/api/routes/chat.py
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from src.database.connection import get_db
from src.database.models import ChatSession, ChatMessage
from src.agent.factory import get_agent_async, AgentNotFoundError
from src.api.schemas import (
    ChatRequest,
    ChatResponse,
    ChatHistoryResponse,
    ChatHistoryItem,
)

# CRITICAL: Import Pydantic-AI message types for history
from pydantic_ai.messages import (
    ModelRequest,
    ModelResponse,
    TextPart,
    UserPromptPart,
)

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/{agent_slug}", response_model=ChatResponse)
async def chat(
    agent_slug: str,
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),  # AsyncSession, not Session!
):
    """
    Send a message to an AI agent and receive a response.

    Args:
        agent_slug: Identifier for the agent (e.g., "portfolio-assistant")
        request: Chat message and optional session ID

    Returns:
        AI response with session tracking
    """
    try:
        # 1. Load agent from database config (async version)
        agent = await get_agent_async(agent_slug, db)
    except AgentNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    # 2. Get or create session (ASYNC)
    session_id = request.session_id or str(uuid.uuid4())
    result = await db.exec(
        select(ChatSession).where(ChatSession.session_id == session_id)
    )
    chat_session = result.first()

    if not chat_session:
        chat_session = ChatSession(
            session_id=session_id,
            agent_slug=agent_slug,
        )
        db.add(chat_session)
        await db.commit()
        await db.refresh(chat_session)

    # 3. Save user message
    user_message = ChatMessage(
        session_id=chat_session.id,
        role="user",
        content=request.message,
    )
    db.add(user_message)
    await db.flush()  # Flush to get ID without committing

    # 4. Load conversation history for context (ASYNC)
    history_result = await db.exec(
        select(ChatMessage)
        .where(ChatMessage.session_id == chat_session.id)
        .order_by(ChatMessage.created_at)
        .limit(20)  # Last 20 messages for context
    )
    history = history_result.all()

    # 5. Convert DB messages to Pydantic-AI format (CRITICAL!)
    context_messages = []
    for msg in history[:-1]:  # Exclude current user message
        if msg.role == "user":
            context_messages.append(
                ModelRequest(parts=[UserPromptPart(content=msg.content)])
            )
        elif msg.role == "assistant":
            context_messages.append(
                ModelResponse(parts=[TextPart(content=msg.content)])
            )

    # 6. Run agent with properly formatted history
    try:
        result = await agent.run(
            request.message,
            message_history=context_messages,
        )
        response_text = result.data

        # Extract tool calls if any
        tool_calls = None
        if result.all_messages():
            tool_calls = [
                str(msg) for msg in result.all_messages()
                if hasattr(msg, 'parts') and any(
                    hasattr(p, 'tool_name') for p in getattr(msg, 'parts', [])
                )
            ]
    except Exception as e:
        response_text = f"I apologize, but I encountered an error: {str(e)}"
        tool_calls = None

    # 7. Save assistant response
    assistant_message = ChatMessage(
        session_id=chat_session.id,
        role="assistant",
        content=response_text,
    )
    db.add(assistant_message)

    # 8. Update session activity and commit
    chat_session.last_activity = datetime.utcnow()
    await db.commit()

    return ChatResponse(
        response=response_text,
        session_id=session_id,
        tool_calls=tool_calls,
    )


@router.get("/{agent_slug}/history/{session_id}", response_model=ChatHistoryResponse)
async def get_history(
    agent_slug: str,
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get chat history for a session."""
    result = await db.exec(
        select(ChatSession)
        .where(ChatSession.session_id == session_id)
        .where(ChatSession.agent_slug == agent_slug)
    )
    chat_session = result.first()

    if not chat_session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages_result = await db.exec(
        select(ChatMessage)
        .where(ChatMessage.session_id == chat_session.id)
        .order_by(ChatMessage.created_at)
    )
    messages = messages_result.all()

    return ChatHistoryResponse(
        session_id=session_id,
        messages=[
            ChatHistoryItem(
                role=msg.role,
                content=msg.content,
                timestamp=msg.created_at,
            )
            for msg in messages
        ],
    )
```

### 5.3. Main Application

```python
# src/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config import settings
from src.database.connection import init_db  # Now async!
from src.api.routes import chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup - now async
    await init_db()
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
```

---

## 6. Database Seeding

```python
# scripts/seed_data.py
"""
Seed initial data into the database.
Run this after first deployment to set up default agent and tools.
"""

from sqlmodel import Session
from src.database.connection import engine
from src.database.models import AgentConfig, ToolDefinition, AgentToolLink


def seed_tools(session: Session) -> dict[str, int]:
    """Seed tool definitions and return name->id mapping."""
    tools_data = [
        {
            "name": "search_projects",
            "description": "Search through portfolio projects by keyword",
        },
        {
            "name": "get_cv_info",
            "description": "Get CV and professional experience information",
        },
        {
            "name": "get_contact_info",
            "description": "Get contact and social media information",
        },
        {
            "name": "get_tech_stack",
            "description": "Get detailed technology stack information",
        },
        {
            "name": "calculator",
            "description": "Perform mathematical calculations",
        },
    ]

    tool_ids = {}
    for data in tools_data:
        tool = ToolDefinition(**data)
        session.add(tool)
        session.flush()
        tool_ids[tool.name] = tool.id

    return tool_ids


def seed_agent(session: Session, tool_ids: dict[str, int]) -> None:
    """Seed default portfolio assistant agent."""
    agent = AgentConfig(
        slug="portfolio-assistant",
        name="Portfolio Assistant",
        system_prompt="""You are Thiện's portfolio assistant. You help visitors learn about Thiện's professional background, projects, and technical skills.

Personality:
- Friendly and professional
- Enthusiastic about technology
- Helpful and informative

Guidelines:
- Answer questions about Thiện's experience, skills, and projects
- Be concise but thorough
- If asked about personal opinions, clarify you're an AI assistant
- Use tools to retrieve accurate information when needed
- For contact requests, provide contact information

Knowledge domains:
- AI/ML engineering
- Full-stack development
- Homelab and self-hosting
- Game development
- Music (guitar, piano)
""",
        model_provider="google-gla",
        model_name="gemini-1.5-flash",
        temperature=0.7,
    )
    session.add(agent)
    session.flush()

    # Link tools to agent
    tool_names = [
        "search_projects",
        "get_cv_info",
        "get_contact_info",
        "get_tech_stack",
    ]
    for name in tool_names:
        if name in tool_ids:
            link = AgentToolLink(agent_id=agent.id, tool_id=tool_ids[name])
            session.add(link)


def main():
    """Main seeding function."""
    with Session(engine) as session:
        print("Seeding tools...")
        tool_ids = seed_tools(session)

        print("Seeding agent...")
        seed_agent(session, tool_ids)

        session.commit()
        print("Seeding complete!")


if __name__ == "__main__":
    main()
```

---

## 7. Dependencies & Dockerfile

### 7.1. Requirements

> **⚠️ CRITICAL: Async Drivers Required**
>
> You MUST install `asyncpg` for async PostgreSQL access.
> Without it, `postgresql+asyncpg://` connection strings will fail!

```text
# requirements.txt

# Core Framework
fastapi>=0.109.0
uvicorn[standard]>=0.27.0

# Database
sqlmodel>=0.0.14
sqlalchemy[asyncio]>=2.0.25
asyncpg>=0.29.0          # CRITICAL: Async PostgreSQL driver
psycopg2-binary>=2.9.9   # Sync driver (for tools/migrations)

# Vector Search (RAG)
pgvector>=0.2.4

# AI/Agent
pydantic-ai>=0.0.10
google-generativeai>=0.3.2  # For Gemini models

# Utilities
pydantic-settings>=2.1.0
python-dotenv>=1.0.0
alembic>=1.13.1

# Development
pytest>=8.0.0
pytest-asyncio>=0.23.0
httpx>=0.26.0            # For async test client
ruff>=0.1.14
mypy>=1.8.0
```

### 7.2. Dockerfile

```dockerfile
# apps/ai-service/Dockerfile
FROM python:3.11-slim AS base

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Development stage
FROM base AS development
COPY . .
ENV PYTHONPATH=/app
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]

# Production stage
FROM base AS production
COPY src/ ./src/
COPY scripts/ ./scripts/
ENV PYTHONPATH=/app
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 8. Alembic Migration Setup

```bash
# Initialize alembic
cd apps/ai-service
alembic init alembic
```

Update `alembic/env.py`:

```python
# alembic/env.py
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from src.config import settings
from src.database.models import SQLModel

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = SQLModel.metadata

# ... rest of alembic env.py
```

Create initial migration:

```bash
alembic revision --autogenerate -m "Initial tables"
alembic upgrade head
```

---

## 9. Testing

```python
# tests/test_chat.py
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


def test_health_check():
    """Test health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_chat_endpoint():
    """Test chat endpoint with mock agent."""
    response = client.post(
        "/api/chat/portfolio-assistant",
        json={"message": "Hello, who are you?"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "session_id" in data
```

---

## Next Steps

- **[03-infrastructure-setup.md](./03-infrastructure-setup.md)** - Docker & Deployment
- **[05-api-specification.md](./05-api-specification.md)** - Full API documentation
