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
    model_provider: str = "openai"  # OpenRouter uses OpenAI-compatible API
    model_name: str = "xiaomi/mimo-v2-flash:free"
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
