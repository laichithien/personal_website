# Testing Strategy

**Document:** Production Testing Guide
**Project:** The Transparent Core
**Coverage Target:** 80%+ meaningful coverage

---

## 1. Testing Philosophy

### 1.1. Testing Pyramid

```
                    ┌─────────────┐
                    │     E2E     │  ← Few, critical paths
                    │   (5-10%)   │
                    └──────┬──────┘
                           │
               ┌───────────┴───────────┐
               │     Integration       │  ← API, component interaction
               │       (20-30%)        │
               └───────────┬───────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │            Unit Tests             │  ← Fast, isolated
         │             (60-70%)              │
         └───────────────────────────────────┘
```

### 1.2. Testing Principles

| Principle | Description |
|-----------|-------------|
| **Test Behavior** | Test what, not how - focus on outcomes |
| **Meaningful Coverage** | 80% of valuable paths > 100% of everything |
| **Fast Feedback** | Unit tests < 10ms, Integration < 1s |
| **Reliable** | No flaky tests - deterministic results |
| **Maintainable** | Tests as documentation, easy to update |

---

## 2. Frontend Testing (Next.js)

### 2.1. Testing Stack

```json
// package.json
{
  "devDependencies": {
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@playwright/test": "^1.40.0",
    "vitest": "^1.1.0",
    "@vitejs/plugin-react": "^4.2.0",
    "jsdom": "^23.0.0",
    "msw": "^2.0.0"
  }
}
```

### 2.2. Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/index.ts',
        'src/app/**/layout.tsx',
        'src/app/**/loading.tsx',
        'src/app/**/error.tsx',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 2.3. Test Setup

```typescript
// tests/setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { server } from './mocks/server';

// MSW setup
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});
```

### 2.4. MSW Handlers

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Chat API
  http.post('/api/chat/:agentSlug', async ({ request, params }) => {
    const body = await request.json() as { message: string; session_id?: string };

    return HttpResponse.json({
      response: `Mock response to: ${body.message}`,
      session_id: body.session_id || 'mock-session-123',
      tool_calls: null,
    });
  }),

  // Health check
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      version: '0.1.0',
    });
  }),
];

// tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

---

## 3. Component Testing

### 3.1. UI Component Tests

```typescript
// shared/components/ui/liquid-glass/liquid-glass.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LiquidGlass } from './liquid-glass';

describe('LiquidGlass', () => {
  it('renders children correctly', () => {
    render(
      <LiquidGlass>
        <span>Test content</span>
      </LiquidGlass>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies blur classes based on prop', () => {
    const { container } = render(
      <LiquidGlass blur="xl">Content</LiquidGlass>
    );

    expect(container.firstChild).toHaveClass('backdrop-blur-xl');
  });

  it('applies glow effect when enabled', () => {
    const { container } = render(
      <LiquidGlass glow="cyan">Content</LiquidGlass>
    );

    expect(container.firstChild).toHaveClass('ring-1', 'ring-cyan-500/20');
  });

  it('is accessible with proper structure', () => {
    render(
      <LiquidGlass data-testid="glass-card">
        <h2>Card Title</h2>
        <p>Card description</p>
      </LiquidGlass>
    );

    const card = screen.getByTestId('glass-card');
    expect(card).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Card Title' })).toBeInTheDocument();
  });

  it('supports hover interactions when hoverable', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <LiquidGlass hoverable>Hover me</LiquidGlass>
    );

    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('transition-all');

    // Hover behavior is primarily visual, tested via E2E
  });
});
```

### 3.2. Feature Component Tests

```typescript
// features/messenger/components/chat-interface.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatInterface } from './chat-interface';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('ChatInterface', () => {
  it('renders empty state initially', () => {
    render(<ChatInterface />, { wrapper: createWrapper() });

    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument(); // No messages
  });

  it('sends message on submit', async () => {
    const user = userEvent.setup();
    render(<ChatInterface />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/type a message/i);
    const submitButton = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'Hello, AI!');
    await user.click(submitButton);

    // User message appears
    await waitFor(() => {
      expect(screen.getByText('Hello, AI!')).toBeInTheDocument();
    });

    // AI response appears (from MSW mock)
    await waitFor(() => {
      expect(screen.getByText(/mock response/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while waiting for response', async () => {
    const user = userEvent.setup();
    render(<ChatInterface />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/type a message/i);
    await user.type(input, 'Hello');
    await user.keyboard('{Enter}');

    expect(screen.getByRole('status')).toBeInTheDocument(); // Loading indicator
  });

  it('disables input while sending', async () => {
    const user = userEvent.setup();
    render(<ChatInterface />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/type a message/i);
    await user.type(input, 'Hello');
    await user.keyboard('{Enter}');

    expect(input).toBeDisabled();
  });

  it('handles error gracefully', async () => {
    // Override handler to return error
    server.use(
      http.post('/api/chat/:slug', () => {
        return HttpResponse.json(
          { error: { code: 'ERROR', message: 'Failed' } },
          { status: 500 }
        );
      })
    );

    const user = userEvent.setup();
    render(<ChatInterface />, { wrapper: createWrapper() });

    await user.type(screen.getByPlaceholderText(/type/i), 'Hello');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
```

### 3.3. Hook Testing

```typescript
// features/messenger/hooks/use-chat.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useChat } from './use-chat';

describe('useChat', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  it('initializes with empty messages', () => {
    const { result } = renderHook(() => useChat(), { wrapper });

    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('adds user message immediately on send', async () => {
    const { result } = renderHook(() => useChat(), { wrapper });

    result.current.sendMessage('Hello');

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject({
      role: 'user',
      content: 'Hello',
    });
  });

  it('adds assistant response after API call', async () => {
    const { result } = renderHook(() => useChat(), { wrapper });

    result.current.sendMessage('Hello');

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[1].role).toBe('assistant');
    });
  });

  it('preserves session ID across messages', async () => {
    const { result } = renderHook(() => useChat(), { wrapper });

    result.current.sendMessage('First');
    await waitFor(() => expect(result.current.sessionId).toBeDefined());

    const sessionId = result.current.sessionId;

    result.current.sendMessage('Second');
    await waitFor(() => {
      expect(result.current.sessionId).toBe(sessionId);
    });
  });
});
```

---

## 4. Backend Testing (Python)

### 4.1. Testing Stack

```txt
# requirements-dev.txt
pytest>=7.4.0
pytest-asyncio>=0.23.0
pytest-cov>=4.1.0
httpx>=0.25.0
factory-boy>=3.3.0
faker>=22.0.0
respx>=0.20.0
```

### 4.2. Pytest Configuration

```toml
# pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_functions = ["test_*"]
asyncio_mode = "auto"
addopts = [
    "--strict-markers",
    "--cov=src",
    "--cov-report=term-missing",
    "--cov-report=html",
    "--cov-fail-under=80",
]
markers = [
    "slow: marks tests as slow",
    "integration: marks tests as integration tests",
]
```

### 4.3. Fixtures

```python
# tests/conftest.py
import pytest
from typing import AsyncGenerator
from sqlmodel import Session, create_engine, SQLModel
from sqlalchemy.pool import StaticPool
from httpx import AsyncClient, ASGITransport

from src.main import app
from src.database.connection import get_db
from src.config import Settings


@pytest.fixture
def settings() -> Settings:
    """Test settings with in-memory database."""
    return Settings(
        database_url="sqlite:///:memory:",
        gemini_api_key="test-key",
        environment="test",
    )


@pytest.fixture
def db_engine(settings):
    """Create test database engine."""
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)


@pytest.fixture
def db_session(db_engine) -> Session:
    """Create test database session."""
    with Session(db_engine) as session:
        yield session


@pytest.fixture
async def client(db_session) -> AsyncGenerator[AsyncClient, None]:
    """Create test HTTP client."""

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()
```

### 4.4. Factory Boy Factories

```python
# tests/factories.py
import factory
from factory.alchemy import SQLAlchemyModelFactory
from src.database.models import AgentConfig, ToolDefinition, ChatSession, ChatMessage


class AgentConfigFactory(SQLAlchemyModelFactory):
    class Meta:
        model = AgentConfig
        sqlalchemy_session_persistence = "commit"

    slug = factory.Sequence(lambda n: f"agent-{n}")
    name = factory.Faker("name")
    model_provider = "google-gla"
    model_name = "gemini-1.5-flash"
    system_prompt = factory.Faker("paragraph")
    temperature = 0.7
    is_active = True


class ToolDefinitionFactory(SQLAlchemyModelFactory):
    class Meta:
        model = ToolDefinition
        sqlalchemy_session_persistence = "commit"

    name = factory.Sequence(lambda n: f"tool_{n}")
    description = factory.Faker("sentence")
    is_active = True


class ChatSessionFactory(SQLAlchemyModelFactory):
    class Meta:
        model = ChatSession
        sqlalchemy_session_persistence = "commit"

    session_id = factory.Faker("uuid4")
    agent_slug = "portfolio-assistant"


class ChatMessageFactory(SQLAlchemyModelFactory):
    class Meta:
        model = ChatMessage
        sqlalchemy_session_persistence = "commit"

    role = "user"
    content = factory.Faker("sentence")
```

### 4.5. Unit Tests

```python
# tests/unit/test_agent_factory.py
import pytest
from unittest.mock import Mock, patch
from src.agent.factory import AgentFactory, AgentNotFoundError
from src.agent.registry import AVAILABLE_TOOLS
from tests.factories import AgentConfigFactory, ToolDefinitionFactory


class TestAgentFactory:
    def test_load_agent_returns_configured_agent(self, db_session):
        # Arrange
        agent_config = AgentConfigFactory(
            slug="test-agent",
            system_prompt="You are a test agent.",
        )
        db_session.add(agent_config)
        db_session.commit()

        factory = AgentFactory(db_session)

        # Act
        agent = factory.load_agent("test-agent")

        # Assert
        assert agent is not None
        assert agent.system_prompt == "You are a test agent."

    def test_load_agent_raises_for_unknown_slug(self, db_session):
        factory = AgentFactory(db_session)

        with pytest.raises(AgentNotFoundError):
            factory.load_agent("nonexistent-agent")

    def test_load_agent_raises_for_inactive_agent(self, db_session):
        agent_config = AgentConfigFactory(slug="inactive", is_active=False)
        db_session.add(agent_config)
        db_session.commit()

        factory = AgentFactory(db_session)

        with pytest.raises(AgentNotFoundError):
            factory.load_agent("inactive")

    def test_load_agent_includes_linked_tools(self, db_session):
        # Arrange
        agent_config = AgentConfigFactory(slug="tooled-agent")
        tool = ToolDefinitionFactory(name="get_cv_info")

        db_session.add_all([agent_config, tool])
        db_session.commit()

        # Link tool to agent
        link = AgentToolLink(agent_id=agent_config.id, tool_id=tool.id)
        db_session.add(link)
        db_session.commit()

        factory = AgentFactory(db_session)

        # Act
        agent = factory.load_agent("tooled-agent")

        # Assert
        assert len(agent.tools) == 1
```

### 4.6. Integration Tests

```python
# tests/integration/test_chat_api.py
import pytest
from httpx import AsyncClient


class TestChatAPI:
    async def test_health_check(self, client: AsyncClient):
        response = await client.get("/health")

        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    async def test_send_message_creates_session(
        self,
        client: AsyncClient,
        db_session,
    ):
        # Seed agent
        from tests.factories import AgentConfigFactory
        AgentConfigFactory._meta.sqlalchemy_session = db_session
        AgentConfigFactory(slug="portfolio-assistant")

        # Act
        response = await client.post(
            "/api/chat/portfolio-assistant",
            json={"message": "Hello!"},
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "session_id" in data
        assert data["session_id"] is not None

    async def test_send_message_maintains_session(
        self,
        client: AsyncClient,
        db_session,
    ):
        from tests.factories import AgentConfigFactory
        AgentConfigFactory._meta.sqlalchemy_session = db_session
        AgentConfigFactory(slug="portfolio-assistant")

        # First message
        response1 = await client.post(
            "/api/chat/portfolio-assistant",
            json={"message": "Hello!"},
        )
        session_id = response1.json()["session_id"]

        # Second message with same session
        response2 = await client.post(
            "/api/chat/portfolio-assistant",
            json={"message": "How are you?", "session_id": session_id},
        )

        assert response2.json()["session_id"] == session_id

    async def test_invalid_agent_returns_404(self, client: AsyncClient):
        response = await client.post(
            "/api/chat/nonexistent-agent",
            json={"message": "Hello!"},
        )

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    async def test_empty_message_returns_422(self, client: AsyncClient):
        response = await client.post(
            "/api/chat/portfolio-assistant",
            json={"message": ""},
        )

        assert response.status_code == 422
```

---

## 5. E2E Testing (Playwright)

### 5.1. Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
    process.env.CI ? ['github'] : ['line'],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### 5.2. E2E Tests

```typescript
// e2e/home.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display hero section', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /thiện/i })).toBeVisible();
    await expect(page.getByText(/ai engineer/i)).toBeVisible();
  });

  test('should navigate to sections via dock', async ({ page }) => {
    await page.goto('/');

    // Click tech section link
    await page.getByRole('button', { name: /tech/i }).click();

    // Should scroll to tech section
    await expect(page.locator('#tech')).toBeInViewport();
  });

  test('should open messenger on button click', async ({ page }) => {
    await page.goto('/');

    // Click messenger button
    await page.getByRole('button', { name: /open chat/i }).click();

    // Messenger window should appear
    await expect(page.getByRole('dialog', { name: /messenger/i })).toBeVisible();
  });

  test('should close messenger on escape key', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /open chat/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});

// e2e/chat.spec.ts
test.describe('Chat Messenger', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /open chat/i }).click();
  });

  test('should send and receive messages', async ({ page }) => {
    const input = page.getByPlaceholder(/type a message/i);
    const sendButton = page.getByRole('button', { name: /send/i });

    // Type and send message
    await input.fill('What do you do?');
    await sendButton.click();

    // User message appears
    await expect(page.getByText('What do you do?')).toBeVisible();

    // AI response appears (wait for it)
    await expect(
      page.getByText(/ai engineer|projects|experience/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('should switch between chat and contact tabs', async ({ page }) => {
    // Default is chat tab
    await expect(page.getByPlaceholder(/type a message/i)).toBeVisible();

    // Switch to contact tab
    await page.getByRole('tab', { name: /email me/i }).click();

    // Contact form should appear
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/message/i)).toBeVisible();
  });
});

// e2e/accessibility.spec.ts
test.describe('Accessibility', () => {
  test('should have no accessibility violations', async ({ page }) => {
    await page.goto('/');

    // Using axe-playwright
    const { injectAxe, checkA11y } = await import('@axe-core/playwright');
    await injectAxe(page);

    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Should eventually reach messenger button
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      if ((await focused.getAttribute('aria-label'))?.includes('chat')) {
        break;
      }
    }

    // Enter opens messenger
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should respect reduced motion preference', async ({ page }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Animations should be disabled or instant
    // This is primarily verified by visual inspection
    await expect(page.locator('body')).toBeVisible();
  });
});
```

### 5.3. Visual Regression Tests

```typescript
// e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('hero section matches snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for animations to settle
    await page.waitForTimeout(1000);

    await expect(page.locator('#hero')).toHaveScreenshot('hero-section.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('messenger dialog matches snapshot', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /open chat/i }).click();
    await page.waitForTimeout(500); // Wait for animation

    await expect(page.getByRole('dialog')).toHaveScreenshot('messenger.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('responsive - mobile hero', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#hero')).toHaveScreenshot('hero-mobile.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});
```

---

## 6. CI/CD Pipeline

### 6.1. GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/web/package-lock.json

      - name: Install dependencies
        working-directory: apps/web
        run: npm ci

      - name: Run unit tests
        working-directory: apps/web
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: apps/web/coverage/lcov.info
          flags: frontend

  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: --health-cmd pg_isready

    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        working-directory: apps/ai-service
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Run tests
        working-directory: apps/ai-service
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          GEMINI_API_KEY: test-key
        run: pytest --cov --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: apps/ai-service/coverage.xml
          flags: backend

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [frontend-tests, backend-tests]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Playwright
        working-directory: apps/web
        run: |
          npm ci
          npx playwright install --with-deps

      - name: Run E2E tests
        working-directory: apps/web
        run: npm run test:e2e

      - name: Upload report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: apps/web/playwright-report/
```

---

## 7. Test Commands

```json
// apps/web/package.json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

```toml
# apps/ai-service/pyproject.toml
[tool.pytest.ini_options]
# ... config above

[tool.coverage.run]
source = ["src"]
omit = ["*/tests/*", "*/__pycache__/*"]
```

---

## 8. Summary

| Test Type | Tool | Target | Speed |
|-----------|------|--------|-------|
| Unit (Frontend) | Vitest | Components, Hooks | < 10ms |
| Unit (Backend) | Pytest | Services, Use Cases | < 50ms |
| Integration | Vitest + MSW | API calls | < 1s |
| Integration | Pytest + httpx | Full API | < 1s |
| E2E | Playwright | User flows | < 10s |
| Visual | Playwright | Snapshots | < 5s |
| Accessibility | axe-playwright | WCAG | < 2s |

**Total CI Time Target:** < 5 minutes
