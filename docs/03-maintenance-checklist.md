# Maintenance Checklist

Use this as the cleanup baseline for future passes.

## Runtime Stability

- Keep section scrolling native-first. Avoid reintroducing full-page wheel hijacking.
- Keep nested scroll areas behind `useContainedScroll`.
- Prefer self-contained scroll containers over body/page locks.

## Frontend Maintainability

- Route all API base URL logic through `apps/web/src/lib/api-base.ts`.
- Avoid duplicating fetch clients with different fallback ports.
- Add new public content modules as DB-backed APIs before hardcoding UI mocks.
- Prefer module-focused components over putting logic directly in page files.

## Backend Maintainability

- Add new API schemas under `apps/ai-service/src/api/schemas/*`, not side files.
- Keep route handlers thin when possible; move reusable formatting logic out if it grows.
- Prefer explicit ordering in list endpoints to make UI behavior deterministic.
- Normalize datetime handling at route boundaries before persistence.

## Data and Content

- Treat database content as source of truth for public pages and chat context.
- Keep migration files aligned with model changes in the same change set.
- Avoid mixing static config and DB content unless there is a clear fallback purpose.

## Testing

- Add route-level tests for every new public/admin content module.
- Add focused tests for utility logic that shapes prompts or timestamps.
- Prefer tests that lock business rules rather than implementation details.

## Docs

- Update `README.md` when the main local dev command changes.
- Update `docs/README.md` when adding a new major subsystem doc.
- Keep docs organized from wide to narrow.

## Current Known Follow-Ups

- Knowledge chunking/embedding flow is still a placeholder in admin knowledge upload.
- Frontend does not yet have automated UI tests.
- Some old implementation notes under `docs/implementation/` are broader than the current code and should be treated as historical references, not exact runtime truth.
