Đây là tài liệu **DevOps & Infrastructure Document** bản hoàn chỉnh (Final Version). Mình đã cập nhật chính xác logic **Port Mapping (3333/3334)** và cấu hình **Cloudflare Tunnel** theo kiến trúc đã chốt.

Lưu file này tại: `docs/deployment.md`

---

# DevOps & Infrastructure Document

**Project:** The Transparent Core
**Domain:** `yourdomain.com`
**Server:** Self-hosted (Lenovo Legion / Ubuntu)
**Technology:** Docker Compose, PostgreSQL (pgvector), Cloudflare Tunnel.

---

## 1. Architecture Overview (Tổng quan kiến trúc)

Hệ thống hoạt động trên mô hình Containerization kín. Chỉ có **Cloudflare Tunnel** là "cánh cổng" duy nhất thông ra Internet.

### Network Flow

1. **Public Access (Người dùng Internet):**
* User truy cập `yourdomain.com` -> Cloudflare Edge -> **Tunnel** -> Container `web` (Port 3000).


2. **Local Access (Bạn - Developer):**
* Dev truy cập `localhost:3333` -> Container `web` (Port 3000).
* Dev truy cập `localhost:3334` -> Container `ai-service` (Port 8000).


3. **Internal Communication (Giao tiếp nội bộ):**
* `web` gọi `ai-service` qua: `http://ai-service:8000`.
* Cả 2 gọi Database qua: `postgres://...db:5432...`.



---

## 2. Directory Structure (Cấu trúc triển khai)

```bash
thien-portfolio/
├── docker-compose.yml          # [MAIN FILE] Quản lý toàn bộ Container
├── .env                        # Biến môi trường (KHÔNG commit lên git)
├── apps/
│   ├── web/Dockerfile
│   └── ai-service/Dockerfile
└── infrastructure/
    └── postgres/
        └── init.sql            # Script tạo 2 DB và cài pgvector

```

---

## 3. Configuration Files

### 3.1. Environment Variables (`.env`)

Tạo file `.env` tại thư mục gốc và điền thông tin thật:

```ini
# --- Database ---
DB_USER=thien_admin
DB_PASSWORD=secret_password_here

# --- AI Service ---
GEMINI_API_KEY=AIzaSy...your_gemini_key

# --- Cloudflare ---
# Token lấy từ Dashboard Cloudflare Zero Trust (Connector)
TUNNEL_TOKEN=eyJhIjoiM...

```

### 3.2. Database Init Script (`infrastructure/postgres/init.sql`)

Script này tự động chạy khi Database khởi động lần đầu tiên.

```sql
-- 1. Tạo Database cho Next.js (Content)
CREATE DATABASE portfolio_main_db;

-- 2. Tạo Database cho AI (Memory & RAG)
CREATE DATABASE ai_agent_db;

-- 3. Cài đặt pgvector cho AI Database
\c ai_agent_db;
CREATE EXTENSION IF NOT EXISTS vector;

```

### 3.3. Docker Compose (`docker-compose.yml`)

Bản config chuẩn với Port 3333/3334.

```yaml
version: '3.8'

services:
  # --- 1. Database Layer ---
  db:
    image: postgres:16-alpine
    container_name: portfolio_db
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infrastructure/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    # Không cần map port ra ngoài trừ khi muốn debug bằng DBeaver
    ports:
      - "5432:5432"

  # --- 2. AI Backend (FastAPI) ---
  ai-service:
    build: 
      context: ./apps/ai-service
      dockerfile: Dockerfile
    container_name: portfolio_ai
    restart: always
    environment:
      # Kết nối DB nội bộ (dùng tên service 'db')
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/ai_agent_db
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    ports:
      - "3334:8000" # Host:3334 -> Container:8000
    depends_on:
      - db

  # --- 3. Frontend Web (Next.js) ---
  web:
    build: 
      context: ./apps/web
      dockerfile: Dockerfile
    container_name: portfolio_web
    restart: always
    environment:
      # Kết nối DB nội bộ
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/portfolio_main_db
      
      # URL để trình duyệt gọi (Public Domain)
      NEXT_PUBLIC_API_URL: https://api.yourdomain.com
      
      # URL để Server-Side gọi nội bộ (Docker Network)
      INTERNAL_API_URL: http://ai-service:8000
    ports:
      - "3333:3000" # Host:3333 -> Container:3000
    depends_on:
      - db
      - ai-service

  # --- 4. Cloudflare Tunnel ---
  tunnel:
    image: cloudflare/cloudflared:latest
    container_name: portfolio_tunnel
    restart: always
    command: tunnel run
    environment:
      - TUNNEL_TOKEN=${TUNNEL_TOKEN}
    # Tunnel chung mạng với các service trên nên nhìn thấy chúng
    depends_on:
      - web
      - ai-service

volumes:
  postgres_data:

```

---

## 4. Cloudflare Tunnel Configuration (Dashboard)

Trên trang quản trị Cloudflare Zero Trust (Access > Tunnels), bạn cấu hình **Public Hostname** trỏ vào các service trong Docker như sau:

| Public Hostname | Service URL (Trong Docker) | Ghi chú |
| --- | --- | --- |
| `yourdomain.com` | `http://web:3000` | Frontend (Cổng gốc) |
| `api.yourdomain.com` | `http://ai-service:8000` | Backend (Cổng gốc) |

*Lưu ý: Không dùng port 3333/3334 ở đây. Tunnel nằm trong mạng Docker nên nó gọi trực tiếp cổng gốc.*

---

## 5. Operation Cheatsheet (Cẩm nang vận hành)

### Khởi động hệ thống

```bash
# Chạy nền (Detached mode)
docker-compose up -d

# Xem logs (để debug)
docker-compose logs -f

```

### Cập nhật Code mới

Khi bạn vừa git pull về và muốn update:

```bash
# Build lại image và khởi động lại
docker-compose up -d --build

```

### Backup Database

Backup toàn bộ dữ liệu ra file SQL (để lưu trữ an toàn):

```bash
docker exec -t portfolio_db pg_dumpall -c -U thien_admin > backup_$(date +%F).sql

```

### Kiểm tra Port trên máy Host

Để chắc chắn port 3333/3334 đang chạy:

```bash
netstat -tulpn | grep 333
# Kết quả nên hiện: 0.0.0.0:3333 ... docker-proxy

```

---

**Xong!** Bạn đã có một bản thiết kế hạ tầng "vừa code, vừa deploy" cực kỳ sạch sẽ. Hệ thống này đảm bảo:

1. **Dev ngon:** Code trên localhost:3333.
2. **Prod xịn:** Public qua `yourdomain.com` với SSL xịn sò.
3. **An toàn:** Không mở port linh tinh.
