# Runtime Flows

## Public Homepage

Entry:

- `apps/web/src/app/page.tsx`

Flow:

1. Next.js page fetches portfolio data and recent blog posts from the backend.
2. The page renders four main sections: `hero`, `tech`, `credentials`, `soul`.
3. `SmoothScrollContainer` manages section awareness and programmatic navigation.
4. The hero rail shows recent posts and uses self-contained scroll behavior.

## Public Blog

Entries:

- `apps/web/src/app/blog/page.tsx`
- `apps/web/src/app/blog/[slug]/page.tsx`
- `apps/ai-service/src/api/routes/blog.py`

Flow:

1. Frontend fetches `/api/blog` or `/api/blog/{slug}`.
2. Backend only returns published posts.
3. Markdown is rendered on the frontend.

## Admin Blog Editing

Entries:

- `apps/web/src/app/admin/blog/*`
- `apps/web/src/components/admin/blog-post-form.tsx`
- `apps/ai-service/src/api/routes/admin/blog.py`

Flow:

1. Admin authenticates through cookie-based auth.
2. Admin creates or edits a markdown post.
3. Manual save persists to backend.
4. Optional autosave is available after the first save.
5. Publishing writes `published_at` and makes the post visible to public routes.

## Chat Assistant

Entries:

- `apps/web/src/components/features/chat/*`
- `apps/web/src/hooks/use-chat.ts`
- `apps/ai-service/src/api/routes/chat.py`
- `apps/ai-service/src/agent/context.py`

Flow:

1. Frontend sends a user message to `/api/chat/{agent_slug}`.
2. Backend loads agent config from DB.
3. Backend loads or creates chat session and stores the user message.
4. Backend reconstructs conversation history.
5. Backend builds direct portfolio context from DB and knowledge docs.
6. Agent runs with current prompt plus prior message history.
7. Assistant response is stored and returned to client.

## Admin Route Protection

Entry:

- `apps/web/src/proxy.ts`

Flow:

1. Requests under `/admin/*` are intercepted.
2. `/admin/login` remains public.
3. All other admin routes require the `access_token` cookie.
4. Missing cookie redirects to login with the original path in `redirect`.

## Section Navigation

Entries:

- `apps/web/src/components/shared/smooth-scroll-container.tsx`
- `apps/web/src/components/shared/floating-dock.tsx`
- `apps/web/src/components/shared/scroll-button.tsx`
- `apps/web/src/components/shared/scroll-up-button.tsx`

Flow:

1. The page container uses native scrolling with snap sections.
2. `IntersectionObserver` updates the active section.
3. Buttons and dock items dispatch `navigateToSection`.
4. Container scrolls to the target section with native smooth scrolling.

## Nested Scroll Behavior

Entries:

- `apps/web/src/hooks/use-contained-scroll.ts`

Used by:

- chat messages
- chat contact tab
- hero blog rail

Purpose:

- keep wheel/touch scrolling inside the nested container
- prevent local scroll gestures from leaking into the page container
