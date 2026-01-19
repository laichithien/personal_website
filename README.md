# The Transparent Core

A modern portfolio website with AI-powered chat assistant, featuring a Liquid Glass design system and a full-featured admin panel.

## Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- shadcn/ui
- React Query

**Backend**
- FastAPI
- Pydantic-AI
- SQLModel + PostgreSQL
- pgvector (RAG support)
- JWT Authentication (httpOnly cookies)
- bcrypt password hashing

**AI**
- OpenRouter API
- Model: `xiaomi/mimo-v2-flash:free`

## Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- [direnv](https://direnv.net/) (optional, for auto-loading env)

## Quick Start

### 1. Clone and Setup Environment

```bash
cd /path/to/personal_website

# Copy environment file
cp .env.example .env

# Edit .env with your OpenRouter API key
# OPENROUTER_API_KEY=your_key_here
# OPENAI_API_KEY=your_key_here  # Same as OpenRouter key

# If using direnv
direnv allow
```

### 2. Run with Docker Compose

```bash
# Build images (first time only)
docker compose build                              # Dev
docker compose -f docker-compose.prod.yml build   # Prod

# Start development
docker compose up -d

# Start production
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose logs -f
```

## Ports & URLs

| Environment | Web | API | Postgres | Access |
|-------------|-----|-----|----------|--------|
| **Development** | `localhost:3343` | `localhost:3344` | `localhost:5452` | Local only |
| **Production** | `localhost:3333` | `localhost:3334` | `localhost:5442` | Via Cloudflare Tunnel |

**Production Public URLs:**
- Frontend: https://yourdomain.com
- API: https://api.yourdomain.com
- Admin Panel: https://yourdomain.com/admin

## Docker Commands

### Development

```bash
# Start dev environment
docker compose up -d

# View logs
docker compose logs -f
docker compose logs -f web   # specific service

# Stop dev
docker compose down

# Rebuild after Dockerfile changes
docker compose up -d --build
```

### Production

```bash
# Start production
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop production
docker compose -f docker-compose.prod.yml down

# Rebuild production (required for code changes)
docker compose -f docker-compose.prod.yml up -d --build
```

### Run Both Simultaneously

Dev and prod use different ports and container names, so they can run at the same time:

```bash
# Start both
docker compose up -d
docker compose -f docker-compose.prod.yml up -d

# Stop both
docker compose down
docker compose -f docker-compose.prod.yml down
```

### Reset Database

```bash
# Dev (removes tc-postgres-data-dev volume)
docker compose down -v

# Prod (removes tc-postgres-data volume)
docker compose -f docker-compose.prod.yml down -v
```

## Local Development (without Docker)

### Start Database Only

```bash
docker compose up -d postgres
```

### Run Backend

```bash
cd apps/ai-service

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Run API server
uvicorn src.main:app --reload --port 8000
```

### Run Frontend

```bash
cd apps/web

# Install dependencies
npm install

# Run dev server
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Project Structure

```
.
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── admin/      # Admin panel pages
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── agents/
│   │   │   │   │   ├── tools/
│   │   │   │   │   ├── knowledge/
│   │   │   │   │   ├── sessions/
│   │   │   │   │   └── settings/
│   │   │   │   └── ...         # Public pages
│   │   │   ├── components/
│   │   │   │   ├── ui/         # Base UI components
│   │   │   │   ├── admin/      # Admin-specific components
│   │   │   │   ├── features/   # Feature components
│   │   │   │   └── shared/     # Shared components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── lib/            # Utilities
│   │   │   └── config/         # Static config
│   │   └── Dockerfile
│   │
│   └── ai-service/             # FastAPI backend
│       ├── src/
│       │   ├── api/
│       │   │   ├── routes/
│       │   │   │   ├── admin/  # Admin API endpoints
│       │   │   │   │   ├── auth.py
│       │   │   │   │   ├── agents.py
│       │   │   │   │   ├── tools.py
│       │   │   │   │   ├── knowledge.py
│       │   │   │   │   ├── sessions.py
│       │   │   │   │   └── dashboard.py
│       │   │   │   └── chat.py
│       │   │   ├── deps/       # Dependencies (auth)
│       │   │   └── schemas/    # Pydantic schemas
│       │   ├── agent/          # AI agent system
│       │   ├── database/       # Models & connection
│       │   └── services/       # Business logic (auth)
│       ├── tests/
│       └── Dockerfile
│
├── infrastructure/
│   ├── postgres/
│   │   └── init.sql            # Database initialization
│   └── cloudflared/
│       ├── config.yml          # Tunnel configuration
│       └── credentials.json    # Tunnel credentials (not in git)
│
├── docs/                       # Documentation
├── docker-compose.yml          # Development
├── docker-compose.prod.yml     # Production
├── .env.example
└── README.md
```

## Environment Variables

| Variable | Description | Dev Default | Prod Default |
|----------|-------------|-------------|--------------|
| `DATABASE_URL` | PostgreSQL connection | `localhost:5452` | `localhost:5442` |
| `OPENROUTER_API_KEY` | OpenRouter API key | - | - |
| `OPENAI_API_KEY` | Same as OpenRouter key | - | - |
| `OPENAI_BASE_URL` | OpenRouter base URL | `https://openrouter.ai/api/v1` | same |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3344` | `https://api.yourdomain.com` |
| `NEXT_PUBLIC_SITE_URL` | Frontend URL | `http://localhost:3343` | `https://yourdomain.com` |

**Admin Panel Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_USERNAME` | Default admin username | `admin` |
| `DEFAULT_ADMIN_PASSWORD` | Initial admin password (used on first startup) | `admin123` |
| `JWT_SECRET_KEY` | Secret key for JWT tokens | (generated) |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Access token expiry | `15` |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiry | `7` |

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/docs` | Swagger documentation |
| `POST` | `/api/chat/{agent_slug}` | Send message to AI agent |
| `GET` | `/api/chat/{agent_slug}/history/{session_id}` | Get chat history |

### Admin Endpoints (Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/auth/login` | Admin login |
| `POST` | `/api/admin/auth/logout` | Admin logout |
| `POST` | `/api/admin/auth/refresh` | Refresh access token |
| `GET` | `/api/admin/auth/me` | Get current admin info |
| `POST` | `/api/admin/auth/change-password` | Change admin password |
| `GET/POST` | `/api/admin/agents` | List/create agents |
| `GET/PUT/DELETE` | `/api/admin/agents/{id}` | Agent CRUD |
| `GET/POST` | `/api/admin/tools` | List/create tools |
| `GET/PUT/DELETE` | `/api/admin/tools/{id}` | Tool CRUD |
| `GET/POST` | `/api/admin/knowledge` | List/create documents |
| `POST` | `/api/admin/knowledge/upload` | Upload document file |
| `GET/PUT/DELETE` | `/api/admin/knowledge/{id}` | Document CRUD |
| `GET` | `/api/admin/sessions` | List chat sessions |
| `GET/DELETE` | `/api/admin/sessions/{id}` | Session detail/delete |
| `GET` | `/api/admin/dashboard/stats` | Dashboard statistics |

## Admin Panel

The admin panel provides a web interface for managing AI agents, tools, knowledge documents, and chat sessions.

### Features

- **Dashboard**: Overview of system statistics and recent activity
- **Agents**: Configure AI agent settings (model, temperature, system prompts)
- **Tools**: Manage available tools for agents
- **Knowledge**: Upload and manage RAG documents (PDF, TXT, MD, JSON, CSV)
- **Sessions**: View and manage chat sessions
- **Settings**: Change admin password

### Authentication

- JWT-based authentication with httpOnly cookies
- Access tokens expire in 15 minutes (configurable)
- Refresh tokens expire in 7 days (configurable)
- Passwords hashed with bcrypt
- Supports both cookie and Bearer token authentication

### Default Credentials

On first startup, a default admin user is created:
- **Username**: `admin` (or value of `ADMIN_USERNAME`)
- **Password**: `admin123` (or value of `DEFAULT_ADMIN_PASSWORD`)

**Important**: Change the default password immediately after first login via Settings page.

### Access

- Development: http://localhost:3343/admin
- Production: https://yourdomain.com/admin

## Cloudflare Tunnel

The project includes Cloudflare Tunnel for public access in production.

**Tunnel Configuration:**
- Config: `infrastructure/cloudflared/config.yml`
- Credentials: `infrastructure/cloudflared/credentials.json`

**Manage Tunnel:**
```bash
# List tunnels
cloudflared tunnel list

# Check tunnel status
docker compose -f docker-compose.prod.yml logs cloudflared
```

## Container Names

| Service | Dev | Prod |
|---------|-----|------|
| Web | `tc-web-dev` | `tc-web` |
| API | `tc-api-dev` | `tc-api` |
| Postgres | `tc-postgres-dev` | `tc-postgres` |
| Cloudflared | `tc-cloudflared-dev` | `tc-cloudflared` |

## Image Tags

Images are tagged separately for dev and prod to avoid rebuilding when switching:

| Service | Dev | Prod |
|---------|-----|------|
| Web | `transparent-core-web:dev` | `transparent-core-web:prod` |
| API | `transparent-core-api:dev` | `transparent-core-api:prod` |

## Development Notes

- Docker services are configured with `restart: "no"` (dev) or `restart: unless-stopped` (prod)
- Dev and prod can run simultaneously (different ports, containers, volumes)
- `NEXT_PUBLIC_*` variables are embedded at build time for production
- Production images don't mount volumes (use built code)
- Dev images mount source code for hot reload

## License

MIT
