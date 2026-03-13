# Cookie Protocol for Trace ID Propagation

How the trace ID is generated, transported, and consumed across the request
lifecycle.

---

## Table of Contents

1. [Cookie Specification](#1-cookie-specification)
2. [Lifecycle Flow](#2-lifecycle-flow)
3. [Middleware Implementation](#3-middleware-implementation)
4. [Propagation Path](#4-propagation-path)
5. [Edge Cases](#5-edge-cases)
6. [Security Considerations](#6-security-considerations)

---

## 1. Cookie Specification

| Property | Value | Rationale |
|----------|-------|-----------|
| **Name** | `__trace` | Short, unlikely to collide. Double-underscore prefix signals internal/infrastructure use. Avoids `x-` prefix to not be confused with the X (Twitter) integration. |
| **Value** | 32-character lowercase hex string | Matches the `traceId` format from the data model. Generated via `crypto.randomUUID().replaceAll("-", "")`. |
| **Path** | `/api` | Traces only matter for API routes. Keeps the cookie off static asset and page requests, reducing cookie overhead on non-API traffic. |
| **SameSite** | `Strict` | All API calls originate from the same origin (fetch from the SPA). No cross-site requests need to carry the trace cookie. |
| **HttpOnly** | `true` | JavaScript does not need to read the trace ID. Prevents XSS from leaking trace IDs. |
| **Secure** | `true` in production, omitted in dev | Required for `SameSite=Strict` on HTTPS. Local dev on `http://localhost` skips this. |
| **Max-Age** | `3600` (1 hour) | Long enough to correlate a user session's API calls. Short enough to limit trace storage growth. After expiry, the next request generates a fresh trace ID. |
| **Domain** | Omitted (defaults to request host) | Single-domain deployment; no subdomain sharing needed. |

### Why not a session cookie (no Max-Age)?

Session cookies die when the browser closes, but "close" is undefined for mobile
browsers and tabs that persist for days. A 1-hour explicit TTL gives us a
predictable upper bound on trace correlation windows and Redis storage.

### Why not `SameSite=Lax`?

`Lax` allows the cookie on top-level navigations from external sites. Our API
endpoints are never navigated to directly (except the OAuth callback, which does
not need trace correlation with prior requests). `Strict` is more restrictive and
correct for our use case.

---

## 2. Lifecycle Flow

```
Browser                    Middleware (Edge)              Route Handler
  |                             |                              |
  |-- GET /api/views?slug=x -->|                              |
  |                             |                              |
  |    (no __trace cookie)      |                              |
  |                             |-- generate traceId           |
  |                             |-- set request header         |
  |                             |   x-trace-id: <traceId>      |
  |                             |                              |
  |                             |-- forward to handler ------->|
  |                             |                              |
  |                             |              reads x-trace-id|
  |                             |              creates root span|
  |                             |              does work...     |
  |                             |                              |
  |                             |<---- response --------------|
  |                             |                              |
  |                             |-- set-cookie: __trace=<id>;  |
  |                             |   Path=/api; HttpOnly;       |
  |                             |   SameSite=Strict;           |
  |                             |   Secure; Max-Age=3600       |
  |                             |                              |
  |<-- response + cookie ------|                              |
  |                             |                              |
  |-- POST /api/views -------->|                              |
  |   Cookie: __trace=<id>     |                              |
  |                             |-- reuse traceId from cookie  |
  |                             |-- set x-trace-id header      |
  |                             |-- forward to handler ------->|
  |                             |                              |
```

### Key points

1. The **middleware** is the single source of truth for trace ID generation.
2. Route handlers never read the cookie directly. They read the `x-trace-id`
   request header, which middleware always sets.
3. The cookie is set on the **response**, so the browser sends it on subsequent
   requests.
4. On the first request (no cookie), middleware generates a fresh ID. All
   subsequent requests within the 1-hour window reuse the same trace ID.

### Trace ID vs. Request ID

The trace ID from the cookie identifies a **correlation session** (all requests
from one browser tab within the TTL window). Each individual request still gets
its own root span with a unique `spanId`. This means:

- Multiple requests can share the same `traceId` (correlated session).
- Each request has a distinct root `spanId`.
- Retrieving `trace:{traceId}:spans` returns spans from potentially multiple
  requests within the session, which is useful for debugging multi-step flows
  like "user loaded blog -> viewed page -> sent chat message".

**Alternative**: If per-request isolation is preferred, generate a fresh trace ID
for every request regardless of cookie. The cookie then serves only as a
"session ID" for grouping. This document assumes the session-correlation model
because it is more useful for debugging the bookmark sync flow, where the user
may trigger `/api/x/auth` then later arrive at `/api/x/callback` and then
`/api/x/bookmarks`.

---

## 3. Middleware Implementation

The app currently has **no `middleware.ts`**. This will be a new file at
`apps/www/middleware.ts`.

```typescript
// apps/www/middleware.ts
import { type NextRequest, NextResponse } from "next/server";

const TRACE_COOKIE = "__trace";
const TRACE_HEADER = "x-trace-id";
const TRACE_TTL_SECONDS = 3600; // 1 hour

function generateTraceId(): string {
  return crypto.randomUUID().replaceAll("-", "");
}

export function middleware(request: NextRequest) {
  const existingTraceId = request.cookies.get(TRACE_COOKIE)?.value;

  // Validate: must be 32-char hex. If malformed, regenerate.
  const isValid = existingTraceId && /^[0-9a-f]{32}$/.test(existingTraceId);
  const traceId = isValid ? existingTraceId : generateTraceId();

  // Clone request headers to inject the trace ID
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(TRACE_HEADER, traceId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Set or refresh the cookie (refresh resets the Max-Age clock)
  if (!isValid) {
    const isProduction = process.env.NODE_ENV === "production";
    response.cookies.set(TRACE_COOKIE, traceId, {
      path: "/api",
      httpOnly: true,
      sameSite: "strict",
      secure: isProduction,
      maxAge: TRACE_TTL_SECONDS,
    });
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
```

### Matcher

The middleware only runs on `/api/*` routes. This avoids adding latency to page
navigations and static asset requests. The matcher pattern `"/api/:path*"`
catches all nested API routes including `/api/x/bookmarks/status`.

### Cookie refresh policy

The cookie is only **set** when no valid cookie exists (first request or
expiry). It is NOT refreshed on every request, because:

1. Refreshing on every request extends the session indefinitely, defeating the
   1-hour TTL purpose.
2. Fewer `Set-Cookie` headers means less response overhead.

If sliding-window sessions are desired later, change the condition to always
set the cookie.

---

## 4. Propagation Path

The trace ID must flow from middleware to the deepest span. The propagation chain:

```
Cookie (__trace)
  |
  v
Middleware
  |  sets request header: x-trace-id
  v
Route Handler
  |  reads: request.headers.get("x-trace-id")
  |  stores in: AsyncLocalStorage context (or Effect context)
  v
Service Layer (BookmarksSyncService, etc.)
  |  reads from: context (no explicit parameter passing)
  v
I/O Layer (Redis calls, fetch calls)
  |  reads from: context
  |  creates child spans with same traceId
  v
Span Storage (Redis RPUSH)
```

### AsyncLocalStorage approach

```typescript
// lib/tracing/context.ts
import { AsyncLocalStorage } from "node:async_hooks";

interface TraceContext {
  traceId: string;
  currentSpanId: string;
}

export const traceStore = new AsyncLocalStorage<TraceContext>();

// In route handler:
const traceId = request.headers.get("x-trace-id") ?? generateTraceId();
await traceStore.run({ traceId, currentSpanId: rootSpan.spanId }, async () => {
  // All code in this callback can access traceStore.getStore()
  await service.getBookmarks(folderId);
});
```

### Effect approach

```typescript
// The trace ID is carried in Effect's context automatically via Layer/Service
// See 03-tracer-comparison.md for details
```

---

## 5. Edge Cases

### No cookie (first visit)

Middleware generates a fresh trace ID and sets the cookie. The first request is
fully traced. No special handling needed.

### Concurrent requests (same trace ID)

If the browser fires multiple API requests simultaneously (e.g., page load
triggers both `/api/views` and `/api/clicks`), all share the same cookie and
thus the same trace ID. Each request gets its own root span with a distinct
`spanId`. The spans are stored in the same Redis list and can be distinguished
by their root span's `http.route` attribute.

This is intentional and useful: it shows what the browser did in a single page
load.

### Cookie expiry

After 1 hour, the browser stops sending the cookie. The next request triggers a
fresh trace ID. Old spans remain in Redis until their independent TTL expires
(see `03-trace-api.md`).

### Malformed cookie

If the cookie value fails the `/^[0-9a-f]{32}$/` validation (e.g., tampered or
corrupted), middleware treats it as absent and generates a fresh ID. This
prevents injection of arbitrary trace IDs.

### Server-side rendering (SSR)

Next.js App Router server components may call API routes internally during SSR.
These internal calls do not carry browser cookies. The middleware will generate
a one-off trace ID for each SSR-initiated API call, which is correct behavior --
SSR requests are independent traces.

### Streaming responses (chat)

The chat route returns a streaming response. The trace ID cookie is set in the
response headers (which are sent before the stream body), so the cookie is
established even if the stream is interrupted.

### OAuth redirect flow

The OAuth flow spans multiple requests:
1. `GET /api/x/auth?secret=...` -- initiates OAuth
2. Browser redirects to X.com (external)
3. `GET /api/x/callback?code=...&state=...` -- OAuth callback

Requests 1 and 3 may carry the same `__trace` cookie if they occur within the
1-hour window. This is the primary motivation for session-level trace IDs: the
callback can be correlated with the auth initiation.

---

## 6. Security Considerations

### Trace ID guessability

Trace IDs are 128-bit random values (UUID v4 minus formatting). The probability
of guessing a valid trace ID is 1 in 2^122 (UUID v4 has 122 random bits). This
is sufficient to prevent enumeration attacks on the trace retrieval API.

### Rate limiting on trace retrieval

The `GET /api/trace/[id]` endpoint (see `03-trace-api.md`) MUST:
- Require either a valid `__trace` cookie matching the requested trace ID, OR
  the `X_OWNER_SECRET` in a query parameter or header.
- Rate-limit unauthenticated (cookie-based) access to 10 requests per minute.
- Return 404 (not 403) for invalid trace IDs to prevent oracle attacks.

### No PII in traces

The redaction policy in `03-trace-data-model.md` Section 4 ensures no tokens,
secrets, or user-identifying information appears in trace data. Trace IDs
themselves are random and not linked to user identity.

### Cookie theft

If an attacker steals the `__trace` cookie (via network sniffing on non-HTTPS),
they can only retrieve trace data for that session. The data contains no secrets
(per redaction policy) and has a 1-hour TTL. The `HttpOnly` and `Secure` flags
mitigate the most common theft vectors (XSS and HTTP downgrade).

### Redis key injection

The trace ID is validated against `/^[0-9a-f]{32}$/` before being used in Redis
keys (`trace:{traceId}:spans`). This prevents injection of arbitrary Redis
commands or key patterns.
