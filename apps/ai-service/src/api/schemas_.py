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
