"""Admin API Pydantic schemas."""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


# ==========================================
# Authentication Schemas
# ==========================================


class LoginRequest(BaseModel):
    """Login request body."""

    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class LoginResponse(BaseModel):
    """Login response body."""

    success: bool
    message: str


class AdminInfo(BaseModel):
    """Current admin info."""

    id: int
    username: str
    authenticated_at: datetime
    last_login: Optional[datetime] = None


class ChangePasswordRequest(BaseModel):
    """Change password request body."""

    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6)


class ChangePasswordResponse(BaseModel):
    """Change password response body."""

    success: bool
    message: str


# ==========================================
# Agent Configuration Schemas
# ==========================================


class AgentConfigCreate(BaseModel):
    """Create agent configuration."""

    slug: str = Field(..., min_length=1, max_length=50, pattern=r"^[a-z0-9-]+$")
    name: str = Field(..., min_length=1, max_length=100)
    system_prompt: str = Field(..., min_length=1)
    model_provider: str = "openai"
    model_name: str = "xiaomi/mimo-v2-flash:free"
    temperature: float = Field(default=0.7, ge=0, le=2)
    is_active: bool = True


class AgentConfigUpdate(BaseModel):
    """Update agent configuration."""

    name: Optional[str] = None
    system_prompt: Optional[str] = None
    model_provider: Optional[str] = None
    model_name: Optional[str] = None
    temperature: Optional[float] = Field(default=None, ge=0, le=2)
    is_active: Optional[bool] = None


class AgentConfigResponse(BaseModel):
    """Agent configuration response."""

    id: int
    slug: str
    name: str
    model_provider: str
    model_name: str
    system_prompt: str
    temperature: float
    is_active: bool
    created_at: datetime
    updated_at: datetime
    tool_count: int = 0

    model_config = {"from_attributes": True}


# ==========================================
# Tool Definition Schemas
# ==========================================


class ToolDefinitionCreate(BaseModel):
    """Create tool definition."""

    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1)
    is_active: bool = True


class ToolDefinitionUpdate(BaseModel):
    """Update tool definition."""

    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ToolDefinitionResponse(BaseModel):
    """Tool definition response."""

    id: int
    name: str
    description: str
    is_active: bool
    created_at: datetime
    agent_count: int = 0

    model_config = {"from_attributes": True}


class AgentToolLink(BaseModel):
    """Link tools to an agent."""

    tool_ids: list[int]


# ==========================================
# Knowledge Document Schemas
# ==========================================


class KnowledgeDocumentCreate(BaseModel):
    """Create knowledge document."""

    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    source: str = "manual"
    doc_metadata: Optional[dict[str, Any]] = None


class KnowledgeDocumentUpdate(BaseModel):
    """Update knowledge document."""

    title: Optional[str] = None
    content: Optional[str] = None
    source: Optional[str] = None
    doc_metadata: Optional[dict[str, Any]] = None


class KnowledgeDocumentResponse(BaseModel):
    """Knowledge document response."""

    id: int
    title: str
    content: str
    source: str
    doc_metadata: Optional[dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    chunk_count: int = 0

    model_config = {"from_attributes": True}


# ==========================================
# Chat Session Schemas
# ==========================================


class ChatSessionResponse(BaseModel):
    """Chat session response."""

    id: int
    session_id: str
    agent_slug: str
    user_identifier: Optional[str]
    message_count: int = 0
    created_at: datetime
    last_activity: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ChatMessageResponse(BaseModel):
    """Chat message response."""

    id: int
    role: str
    content: str
    tool_calls: Optional[list[str]]
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatSessionDetailResponse(ChatSessionResponse):
    """Chat session with messages."""

    messages: list[ChatMessageResponse] = []


class BulkDeleteRequest(BaseModel):
    """Bulk delete request."""

    ids: list[int]


# ==========================================
# Dashboard Schemas
# ==========================================


class DashboardStats(BaseModel):
    """Dashboard statistics."""

    total_agents: int
    active_agents: int
    total_tools: int
    total_documents: int
    total_sessions: int
    total_messages: int
    sessions_today: int
    messages_today: int


class RecentActivity(BaseModel):
    """Recent activity item."""

    type: str  # "session", "message"
    description: str
    timestamp: datetime


# ==========================================
# Pagination
# ==========================================


class PaginatedResponse(BaseModel):
    """Generic paginated response."""

    items: list[Any]
    total: int
    page: int
    per_page: int
    total_pages: int


# ==========================================
# System Settings Schemas
# ==========================================


class SystemSettingCreate(BaseModel):
    """Create system setting."""

    key: str = Field(..., min_length=1, max_length=100, pattern=r"^[a-z0-9_]+$")
    value: str = Field(..., min_length=0)
    description: str = ""
    is_sensitive: bool = False


class SystemSettingUpdate(BaseModel):
    """Update system setting."""

    value: Optional[str] = None
    description: Optional[str] = None
    is_sensitive: Optional[bool] = None


class SystemSettingResponse(BaseModel):
    """System setting response."""

    id: int
    key: str
    value: str  # Will be masked if is_sensitive=True
    description: str
    is_sensitive: bool
    updated_at: datetime

    model_config = {"from_attributes": True}


# ==========================================
# Contact Lead Schemas
# ==========================================


class ContactLeadResponse(BaseModel):
    """Contact lead response."""

    id: int
    name: str
    email: Optional[str]
    company: Optional[str]
    phone: Optional[str]
    purpose: Optional[str]
    message: Optional[str]
    session_id: Optional[str]
    is_contacted: bool
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ContactLeadUpdate(BaseModel):
    """Update contact lead."""

    is_contacted: Optional[bool] = None
    notes: Optional[str] = None
