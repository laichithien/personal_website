Ok, mình hiểu ý bạn. Bạn muốn đưa tính năng "Dynamic Configuration" lên cao nhất. Thay vì sửa code để đổi prompt hay thêm tool cho Agent, bạn muốn chỉnh ngay trong Database (hoặc Admin UI sau này).

Đây là bản cập nhật **Backend Architecture Document (BAD) - Version 2.0**, tập trung vào kiến trúc **Dynamic Agent & Tool Registry**.

Lưu đè file này vào: `docs/backend-architecture.md`

---

# Backend Architecture Document

**Service:** AI Core & Data Layer
**Architecture Pattern:** Dynamic Agent Configuration (Database-Driven).
**Tech Stack:** Python (FastAPI), Pydantic-AI, PostgreSQL (pgvector).

---

## 1. Database Schema Design (Updated)

Chúng ta bổ sung thêm nhóm bảng **"Agent Configuration"** vào Schema B (`ai_agent`).

### 1.1. Agent & Tool Registry Tables (SQLModel)

Đây là nơi định nghĩa "bộ não" và "tay chân" của AI.

```python
# Schema: ai_agent

class AgentConfig(SQLModel, table=True):
    """Lưu cấu hình của các con Bot khác nhau (VD: MainBot, CodingBot,...)"""
    id: int = Field(primary_key=True)
    slug: str = Field(unique=True, index=True) # VD: "portfolio-assistant"
    name: str 
    model_provider: str # VD: "google-gla"
    model_name: str     # VD: "gemini-1.5-flash"
    system_prompt: str  # Prompt gốc (VD: "Bạn là trợ lý của the owner...")
    temperature: float = Field(default=0.7)
    is_active: bool = Field(default=True)

class ToolDefinition(SQLModel, table=True):
    """Danh sách các Tools có sẵn trong hệ thống"""
    id: int = Field(primary_key=True)
    name: str = Field(unique=True) # Tên hàm khớp với code (VD: "search_projects")
    description: str               # Mô tả cho LLM hiểu tool làm gì
    is_active: bool = Field(default=True)

class AgentToolLink(SQLModel, table=True):
    """Bảng trung gian: Con Agent nào được dùng Tool nào"""
    agent_id: int = Field(foreign_key="agentconfig.id", primary_key=True)
    tool_id: int = Field(foreign_key="tooldefinition.id", primary_key=True)

```

### 1.2. Knowledge & Memory Tables (Giữ nguyên)

* `KnowledgeBase`: Lưu vector embeddings (quản lý bởi logic System Background).
* `ChatSession`: Lưu phiên chat.
* `ChatMessage`: Lưu nội dung chat.

---

## 2. Dynamic Agent Loader Logic

Đây là trái tim của Backend. Thay vì khởi tạo Agent cứng (`agent = Agent(...)`), chúng ta sẽ dùng **Factory Pattern** để dựng Agent mỗi khi có request.

### 2.1. Tool Registry (Code Mapping)

Trong code, bạn cần một từ điển để map từ `string` (trong DB) sang `function` (trong Python).

```python
# src/agent/registry.py
from src.agent import tools

# Mapping tên trong DB -> Hàm thực tế
AVAILABLE_TOOLS = {
    "search_projects": tools.search_projects,
    "get_cv_info": tools.get_cv_info,
    "calculator": tools.calculator,
    # Thêm tool mới thì khai báo vào đây
}

```

### 2.2. The Factory (Agent Builder)

Logic để lắp ráp Agent từ DB:

```python
# src/agent/factory.py

async def load_agent_by_slug(slug: str, db: Session) -> Agent:
    # 1. Lấy config từ DB
    agent_config = db.exec(select(AgentConfig).where(AgentConfig.slug == slug)).first()
    
    if not agent_config:
        raise ValueError("Agent not found")

    # 2. Lấy danh sách tools được gán cho agent này
    tool_links = db.exec(select(AgentToolLink).where(AgentToolLink.agent_id == agent_config.id)).all()
    
    # 3. Map từ DB tools sang Python tools
    active_tools = []
    for link in tool_links:
        tool_def = db.get(ToolDefinition, link.tool_id)
        if tool_def.name in AVAILABLE_TOOLS:
            active_tools.append(AVAILABLE_TOOLS[tool_def.name])

    # 4. Khởi tạo Pydantic-AI Agent
    return Agent(
        model=f"{agent_config.model_provider}:{agent_config.model_name}",
        system_prompt=agent_config.system_prompt,
        tools=active_tools, # Inject tools động vào đây
    )

```

---

## 3. Data Flow Update (Luồng dữ liệu mới)

### 3.1. Initialization (Khởi động)

1. **Dev/Admin:** Insert vào DB danh sách các tools đã code (`search_projects`, `get_bio`).
2. **Dev/Admin:** Tạo một row trong bảng `AgentConfig` (VD: `slug="main-bot"`, `system_prompt="Bạn là..."`).
3. **Dev/Admin:** Link các tools cần thiết vào Bot này.

### 3.2. Runtime (Khi User Chat)

1. **Request:** Client gọi `POST /api/chat/portfolio-assistant` với tin nhắn "the owner biết làm gì?".
2. **FastAPI:**
* Gọi `load_agent_by_slug("portfolio-assistant")`.
* Hệ thống query DB -> Lấy Prompt & List Tools -> Dựng Agent.


3. **Execution:**
* Agent chạy với Prompt vừa lấy từ DB.
* Nếu cần tìm kiếm, Agent thấy mình có tool `search_projects` (do DB cấp) -> Gọi tool.


4. **Response:** Trả về câu trả lời.

---

## 4. API Specification

### Endpoint Chat

* **URL:** `POST /api/chat/{agent_slug}`
* **Body:**
```json
{
  "message": "Hello",
  "session_id": "optional-uuid"
}

```


* **Logic:**
* Tìm Agent config dựa vào `agent_slug`.
* Load context chat cũ (nếu có `session_id`).
* Chạy Agent.



### Endpoint Quản lý (Optional - Dùng cho Admin sau này)

* `POST /api/admin/agents`: Tạo bot mới.
* `PUT /api/admin/agents/{id}`: Sửa system prompt (Sửa xong có tác dụng ngay lập tức cho request sau).
* `POST /api/admin/tools`: Đăng ký tool mới.

---

## 5. Deployment Note (Lưu ý triển khai)

* **Migration (Alembic):**
* Khi triển khai lần đầu, bạn cần chạy script `seed_data.py` để insert sẵn:
* Ít nhất 1 Agent (`slug='default'`).
* Các Tool cơ bản (`search_projects`).


* Nếu không có data này trong DB, API sẽ lỗi vì không load được Agent.



---

### Tóm tắt thay đổi:

* **Tính linh hoạt cực cao:** Bạn có thể đổi tính cách Bot (System Prompt) hoặc tắt bớt Tool (cắt chức năng) chỉ bằng một câu lệnh SQL update, không cần redeploy code.
* **Scalable:** Sau này bạn có thể tạo thêm `blog-writer-bot`, `code-reviewer-bot` với các prompt và bộ tool khác nhau cùng chạy trên một backend.
