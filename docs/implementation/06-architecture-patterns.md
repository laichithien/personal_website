# Architecture & Design Patterns

**Document:** Production Architecture Guide
**Project:** The Transparent Core
**Quality Standard:** Enterprise-grade, Scalable, Maintainable

---

## 1. Architecture Principles

### 1.1. Core Tenets

```
┌─────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE PILLARS                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🏗️ SEPARATION OF CONCERNS                                  │
│  └─ Each module has one clear responsibility                │
│  └─ UI logic separated from business logic                  │
│  └─ Data fetching isolated from presentation                │
│                                                              │
│  🔌 DEPENDENCY INVERSION                                     │
│  └─ Depend on abstractions, not implementations             │
│  └─ Use interfaces/protocols for external services          │
│  └─ Easy to swap implementations (testing, scaling)         │
│                                                              │
│  📦 MODULAR COMPOSITION                                      │
│  └─ Features as self-contained modules                      │
│  └─ Clear public APIs between modules                       │
│  └─ No circular dependencies                                │
│                                                              │
│  🔄 UNIDIRECTIONAL DATA FLOW                                 │
│  └─ State flows down, events flow up                        │
│  └─ Predictable state mutations                             │
│  └─ Easy debugging and time-travel                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2. Pragmatic vs Strict Architecture

> **⚡ IMPORTANT: Don't Over-Engineer**
>
> This document describes enterprise-grade patterns. For a personal portfolio,
> apply them **pragmatically** - not every feature needs all layers.

| Approach | When to Use | Example |
|----------|-------------|---------|
| **Strict DDD** | Complex business logic, multiple use cases | Chat system with tools, history, sessions |
| **Pragmatic** | Simple CRUD, static data | Fetching tech stack list, portfolio config |

**Pragmatic Guidelines:**
- ✅ Simple features: Controller → Repository directly (skip Use Case)
- ✅ Use SQLModel as both Domain Entity and ORM Model
- ✅ Skip Repository interface for single-implementation scenarios
- ❌ Don't create abstractions you won't swap out

```python
# PRAGMATIC: Direct repository call for simple features
@router.get("/tech-stack")
async def get_tech_stack(db: AsyncSession = Depends(get_db)):
    return await db.exec(select(TechStack).where(TechStack.is_active == True)).all()

# STRICT: Use Case for complex features with business logic
@router.post("/chat/{agent_slug}")
async def chat(
    agent_slug: str,
    request: ChatRequest,
    use_case: SendMessageUseCase = Depends(get_send_message_use_case),
):
    return await use_case.execute(agent_slug, request)
```

### 1.3. Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
│  Pages, Components, Hooks                                    │
│  React Server Components + Client Components                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│  Services, Actions, Use Cases                                │
│  Business logic orchestration                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        DOMAIN LAYER                          │
│  Entities, Value Objects, Domain Services                    │
│  Core business rules (framework-agnostic)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                      │
│  API Clients, Database, External Services                    │
│  Implementation details                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture (Next.js)

### 2.1. Directory Structure (Feature-First)

```bash
apps/web/src/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Route group: public pages
│   │   ├── page.tsx              # Home page
│   │   └── layout.tsx
│   ├── (blog)/                   # Route group: blog section
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   └── layout.tsx
│   ├── api/                      # API routes
│   │   └── chat/route.ts
│   ├── layout.tsx                # Root layout
│   ├── globals.css
│   ├── error.tsx                 # Global error boundary
│   ├── loading.tsx               # Global loading UI
│   └── not-found.tsx             # 404 page
│
├── features/                     # Feature modules (CORE)
│   ├── hero/
│   │   ├── components/
│   │   │   ├── hero-section.tsx
│   │   │   ├── hero-card.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── use-hero-animation.ts
│   │   └── index.ts              # Public API
│   │
│   ├── bento/
│   │   ├── components/
│   │   │   ├── bento-grid.tsx
│   │   │   ├── cells/
│   │   │   │   ├── tech-stack-cell.tsx
│   │   │   │   ├── homelab-cell.tsx
│   │   │   │   ├── project-cell.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── use-grid-layout.ts
│   │   └── index.ts
│   │
│   ├── messenger/
│   │   ├── components/
│   │   │   ├── messenger-trigger.tsx
│   │   │   ├── messenger-window.tsx
│   │   │   ├── chat-interface.tsx
│   │   │   ├── contact-form.tsx
│   │   │   ├── message-bubble.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── use-chat.ts
│   │   │   ├── use-messenger-state.ts
│   │   │   └── use-streaming-response.ts
│   │   ├── services/
│   │   │   └── chat-api.ts
│   │   ├── types/
│   │   │   └── chat.types.ts
│   │   └── index.ts
│   │
│   └── soul/
│       ├── components/
│       │   ├── soul-section.tsx
│       │   ├── music-player.tsx
│       │   ├── life-algorithm.tsx
│       │   └── index.ts
│       └── index.ts
│
├── shared/                       # Shared across features
│   ├── components/
│   │   ├── ui/                   # Design system primitives
│   │   │   ├── liquid-glass/
│   │   │   │   ├── liquid-glass.tsx
│   │   │   │   ├── liquid-glass.variants.ts
│   │   │   │   ├── liquid-glass.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── button/
│   │   │   ├── dialog/
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── mesh-background.tsx
│   │   │   ├── floating-dock.tsx
│   │   │   ├── section-container.tsx
│   │   │   └── index.ts
│   │   └── feedback/
│   │       ├── loading-spinner.tsx
│   │       ├── skeleton.tsx
│   │       ├── error-fallback.tsx
│   │       └── index.ts
│   │
│   ├── hooks/
│   │   ├── use-media-query.ts
│   │   ├── use-reduced-motion.ts
│   │   ├── use-intersection.ts
│   │   ├── use-scroll-position.ts
│   │   └── index.ts
│   │
│   ├── lib/
│   │   ├── utils.ts              # cn(), formatters
│   │   ├── constants.ts          # App-wide constants
│   │   └── api-client.ts         # Axios/fetch instance
│   │
│   └── types/
│       ├── common.types.ts
│       └── index.ts
│
├── config/
│   ├── site.config.ts            # Site metadata
│   ├── portfolio.config.ts       # Portfolio content
│   └── animation.config.ts       # Animation presets
│
└── providers/                    # ⚠️ Alternative: Move to app/providers.tsx
    ├── query-provider.tsx
    ├── theme-provider.tsx
    └── index.tsx
```

> **📁 Provider Location Options:**
> - `src/providers/` - Current structure (explicit, discoverable)
> - `src/app/providers.tsx` - Colocated with layout (simpler for small projects)
>
> For this project, either works. Choose based on team preference.

### 2.2. Module Boundaries & Public APIs

Each feature exports only its public API:

```typescript
// features/messenger/index.ts
// ✅ GOOD: Explicit public API

// Components
export { MessengerTrigger } from './components/messenger-trigger';
export { MessengerWindow } from './components/messenger-window';

// Hooks
export { useChat } from './hooks/use-chat';
export { useMessengerState } from './hooks/use-messenger-state';

// Types
export type { ChatMessage, ChatSession } from './types/chat.types';

// ❌ BAD: Don't export internal implementation details
// export { parseMessageContent } from './utils/parse-message';
```

### 2.3. Component Patterns

#### Compound Component Pattern

```tsx
// shared/components/ui/liquid-glass/liquid-glass.tsx

import { createContext, useContext } from 'react';

interface LiquidGlassContextValue {
  blur: BlurLevel;
  glow: boolean;
}

const LiquidGlassContext = createContext<LiquidGlassContextValue | null>(null);

function useLiquidGlassContext() {
  const context = useContext(LiquidGlassContext);
  if (!context) {
    throw new Error('LiquidGlass components must be used within LiquidGlass.Root');
  }
  return context;
}

// Root component
function Root({ children, blur = 'md', glow = false, ...props }: RootProps) {
  return (
    <LiquidGlassContext.Provider value={{ blur, glow }}>
      <div className={cn(glassStyles({ blur, glow }))} {...props}>
        {children}
      </div>
    </LiquidGlassContext.Provider>
  );
}

// Sub-components
function Header({ children, className }: HeaderProps) {
  return (
    <div className={cn('border-b border-white/10 p-4', className)}>
      {children}
    </div>
  );
}

function Content({ children, className }: ContentProps) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
}

function Footer({ children, className }: FooterProps) {
  return (
    <div className={cn('border-t border-white/10 p-4', className)}>
      {children}
    </div>
  );
}

// Export compound component
export const LiquidGlass = {
  Root,
  Header,
  Content,
  Footer,
};

// Usage:
// <LiquidGlass.Root blur="xl" glow>
//   <LiquidGlass.Header>Title</LiquidGlass.Header>
//   <LiquidGlass.Content>Body</LiquidGlass.Content>
// </LiquidGlass.Root>
```

#### Render Props for Flexibility

```tsx
// features/messenger/components/chat-interface.tsx

interface ChatInterfaceProps {
  children: (props: {
    messages: ChatMessage[];
    sendMessage: (content: string) => void;
    isLoading: boolean;
    error: Error | null;
  }) => React.ReactNode;
}

export function ChatInterface({ children }: ChatInterfaceProps) {
  const { messages, sendMessage, isLoading, error } = useChat();

  return <>{children({ messages, sendMessage, isLoading, error })}</>;
}

// Usage - full control over rendering:
// <ChatInterface>
//   {({ messages, sendMessage, isLoading }) => (
//     <div>
//       {messages.map(m => <CustomMessage key={m.id} {...m} />)}
//       <CustomInput onSend={sendMessage} disabled={isLoading} />
//     </div>
//   )}
// </ChatInterface>
```

### 2.4. State Management Strategy

```typescript
// State management hierarchy

/**
 * 1. SERVER STATE (React Query)
 *    - Chat messages, API responses
 *    - Automatic caching, refetching, sync
 */
const { data: messages } = useQuery({
  queryKey: ['chat', sessionId],
  queryFn: () => fetchMessages(sessionId),
});

/**
 * 2. URL STATE (Next.js searchParams)
 *    - Filters, pagination, active tab
 *    - Shareable, bookmarkable
 */
const searchParams = useSearchParams();
const activeTab = searchParams.get('tab') ?? 'chat';

/**
 * 3. FORM STATE (React Hook Form)
 *    - Input values, validation
 *    - Controlled with performance
 */
const { register, handleSubmit } = useForm<ContactFormData>();

/**
 * 4. UI STATE (Local useState/useReducer)
 *    - Modal open/close, animations
 *    - Component-scoped, ephemeral
 */
const [isOpen, setIsOpen] = useState(false);

/**
 * 5. GLOBAL UI STATE (Context - sparingly)
 *    - Theme, global notifications
 *    - Only when truly global
 */
const { theme, setTheme } = useTheme();
```

### 2.5. Error Boundary Strategy

```tsx
// app/error.tsx - Global error boundary
'use client';

import { useEffect } from 'react';
import { ErrorFallback } from '@/shared/components/feedback';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Global error:', error);
  }, [error]);

  return <ErrorFallback error={error} onReset={reset} />;
}

// Feature-level error boundary
// features/messenger/components/messenger-error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MessengerErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Messenger error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-4 text-center">
          <p className="text-white/60">Chat unavailable</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 text-cyan-400 hover:underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 3. Backend Architecture (FastAPI)

### 3.1. Directory Structure (Clean Architecture)

```bash
apps/ai-service/
├── src/
│   ├── __init__.py
│   ├── main.py                   # FastAPI app factory
│   ├── config.py                 # Settings with validation
│   │
│   ├── domain/                   # Core business logic (no dependencies)
│   │   ├── __init__.py
│   │   ├── entities/
│   │   │   ├── __init__.py
│   │   │   ├── agent.py          # AgentConfig entity
│   │   │   ├── chat.py           # ChatSession, ChatMessage
│   │   │   └── knowledge.py      # KnowledgeDocument
│   │   ├── value_objects/
│   │   │   ├── __init__.py
│   │   │   ├── message.py        # Message value object
│   │   │   └── embedding.py      # Vector embedding
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── agent_service.py  # Domain service
│   │   └── exceptions.py         # Domain exceptions
│   │
│   ├── application/              # Use cases, orchestration
│   │   ├── __init__.py
│   │   ├── use_cases/
│   │   │   ├── __init__.py
│   │   │   ├── send_message.py   # SendMessageUseCase
│   │   │   ├── get_history.py    # GetChatHistoryUseCase
│   │   │   └── search_knowledge.py
│   │   ├── interfaces/           # Port interfaces (abstractions)
│   │   │   ├── __init__.py
│   │   │   ├── agent_repository.py
│   │   │   ├── chat_repository.py
│   │   │   ├── llm_provider.py
│   │   │   └── embedding_provider.py
│   │   └── dto/                  # Data transfer objects
│   │       ├── __init__.py
│   │       ├── chat_dto.py
│   │       └── agent_dto.py
│   │
│   ├── infrastructure/           # External implementations
│   │   ├── __init__.py
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   ├── connection.py
│   │   │   ├── models.py         # SQLModel ORM models
│   │   │   └── repositories/
│   │   │       ├── __init__.py
│   │   │       ├── agent_repository.py
│   │   │       └── chat_repository.py
│   │   ├── llm/
│   │   │   ├── __init__.py
│   │   │   ├── gemini_provider.py
│   │   │   └── openai_provider.py  # Future
│   │   ├── embeddings/
│   │   │   ├── __init__.py
│   │   │   └── gemini_embeddings.py
│   │   └── cache/
│   │       ├── __init__.py
│   │       └── redis_cache.py    # Future
│   │
│   ├── api/                      # HTTP interface
│   │   ├── __init__.py
│   │   ├── dependencies.py       # Dependency injection
│   │   ├── middleware/
│   │   │   ├── __init__.py
│   │   │   ├── error_handler.py
│   │   │   ├── rate_limiter.py
│   │   │   └── request_id.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── chat.py
│   │   │   ├── admin.py
│   │   │   └── health.py
│   │   └── schemas/
│   │       ├── __init__.py
│   │       ├── requests.py
│   │       ├── responses.py
│   │       └── errors.py
│   │
│   └── agent/                    # AI Agent system
│       ├── __init__.py
│       ├── factory.py            # Agent factory
│       ├── registry.py           # Tool registry
│       ├── context.py            # Conversation context
│       └── tools/
│           ├── __init__.py
│           ├── base.py           # Tool base class
│           ├── search_tools.py
│           └── info_tools.py
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── alembic/
├── scripts/
├── requirements.txt
├── pyproject.toml
└── Dockerfile
```

### 3.2. Dependency Injection

```python
# src/api/dependencies.py

from functools import lru_cache
from typing import Annotated
from fastapi import Depends
from sqlmodel import Session

from src.config import Settings, get_settings
from src.infrastructure.database.connection import get_session
from src.infrastructure.database.repositories import (
    SQLAgentRepository,
    SQLChatRepository,
)
from src.infrastructure.llm.gemini_provider import GeminiProvider
from src.application.interfaces import (
    AgentRepository,
    ChatRepository,
    LLMProvider,
)
from src.application.use_cases import SendMessageUseCase


# Settings
SettingsDep = Annotated[Settings, Depends(get_settings)]

# Database session
SessionDep = Annotated[Session, Depends(get_session)]


# Repository dependencies (swap implementations easily)
def get_agent_repository(session: SessionDep) -> AgentRepository:
    return SQLAgentRepository(session)


def get_chat_repository(session: SessionDep) -> ChatRepository:
    return SQLChatRepository(session)


def get_llm_provider(settings: SettingsDep) -> LLMProvider:
    return GeminiProvider(api_key=settings.gemini_api_key)


AgentRepoDep = Annotated[AgentRepository, Depends(get_agent_repository)]
ChatRepoDep = Annotated[ChatRepository, Depends(get_chat_repository)]
LLMDep = Annotated[LLMProvider, Depends(get_llm_provider)]


# Use case dependencies
def get_send_message_use_case(
    agent_repo: AgentRepoDep,
    chat_repo: ChatRepoDep,
    llm: LLMDep,
) -> SendMessageUseCase:
    return SendMessageUseCase(
        agent_repository=agent_repo,
        chat_repository=chat_repo,
        llm_provider=llm,
    )


SendMessageDep = Annotated[SendMessageUseCase, Depends(get_send_message_use_case)]
```

### 3.3. Use Case Pattern

```python
# src/application/use_cases/send_message.py

from dataclasses import dataclass
from typing import Optional
import uuid

from src.domain.entities import ChatMessage, ChatSession
from src.domain.exceptions import AgentNotFoundError
from src.application.interfaces import (
    AgentRepository,
    ChatRepository,
    LLMProvider,
)
from src.application.dto import ChatResponseDTO


@dataclass
class SendMessageCommand:
    """Command to send a message to an agent."""
    agent_slug: str
    message: str
    session_id: Optional[str] = None


class SendMessageUseCase:
    """
    Use case for sending messages to AI agents.

    Orchestrates:
    1. Agent configuration retrieval
    2. Session management
    3. Message persistence
    4. LLM interaction
    5. Response handling
    """

    def __init__(
        self,
        agent_repository: AgentRepository,
        chat_repository: ChatRepository,
        llm_provider: LLMProvider,
    ):
        self._agent_repo = agent_repository
        self._chat_repo = chat_repository
        self._llm = llm_provider

    async def execute(self, command: SendMessageCommand) -> ChatResponseDTO:
        # 1. Load agent configuration
        agent = await self._agent_repo.find_by_slug(command.agent_slug)
        if not agent or not agent.is_active:
            raise AgentNotFoundError(f"Agent '{command.agent_slug}' not found")

        # 2. Get or create session
        session_id = command.session_id or str(uuid.uuid4())
        session = await self._chat_repo.find_session(session_id)

        if not session:
            session = ChatSession(
                session_id=session_id,
                agent_slug=command.agent_slug,
            )
            await self._chat_repo.save_session(session)

        # 3. Save user message
        user_message = ChatMessage(
            session_id=session.id,
            role="user",
            content=command.message,
        )
        await self._chat_repo.save_message(user_message)

        # 4. Load conversation context
        history = await self._chat_repo.get_messages(
            session_id=session.id,
            limit=20,
        )

        # 5. Generate response
        response = await self._llm.generate(
            system_prompt=agent.system_prompt,
            messages=history,
            tools=agent.tools,
            temperature=agent.temperature,
        )

        # 6. Save assistant message
        assistant_message = ChatMessage(
            session_id=session.id,
            role="assistant",
            content=response.content,
            tool_calls=response.tool_calls,
        )
        await self._chat_repo.save_message(assistant_message)

        # 7. Return DTO
        return ChatResponseDTO(
            response=response.content,
            session_id=session_id,
            tool_calls=[t.name for t in response.tool_calls] if response.tool_calls else None,
        )
```

### 3.4. Repository Interface

```python
# src/application/interfaces/agent_repository.py

from abc import ABC, abstractmethod
from typing import Optional, List
from src.domain.entities import AgentConfig


class AgentRepository(ABC):
    """Abstract repository for agent configuration."""

    @abstractmethod
    async def find_by_slug(self, slug: str) -> Optional[AgentConfig]:
        """Find agent by slug."""
        pass

    @abstractmethod
    async def find_by_id(self, id: int) -> Optional[AgentConfig]:
        """Find agent by ID."""
        pass

    @abstractmethod
    async def list_active(self) -> List[AgentConfig]:
        """List all active agents."""
        pass

    @abstractmethod
    async def save(self, agent: AgentConfig) -> AgentConfig:
        """Save agent configuration."""
        pass

    @abstractmethod
    async def delete(self, id: int) -> bool:
        """Delete agent by ID."""
        pass


# Implementation
# src/infrastructure/database/repositories/agent_repository.py

from sqlmodel import Session, select
from src.application.interfaces import AgentRepository
from src.domain.entities import AgentConfig


class SQLAgentRepository(AgentRepository):
    """SQLModel implementation of AgentRepository."""

    def __init__(self, session: Session):
        self._session = session

    async def find_by_slug(self, slug: str) -> Optional[AgentConfig]:
        statement = select(AgentConfig).where(
            AgentConfig.slug == slug,
            AgentConfig.is_active == True,
        )
        return self._session.exec(statement).first()

    async def find_by_id(self, id: int) -> Optional[AgentConfig]:
        return self._session.get(AgentConfig, id)

    async def list_active(self) -> List[AgentConfig]:
        statement = select(AgentConfig).where(AgentConfig.is_active == True)
        return list(self._session.exec(statement).all())

    async def save(self, agent: AgentConfig) -> AgentConfig:
        self._session.add(agent)
        self._session.commit()
        self._session.refresh(agent)
        return agent

    async def delete(self, id: int) -> bool:
        agent = self._session.get(AgentConfig, id)
        if agent:
            self._session.delete(agent)
            self._session.commit()
            return True
        return False
```

---

## 4. Type Safety

### 4.1. Frontend Types

```typescript
// shared/types/common.types.ts

/**
 * Branded types for type safety
 */
export type SessionId = string & { readonly __brand: 'SessionId' };
export type AgentSlug = string & { readonly __brand: 'AgentSlug' };

export function createSessionId(id: string): SessionId {
  return id as SessionId;
}

/**
 * Result type for error handling without exceptions
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  meta: {
    requestId: string;
    timestamp: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Strict component props
 */
export interface StrictProps {
  className?: string;
  'data-testid'?: string;
}
```

### 4.2. Backend Types

```python
# src/domain/value_objects/message.py

from dataclasses import dataclass
from enum import Enum
from typing import NewType

# NewType for type safety
SessionId = NewType('SessionId', str)
AgentSlug = NewType('AgentSlug', str)


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


@dataclass(frozen=True)
class MessageContent:
    """Immutable message content value object."""

    text: str

    def __post_init__(self):
        if not self.text or len(self.text) > 4000:
            raise ValueError("Message content must be 1-4000 characters")

    @property
    def word_count(self) -> int:
        return len(self.text.split())

    @property
    def preview(self) -> str:
        return self.text[:100] + "..." if len(self.text) > 100 else self.text
```

---

## 5. Configuration Management

### 5.1. Frontend Config

```typescript
// config/site.config.ts

export const siteConfig = {
  name: 'The Transparent Core',
  description: 'Digital Identity of an AI Engineer',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
  author: {
    name: 'Thiện',
    title: 'AI Engineer',
    email: 'contact@yourdomain.com',
  },
  links: {
    github: 'https://github.com/chithien',
    linkedin: 'https://linkedin.com/in/chithien',
  },
} as const;

// config/animation.config.ts

export const animationConfig = {
  // Spring presets
  spring: {
    gentle: { type: 'spring', stiffness: 120, damping: 14 },
    bouncy: { type: 'spring', stiffness: 300, damping: 10 },
    stiff: { type: 'spring', stiffness: 400, damping: 30 },
  },

  // Duration presets (in seconds)
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
    verySlow: 1,
  },

  // Stagger presets
  stagger: {
    fast: 0.03,
    normal: 0.05,
    slow: 0.1,
  },

  // Easing
  ease: {
    smooth: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
  },
} as const;

export type AnimationPreset = keyof typeof animationConfig.spring;
```

### 5.2. Backend Config

```python
# src/config.py

from functools import lru_cache
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with validation."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Database
    database_url: str = Field(
        default="postgresql://localhost:5432/ai_agent_db",
        description="PostgreSQL connection string",
    )
    db_pool_size: int = Field(default=5, ge=1, le=20)
    db_max_overflow: int = Field(default=10, ge=0, le=50)

    # AI
    gemini_api_key: str = Field(default="", description="Google Gemini API key")
    default_model: str = Field(default="gemini-1.5-flash")
    default_temperature: float = Field(default=0.7, ge=0, le=2)
    max_tokens: int = Field(default=4096, ge=100, le=32000)

    # Rate limiting
    rate_limit_per_minute: int = Field(default=30, ge=1)

    # CORS
    cors_origins: list[str] = Field(
        default=["http://localhost:3000", "http://localhost:3333"]
    )

    # Environment
    environment: str = Field(default="development")
    debug: bool = Field(default=False)
    log_level: str = Field(default="INFO")

    @field_validator("gemini_api_key")
    @classmethod
    def validate_api_key(cls, v: str) -> str:
        """Validate Gemini API key format for fail-fast error detection."""
        if not v:
            # Allow empty in test environment
            return v
        # Google Gemini API keys start with "AIza"
        if not v.startswith("AIza"):
            raise ValueError(
                "Invalid Gemini API key format. "
                "Keys should start with 'AIza'. "
                "Check: https://aistudio.google.com/apikey"
            )
        if len(v) < 30:
            raise ValueError("Gemini API key appears too short")
        return v

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
```

---

## 6. Next Steps

Continue to:
- **[07-visual-excellence.md](./07-visual-excellence.md)** - Animation & visual effects
- **[08-performance-polish.md](./08-performance-polish.md)** - Optimization & accessibility
- **[09-testing-strategy.md](./09-testing-strategy.md)** - Comprehensive testing
