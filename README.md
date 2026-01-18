# The Transparent Core

A modern portfolio website with AI-powered chat assistant, featuring a Liquid Glass design system.

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
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

**Access:**
- Frontend: http://localhost:3333
- Backend API: http://localhost:3334
- API Docs: http://localhost:3334/docs

## Local Development

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
│   │   │   ├── app/            # App router pages
│   │   │   ├── components/
│   │   │   │   ├── ui/         # Base UI components
│   │   │   │   ├── features/   # Feature components
│   │   │   │   └── shared/     # Shared components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── lib/            # Utilities
│   │   │   └── config/         # Static config
│   │   └── Dockerfile
│   │
│   └── ai-service/             # FastAPI backend
│       ├── src/
│       │   ├── api/            # API routes
│       │   ├── agent/          # AI agent system
│       │   ├── database/       # Models & connection
│       │   └── services/       # Business logic
│       ├── tests/
│       └── Dockerfile
│
├── infrastructure/
│   └── postgres/
│       └── init.sql            # Database initialization
│
├── docs/                       # Documentation
├── docker-compose.yml
├── .env.example
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5442/ai_agent_db` |
| `OPENROUTER_API_KEY` | OpenRouter API key | - |
| `OPENAI_API_KEY` | Same as OpenRouter key (for Pydantic-AI) | - |
| `OPENAI_BASE_URL` | OpenRouter base URL | `https://openrouter.ai/api/v1` |
| `NEXT_PUBLIC_API_URL` | Backend API URL for frontend | `http://localhost:3334` |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/docs` | Swagger documentation |
| `POST` | `/api/chat/{agent_slug}` | Send message to AI agent |
| `GET` | `/api/chat/{agent_slug}/history/{session_id}` | Get chat history |

## Docker Commands

### Development (with hot reload)

```bash
# Start all services
docker compose up -d

# Start specific service
docker compose up -d postgres
docker compose up -d api
docker compose up -d web

# View logs
docker compose logs -f
docker compose logs -f api

# Rebuild after changes
docker compose up -d --build
```

### Production (optimized build)

```bash
# Start production stack
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Rebuild production images
docker compose -f docker-compose.prod.yml up -d --build
```

### Common Commands (both dev & prod)

```bash
# Stop all services
docker compose down

# Reset database (removes all data)
docker compose down -v
```

## Cloudflare Tunnel

The project includes Cloudflare Tunnel for public access.

**Production URLs:**
- Frontend: https://yourdomain.com
- API: https://api.yourdomain.com

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

## Development Notes

- Docker services are configured with `restart: "no"` - they won't auto-start on boot
- PostgreSQL runs on port **5442** (to avoid conflict with local postgres)
- Frontend runs on port **3333**
- Backend runs on port **3334** (maps to internal 8000)

## License

MIT
