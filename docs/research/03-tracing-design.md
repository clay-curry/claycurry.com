# Phase 3: Tracing and Observability Design

Summary and index for the tracing system research documents.

---

## Documents

| Document | Description |
|----------|-------------|
| [03-trace-data-model.md](./03-trace-data-model.md) | Defines trace, span, and event schemas; attribute dictionaries per boundary (HTTP, Redis, X API, token, chat); redaction policy; span hierarchies for all major flows |
| [03-cookie-protocol.md](./03-cookie-protocol.md) | `__trace` cookie specification; middleware design for trace ID generation and propagation; lifecycle flow; edge cases (concurrent requests, SSR, streaming, OAuth redirects); security model |
| [03-trace-api.md](./03-trace-api.md) | Redis storage schema (RPUSH lists + metadata hashes); write path with fire-and-forget persistence; `GET /api/trace/[id]` retrieval endpoint; span tree reconstruction; access control; storage limits and cleanup |
| [03-tracer-comparison.md](./03-tracer-comparison.md) | Side-by-side evaluation of Effect.ts native tracer vs. standalone AsyncLocalStorage; code overhead, type safety, integration effort, feature parity |

## Context

This builds on Phase 1 analysis:
- [01-error-flows.md](./01-error-flows.md) -- identified 15+ unhandled error paths and silent swallows across 9 API routes and the X service layer

The app currently has zero observability beyond `console.log`/`console.error`. The
bookmark sync flow (`checkFreshCache -> getToken -> verifyIdentity -> fetchBookmarks
-> saveSnapshot`) is the highest-value trace target, with up to 10 leaf spans and
4 levels of nesting in the worst case.

---

## Key Design Decisions

### 1. Session-level trace IDs (not per-request)

The `__trace` cookie persists for 1 hour, so multiple API requests from the same
browser session share a trace ID. This enables correlating multi-step flows like
the OAuth redirect chain (`/api/x/auth` -> X.com -> `/api/x/callback` ->
`/api/x/bookmarks`). Each request still has its own root span with a unique
`spanId`.

### 2. Middleware as the sole trace ID source

A new `middleware.ts` file (the app has none today) generates and validates trace
IDs, injecting them into request headers. Route handlers never read the cookie
directly -- they read the `x-trace-id` header. This creates a clean separation
between transport (cookie/middleware) and consumption (handler/service).

### 3. Redis as trace storage

Traces are stored as Redis lists (`trace:{traceId}:spans`) with 1-hour TTL.
This reuses the existing Redis infrastructure, requires no new services, and
auto-cleans via TTL. At current traffic (~100 requests/hour), steady-state
storage is under 500 KB.

### 4. Allowlist-only attributes

Span attributes are captured from explicit dictionaries (Section 3 of the data
model), never from arbitrary headers or environment variables. This prevents
accidental secret leakage. OAuth tokens, `X_OWNER_SECRET`, `X_CLIENT_SECRET`,
and all API keys are never stored in trace data.

### 5. Tracing failures are silent

If `persistSpan()` fails (Redis down, span limit exceeded), the error is logged
and swallowed. Tracing must never break application behavior. The existing Redis
fallback pattern (in-memory for views/clicks) is NOT applied to tracing -- traces
are simply dropped when Redis is unavailable.

---

## Recommendation: Hybrid Approach

Start with **AsyncLocalStorage** (Option B) for immediate value with zero new
dependencies and minimal code changes. Design the storage layer (`persistSpan`,
Redis schema, retrieval API) to be tracer-agnostic.

When the Effect.ts migration (Phase 2) lands, add an Effect `Tracer`
implementation that delegates to the same storage layer. Gradually migrate
instrumented routes from ALS `withSpan` to Effect `Effect.withSpan` as their
handlers are converted.

### Implementation order

1. **Middleware** (`apps/www/middleware.ts`) -- trace ID generation, cookie
   management, header injection.
2. **Tracer module** (`lib/tracing/tracer.ts`) -- `withSpan`, `startSpan`,
   `endSpan`, `addEvent`, `setAttributes`.
3. **Storage module** (`lib/tracing/storage.ts`) -- `persistSpan` with Redis
   RPUSH and TTL management.
4. **Retrieval API** (`app/api/trace/[id]/route.ts`) -- JSON endpoint with
   access control.
5. **Instrument bookmarks route** -- first instrumentation target (highest
   complexity, most spans).
6. **Instrument remaining routes** -- chat, views, clicks, contact, feedback,
   OAuth.

### What is NOT in scope

- HTML trace viewer (future Phase 3b).
- SSE live streaming endpoint (future, if needed).
- OpenTelemetry export (future, if adopting managed observability).
- Sampling (unnecessary at current traffic volume).
