# API Specification

**Document:** Implementation Guide - API Documentation
**Project:** The Transparent Core
**Base URL:** `https://api.yourdomain.com` (Production) | `http://localhost:3334` (Development)

---

## 1. Overview

### 1.1. Authentication

**Public Endpoints**: No authentication required for chat endpoints.

**Admin Endpoints**: JWT-based authentication with httpOnly cookies.
- Access tokens expire in 15 minutes (configurable via `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`)
- Refresh tokens expire in 7 days (configurable via `JWT_REFRESH_TOKEN_EXPIRE_DAYS`)
- Passwords hashed with bcrypt
- Supports both cookie and Bearer token authentication

### 1.2. Response Format

All responses follow this structure:

```json
{
  "data": { ... },
  "error": null,
  "meta": {
    "request_id": "uuid",
    "timestamp": "ISO8601"
  }
}
```

Error responses:

```json
{
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  },
  "meta": { ... }
}
```

### 1.3. Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Internal Server Error |

---

## 2. Chat Endpoints

### 2.1. Send Message

Send a message to an AI agent and receive a response.

```
POST /api/chat/{agent_slug}
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| agent_slug | string | Agent identifier (e.g., `portfolio-assistant`) |

#### Request Body

```json
{
  "message": "What projects has Thiện worked on?",
  "session_id": "optional-uuid-string"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | User message (1-4000 chars) |
| session_id | string | No | Session ID for conversation continuity |

#### Response

```json
{
  "response": "Thiện has worked on several projects including...",
  "session_id": "123e4567-e89b-12d3-a456-426614174000",
  "tool_calls": ["search_projects"]
}
```

| Field | Type | Description |
|-------|------|-------------|
| response | string | AI response text |
| session_id | string | Session ID (new or existing) |
| tool_calls | array | List of tools used (if any) |

#### Example

```bash
curl -X POST "http://localhost:3334/api/chat/portfolio-assistant" \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about yourself"}'
```

#### Errors

| Code | Error | Description |
|------|-------|-------------|
| 404 | AGENT_NOT_FOUND | Agent slug does not exist or is inactive |
| 422 | VALIDATION_ERROR | Message is empty or too long |
| 500 | AGENT_ERROR | AI processing failed |

---

### 2.2. Get Chat History

Retrieve chat history for a session.

```
GET /api/chat/{agent_slug}/history/{session_id}
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| agent_slug | string | Agent identifier |
| session_id | string | Session UUID |

#### Response

```json
{
  "session_id": "123e4567-e89b-12d3-a456-426614174000",
  "messages": [
    {
      "role": "user",
      "content": "Hello",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "role": "assistant",
      "content": "Hello! How can I help you today?",
      "timestamp": "2024-01-15T10:30:01Z"
    }
  ]
}
```

#### Errors

| Code | Error | Description |
|------|-------|-------------|
| 404 | SESSION_NOT_FOUND | Session does not exist |

---

## 3. Health & System Endpoints

### 3.1. Health Check

```
GET /health
```

#### Response

```json
{
  "status": "healthy",
  "version": "0.1.0",
  "database": "connected"
}
```

---

### 3.2. Root Info

```
GET /
```

#### Response

```json
{
  "name": "The Transparent Core - AI Service",
  "version": "0.1.0",
  "docs": "/docs"
}
```

---

## 4. Admin Endpoints

These endpoints require JWT authentication via httpOnly cookies and are for managing agents, tools, knowledge documents, and sessions.

### 4.0. Authentication Endpoints

#### Login

```
POST /api/admin/auth/login
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Response:** Sets httpOnly cookies (`access_token`, `refresh_token`) and returns:
```json
{
  "message": "Login successful",
  "username": "admin"
}
```

#### Logout

```
POST /api/admin/auth/logout
```

**Response:** Clears authentication cookies.

#### Refresh Token

```
POST /api/admin/auth/refresh
```

**Response:** Issues new access token using refresh token from cookies.

#### Get Current User

```
GET /api/admin/auth/me
```

**Response:**
```json
{
  "id": 1,
  "username": "admin"
}
```

#### Change Password

```
POST /api/admin/auth/change-password
```

**Request Body:**
```json
{
  "current_password": "old-password",
  "new_password": "new-password"
}
```

---

### 4.1. List Agents

```
GET /api/admin/agents
```

#### Response

```json
{
  "agents": [
    {
      "id": 1,
      "slug": "portfolio-assistant",
      "name": "Portfolio Assistant",
      "is_active": true
    }
  ]
}
```

---

### 4.2. Create Agent

```
POST /api/admin/agents
```

#### Request Body

```json
{
  "slug": "blog-assistant",
  "name": "Blog Assistant",
  "system_prompt": "You are a helpful blog writing assistant...",
  "model": "xiaomi/mimo-v2-flash:free",
  "temperature": 0.7
}
```

#### Response

```json
{
  "id": 2,
  "slug": "blog-assistant",
  "name": "Blog Assistant",
  "is_active": true
}
```

---

### 4.3. Update Agent

```
PUT /api/admin/agents/{id}
```

#### Request Body

```json
{
  "system_prompt": "Updated prompt...",
  "temperature": 0.5
}
```

---

### 4.4. List Tools

```
GET /api/admin/tools
```

#### Response

```json
{
  "tools": [
    {
      "id": 1,
      "name": "search_projects",
      "description": "Search through portfolio projects",
      "is_active": true
    }
  ]
}
```

---

### 4.5. Create Tool

```
POST /api/admin/tools
```

#### Request Body

```json
{
  "name": "get_blog_posts",
  "description": "Retrieve blog post information"
}
```

---

### 4.6. Assign Tool to Agent

```
POST /api/admin/agents/{agent_id}/tools/{tool_id}
```

---

### 4.7. Remove Tool from Agent

```
DELETE /api/admin/agents/{agent_id}/tools/{tool_id}
```

---

### 4.8. Knowledge Document Management

#### List Documents

```
GET /api/admin/knowledge
```

**Response:**
```json
{
  "documents": [
    {
      "id": 1,
      "title": "CV Information",
      "source": "cv",
      "chunk_count": 5,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### Create Document

```
POST /api/admin/knowledge
```

**Request Body:**
```json
{
  "title": "Project Documentation",
  "content": "Full text content here...",
  "source": "manual"
}
```

#### Upload Document File

```
POST /api/admin/knowledge/upload
```

**Request:** Multipart form data with file (PDF, TXT, MD, JSON, CSV)
- `file`: The document file
- `title`: Optional title (defaults to filename)
- `source`: Optional source type

#### Update Document

```
PUT /api/admin/knowledge/{id}
```

#### Delete Document

```
DELETE /api/admin/knowledge/{id}
```

#### Reindex Document

```
POST /api/admin/knowledge/{id}/reindex
```

---

### 4.9. Session Management

#### List Sessions

```
GET /api/admin/sessions?page=1&per_page=20
```

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "session_id": "uuid-string",
      "agent_slug": "portfolio-assistant",
      "message_count": 10,
      "created_at": "2024-01-15T10:00:00Z",
      "last_activity": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "per_page": 20,
  "total_pages": 5
}
```

#### Get Session Details

```
GET /api/admin/sessions/{id}
```

**Response:** Full session with all messages.

#### Delete Session

```
DELETE /api/admin/sessions/{id}
```

#### Bulk Delete Sessions

```
POST /api/admin/sessions/bulk-delete
```

**Request Body:**
```json
{
  "ids": [1, 2, 3]
}
```

---

### 4.10. Dashboard Statistics

#### Get Stats

```
GET /api/admin/dashboard/stats
```

**Response:**
```json
{
  "total_agents": 3,
  "active_agents": 2,
  "total_tools": 5,
  "total_documents": 10,
  "total_sessions": 150,
  "total_messages": 1000,
  "sessions_today": 25,
  "messages_today": 150
}
```

#### Get Recent Activity

```
GET /api/admin/dashboard/recent-activity
```

**Response:**
```json
[
  {
    "type": "session",
    "description": "New chat session started with portfolio-assistant",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  {
    "type": "message",
    "description": "New user message: Hello, can you help...",
    "timestamp": "2024-01-15T10:29:00Z"
  }
]
```

---

## 5. WebSocket Endpoints (Future)

For real-time streaming responses:

```
WS /api/chat/{agent_slug}/stream
```

#### Message Format

**Client → Server:**
```json
{
  "type": "message",
  "content": "Hello",
  "session_id": "optional-uuid"
}
```

**Server → Client (streaming):**
```json
{
  "type": "chunk",
  "content": "Hello"
}
```
```json
{
  "type": "chunk",
  "content": "! How"
}
```
```json
{
  "type": "done",
  "session_id": "uuid"
}
```

---

## 6. Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/api/chat/*` | 30 requests/minute per IP |
| `/api/admin/*` | 100 requests/minute per token |
| `/health` | No limit |

Rate limit headers:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1705312800
```

---

## 7. CORS Configuration

Allowed origins:
- `https://yourdomain.com`
- `http://localhost:3000`
- `http://localhost:3333`

Allowed methods:
- GET, POST, PUT, DELETE, OPTIONS

Allowed headers:
- Content-Type
- Authorization

---

## 8. Error Codes Reference

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Request validation failed |
| AGENT_NOT_FOUND | Requested agent does not exist |
| SESSION_NOT_FOUND | Chat session not found |
| TOOL_NOT_FOUND | Tool definition not found |
| AGENT_ERROR | AI agent processing error |
| DATABASE_ERROR | Database connection/query error |
| RATE_LIMITED | Too many requests |
| UNAUTHORIZED | Missing or invalid authentication |
| FORBIDDEN | Insufficient permissions |

---

## 9. OpenAPI Specification

The API provides auto-generated OpenAPI documentation:

- **Swagger UI:** `http://localhost:3334/docs`
- **ReDoc:** `http://localhost:3334/redoc`
- **OpenAPI JSON:** `http://localhost:3334/openapi.json`

---

## 10. SDK Usage Examples

### 10.1. JavaScript/TypeScript

```typescript
// Using fetch
async function chat(message: string, sessionId?: string) {
  const response = await fetch('https://api.yourdomain.com/api/chat/portfolio-assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      session_id: sessionId,
    }),
  });

  return response.json();
}

// Usage
const result = await chat("What projects have you worked on?");
console.log(result.response);
```

### 10.2. Python

```python
import requests

def chat(message: str, session_id: str | None = None):
    response = requests.post(
        "https://api.yourdomain.com/api/chat/portfolio-assistant",
        json={
            "message": message,
            "session_id": session_id,
        },
    )
    return response.json()

# Usage
result = chat("Tell me about your tech stack")
print(result["response"])
```

### 10.3. React Hook

```tsx
import { useMutation } from '@tanstack/react-query';

interface ChatRequest {
  message: string;
  session_id?: string;
}

interface ChatResponse {
  response: string;
  session_id: string;
}

async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  const res = await fetch('/api/chat/portfolio-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return res.json();
}

export function useChat() {
  return useMutation({
    mutationFn: sendMessage,
  });
}

// Usage in component
function ChatComponent() {
  const { mutate, isPending, data } = useChat();

  const handleSend = (message: string) => {
    mutate({ message });
  };

  return (
    <div>
      {isPending && <span>Thinking...</span>}
      {data && <p>{data.response}</p>}
    </div>
  );
}
```

---

## 11. Testing the API

### 11.1. Using cURL

```bash
# Health check
curl http://localhost:3334/health

# Send chat message
curl -X POST http://localhost:3334/api/chat/portfolio-assistant \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Get chat history
curl http://localhost:3334/api/chat/portfolio-assistant/history/{session_id}
```

### 11.2. Using HTTPie

```bash
# Send message
http POST localhost:3334/api/chat/portfolio-assistant \
  message="What technologies do you use?"

# With session
http POST localhost:3334/api/chat/portfolio-assistant \
  message="Tell me more" \
  session_id="abc-123"
```

---

## 12. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 0.2.0 | 2025-01 | Added admin panel with JWT authentication, knowledge management, sessions, dashboard |
| 0.1.0 | 2024-01 | Initial API design |

---

## Document Index

- [00-project-setup.md](./00-project-setup.md) - Project initialization
- [01-frontend-implementation.md](./01-frontend-implementation.md) - Next.js frontend
- [02-backend-implementation.md](./02-backend-implementation.md) - FastAPI backend
- [03-infrastructure-setup.md](./03-infrastructure-setup.md) - Docker & deployment
- [04-component-specs.md](./04-component-specs.md) - UI components
- **05-api-specification.md** - API documentation (this file)
