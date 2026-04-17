from datetime import datetime

from pydantic import BaseModel, Field


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


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    version: str
    database: str
