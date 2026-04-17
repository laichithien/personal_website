# System Overview

## Purpose

This repository powers one product with two operator surfaces:

- a public portfolio site
- an admin workspace for editing content and operating the AI assistant

The backend is also the source of truth for:

- portfolio content
- blog posts
- admin auth
- AI agent config
- chat history
- knowledge documents

## Main Subsystems

## Public Web

Location:

- `apps/web/src/app/page.tsx`
- `apps/web/src/app/blog/*`

Responsibilities:

- render portfolio sections
- surface recent blog posts on the homepage
- render public blog index and blog detail pages
- host the AI messenger UI

## Admin Web

Location:

- `apps/web/src/app/admin/*`

Responsibilities:

- authenticate admin users
- manage portfolio content
- manage agents, tools, knowledge, sessions, and blog posts

## API Service

Location:

- `apps/ai-service/src/main.py`
- `apps/ai-service/src/api/routes/*`

Responsibilities:

- public APIs for portfolio, blog, and chat
- admin APIs for content and operations
- auth and cookie/token lifecycle
- agent execution and context assembly

## Database

Location:

- `apps/ai-service/src/database/models.py`
- `apps/ai-service/migrations/*`

Responsibilities:

- persistence for admin users, sessions, chat messages
- portfolio content tables
- blog posts
- knowledge docs/chunks
- system settings and contact leads

## Cross-Cutting Principles

- DB-backed content is preferred over hardcoded site data
- Public pages fetch from API routes, not direct DB access
- Admin UI talks to authenticated admin endpoints
- Nested scroll areas must be self-contained and not hijack page scroll
- The homepage section navigation should stay native-first where possible

## Current Direction

The codebase recently moved toward:

- direct portfolio context injection for chat
- DB-backed blog editing and rendering
- native section scrolling with lighter JS control
- narrower and more explicit docs for review/maintenance
