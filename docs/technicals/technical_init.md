Đây là tài liệu **Technical Architecture Document (TAD)**. Tài liệu này mô tả chi tiết "bộ khung" kỹ thuật của hệ thống, cách các thành phần giao tiếp với nhau và lý do đằng sau các quyết định công nghệ.

Lưu file này tại: `docs/technical-architecture.md`

---

# Technical Architecture Document

**Project:** The Transparent Core
**Architecture Style:** Microservices (Frontend & AI Agent) with Shared Database.
**Infrastructure:** Self-hosted / Homelab.

---

## 1. High-Level Architecture (Kiến trúc tổng quan)

Hệ thống được thiết kế theo mô hình **Service-Oriented** chạy trên Container (Docker), được phơi ra Internet thông qua Cloudflare Tunnel để đảm bảo bảo mật mà không cần mở port Router.

### Sơ đồ luồng dữ liệu (Data Flow)

1. **User Request** đi qua **Cloudflare Edge** -> **Tunnel (cloudflared)** tại Home Server.
2. **Routing:**
* `thien.dev` -> Trỏ về container **Frontend (Next.js)**.
* `api.thien.dev` -> Trỏ về container **AI Agent (FastAPI)**.


3. **Database Interaction:** Cả hai service đều kết nối tới một container **PostgreSQL** duy nhất (nhưng quản lý schema khác nhau).
4. **AI Logic:** Service FastAPI gọi API của **Google Gemini Flash** để xử lý ngôn ngữ và dùng **PostgreSQL (pgvector)** để truy xuất bộ nhớ dài hạn.

---

## 2. Component Details & Technology Stack

### 2.1. Frontend Service (The Face)

Nơi hiển thị giao diện Liquid Glass và tương tác người dùng.

* **Core Framework:** **Next.js 14+ (App Router)**.
* *Lý do:* Hỗ trợ React Server Components (RSC) giúp load trang nhanh, SEO tốt cho portfolio. Kiến trúc thư mục rõ ràng.


* **Styling System:** **Tailwind CSS** + **shadcn/ui**.
* *Lý do:* Tailwind giúp style nhanh. shadcn/ui cung cấp các component (Button, Dialog, Input) chất lượng cao, dễ tùy biến sâu (đặc biệt quan trọng khi cần chèn hiệu ứng kính).


* **Animation Engine:** **Framer Motion** (`motion/react`).
* *Lý do:* Thư viện duy nhất đủ mạnh để xử lý các animation phức tạp như `layoutId` (biến hình từ nút tròn sang cửa sổ chat) và các hiệu ứng vật lý (drag, spring) của Liquid Glass.


* **Data Fetching:** Server Actions (cho form) & React Query (cho client-side interaction).

### 2.2. AI Service (The Brain)

Backend chuyên biệt xử lý logic thông minh, Chatbot và RAG.

* **Language:** **Python 3.11+**.
* *Lý do:* Hệ sinh thái AI/Data Science mạnh nhất.


* **Web Framework:** **FastAPI**.
* *Lý do:* Hiệu năng cao (Asynchronous), tự động sinh docs (Swagger UI), nhẹ hơn Django/Flask.


* **Agent Framework:** **Pydantic-AI**.
* *Lý do:* Type-safe tuyệt đối. Dễ dàng định nghĩa **Tools** (công cụ) để Agent tự gọi API hoặc query DB.


* **LLM Provider:** **Google Gemini 1.5 Flash**.
* *Lý do:* Tốc độ phản hồi cực nhanh (low latency), cửa sổ ngữ cảnh (Context Window) lớn để nhét nhiều data, và chi phí rẻ (thậm chí free tier tốt).



### 2.3. Database Layer (The Memory)

Nơi lưu trữ dữ liệu bền vững.

* **DBMS:** **PostgreSQL 16**.
* *Lý do:* Cở sở dữ liệu quan hệ mạnh mẽ, ổn định nhất.


* **Vector Extension:** **pgvector**.
* *Lý do:* Biến Postgres thành Vector Database. Không cần tốn tài nguyên chạy thêm Pinecone hay Weaviate. Cho phép thực hiện Semantic Search (tìm kiếm theo ý nghĩa) ngay trong câu lệnh SQL.


* **ORM Strategy:**
* Frontend dùng **Prisma** (hoặc Drizzle): Type-safe cho TypeScript.
* Backend AI dùng **SQLModel** (hoặc SQLAlchemy): Tối ưu cho Python.



---

## 3. Communication Strategy (Cơ chế giao tiếp)

Để đảm bảo tính nhất quán (Consistency) và tách biệt (Decoupling):

### 3.1. Shared Database Pattern

* Cả Next.js và FastAPI cùng kết nối vào một Database Instance.
* **Phân quyền:**
* Next.js sở hữu các bảng: `Projects`, `Profile`, `Config`. (Write/Read)
* FastAPI sở hữu các bảng: `ChatHistory`, `Embeddings`, `RAG_Docs`. (Write/Read)
* FastAPI có quyền **Read-Only** sang bảng `Projects` để lấy dữ liệu cho Agent học.



### 3.2. Internal API & Tool Use

* Khi Agent cần thông tin realtime (ví dụ: "Server nhà the owner đang chạy service gì?"), nó sẽ không query DB mà dùng **Tool** gọi API nội bộ của Next.js (hoặc service monitoring khác).
* Giao thức: HTTP REST trong mạng Docker nội bộ (`http://web:3000/...`).

---

## 4. DevOps & Infrastructure (Hạ tầng)

### 4.1. Self-Hosting Environment

* **Hardware:** Lenovo Legion 5 (Ubuntu Laptop).
* **Orchestration:** **Docker Compose**.
* Quản lý toàn bộ stack (Frontend, Backend, DB) trong một file config duy nhất. Dễ dàng bật/tắt, restart.



### 4.2. Networking & Security

* **Cloudflare Tunnel (`cloudflared`):**
* *Cơ chế:* Tạo một đường hầm mã hóa từ Laptop ra server của Cloudflare.
* *Lợi ích:* Không cần Public IP, không cần mở Port trên Router (tránh rủi ro bị scan port), tự động có HTTPS/SSL.
* *Routing:* Cấu hình Subdomain routing ngay trên Dashboard Cloudflare hoặc file config `config.yml`.



---

## 5. Rationale Summary (Tại sao chọn kiến trúc này?)

1. **Tại sao tách đôi Next.js và Python?**
* Node.js (Next.js) rất yếu trong việc xử lý tính toán AI/Vector. Python là vua ở mảng này. Tách ra giúp frontend luôn mượt, không bị block khi AI đang "suy nghĩ".


2. **Tại sao Self-host mà không dùng Vercel/Render?**
* Tận dụng sức mạnh phần cứng sẵn có (Laptop Gaming mạnh hơn nhiều so với gói Free của Vercel).
* Tự chủ dữ liệu (Privacy).
* Phù hợp với hình ảnh "System Engineer/Homelabber" mà bạn muốn xây dựng.


3. **Tại sao dùng Shared DB mà không tách riêng?**
* Giảm độ phức tạp vận hành (Maintenance overhead). Chỉ cần backup 1 nơi.
* Dữ liệu đồng bộ tức thì (Latency bằng 0) giữa việc bạn update Portfolio và việc AI biết về update đó.


4. **Tại sao Liquid Glass (Client-side heavy) với Next.js (Server-side)?**
* Next.js xử lý SEO và load nội dung ban đầu. Sau khi load xong, Client (React) sẽ takeover để chạy các hiệu ứng WebGL/CSS Glass nặng. Đây là sự kết hợp cân bằng giữa Performance và Aesthetics.
