from datetime import datetime
from typing import Any, Optional
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel, Relationship
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, JSON


# ==========================================
# Admin User Table
# ==========================================

class AdminUser(SQLModel, table=True):
    """Admin user for authentication."""

    __tablename__ = "admin_users"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    password_hash: str  # bcrypt hashed password
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None


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
    session_id: UUID = Field(default_factory=uuid4, unique=True, index=True)
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
    tool_calls: Optional[dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
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
    doc_metadata: Optional[dict[str, Any]] = Field(default=None, sa_column=Column("metadata", JSON))  # JSON metadata
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


# ==========================================
# Portfolio Content Tables
# ==========================================

class PortfolioSetting(SQLModel, table=True):
    """Singleton settings for portfolio content (hero, about, education, social, lifestyle)."""

    __tablename__ = "portfolio_settings"

    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(unique=True, index=True)  # "hero", "about", "education", "social", "lifestyle"
    value: dict[str, Any] = Field(sa_column=Column(JSON))
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PortfolioExperience(SQLModel, table=True):
    """Work experience entries."""

    __tablename__ = "portfolio_experiences"

    id: Optional[int] = Field(default=None, primary_key=True)
    company: str
    role: str
    period: str  # e.g., "Jun 2025 - Present"
    highlights: list[str] = Field(default=[], sa_column=Column(JSON))
    display_order: int = Field(default=0)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PortfolioTechStack(SQLModel, table=True):
    """Tech stack items."""

    __tablename__ = "portfolio_tech_stack"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    icon: str  # Icon identifier
    category: str  # "language", "ai", "backend", "frontend", "database", "devops"
    display_order: int = Field(default=0)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PortfolioProject(SQLModel, table=True):
    """Portfolio project entries."""

    __tablename__ = "portfolio_projects"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    tags: list[str] = Field(default=[], sa_column=Column(JSON))
    image: Optional[str] = None  # Optional image URL
    link: Optional[str] = None  # Optional project URL
    github: Optional[str] = None  # Optional GitHub URL
    is_featured: bool = False
    display_order: int = Field(default=0)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PortfolioPublication(SQLModel, table=True):
    """Academic publications."""

    __tablename__ = "portfolio_publications"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    venue: str  # e.g., "IEEE RIVF 2022"
    doi: Optional[str] = None
    year: int
    display_order: int = Field(default=0)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PortfolioAchievement(SQLModel, table=True):
    """Achievements and awards."""

    __tablename__ = "portfolio_achievements"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    event: str
    organization: str
    year: int
    display_order: int = Field(default=0)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PortfolioCourse(SQLModel, table=True):
    """Professional courses and certifications."""

    __tablename__ = "portfolio_courses"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    year: int
    focus: list[str] = Field(default=[], sa_column=Column(JSON))
    display_order: int = Field(default=0)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ==========================================
# System Settings Table
# ==========================================

class SystemSetting(SQLModel, table=True):
    """Admin-configurable system settings for tools and integrations."""

    __tablename__ = "system_settings"

    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(unique=True, index=True)  # e.g., "github_token", "calendly_link"
    value: str  # Encrypted for sensitive values
    description: str = ""
    is_sensitive: bool = False  # If true, value is encrypted/masked in UI
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ==========================================
# Contact & Lead Tables
# ==========================================

class ContactLead(SQLModel, table=True):
    """Visitor contact information collected by the AI agent."""

    __tablename__ = "contact_leads"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    purpose: Optional[str] = None  # "hiring", "collaboration", "project", "other"
    message: Optional[str] = None
    session_id: Optional[str] = None  # Link to chat session
    is_contacted: bool = False  # Has the owner followed up?
    notes: Optional[str] = None  # Admin notes
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
