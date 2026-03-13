# Trace Data Model

Defines the core abstractions -- trace, span, attributes, and events -- tailored to
the claycurry.com API surface.

---

## Table of Contents

1. [Definitions](#1-definitions)
2. [Span Schema](#2-span-schema)
3. [Attribute Dictionaries by Boundary](#3-attribute-dictionaries-by-boundary)
4. [Redaction Policy](#4-redaction-policy)
5. [Span Hierarchies](#5-span-hierarchies)

---

## 1. Definitions

### Trace

A **trace** is the complete lifecycle of a single inbound HTTP request, from the
moment the Next.js route handler begins executing to the moment the final response
(or stream close) is delivered to the client. Every trace is identified by a
`traceId` (128-bit hex string, 32 characters).

One trace contains one or more spans arranged in a parent-child tree. The root span
always corresponds to the route handler itself.

### Span

A **span** is a bounded unit of work inside a trace. Examples:

| Layer | Span examples |
|-------|---------------|
| Route handler | `GET /api/x/bookmarks`, `POST /api/chat` |
| Service method | `BookmarksSyncService.getBookmarks`, `fetchGitHubData` |
| External I/O | `redis.get`, `redis.incr`, `fetch api.x.com/2/users/me` |
| Token lifecycle | `XTokenStore.getTokenForSync`, `XTokenStore.refreshTokenRecord` |
| Identity | `XIdentityVerifier.verify`, `XBookmarksOwnerResolver.resolve` |

Spans may nest arbitrarily (a service span contains Redis spans and fetch spans).

### Event

An **event** is a timestamped annotation attached to a span. Events carry no
duration; they mark a point in time. Examples: "cache hit", "token refresh
triggered", "stale snapshot served", "stream chunk emitted".

---

## 2. Span Schema

```typescript
interface Span {
  /** 32-char lowercase hex. Shared by all spans in the same request. */
  traceId: string;

  /** 16-char lowercase hex. Unique within the trace. */
  spanId: string;

  /** 16-char lowercase hex. Null for the root span. */
  parentSpanId: string | null;

  /**
   * Human-readable name.
   * Convention: "<Component>.<method>" for service spans,
   * "<HTTP_METHOD> <path>" for route spans,
   * "<system>.<operation>" for I/O spans (e.g. "redis.get", "x-api.fetchBookmarks").
   */
  name: string;

  /** ISO-8601 timestamp with millisecond precision. */
  startTime: string;

  /** ISO-8601 timestamp. Null while span is still open. */
  endTime: string | null;

  /** Duration in milliseconds. Computed from startTime/endTime. Null while open. */
  durationMs: number | null;

  /** "ok" | "error". Set when span ends. */
  status: "ok" | "error";

  /**
   * Flat key-value bag. All values are strings or numbers.
   * Keys use dot-notation namespaces (http.method, redis.key, error.code).
   */
  attributes: Record<string, string | number | boolean>;

  /**
   * Ordered list of point-in-time annotations.
   */
  events: SpanEvent[];
}

interface SpanEvent {
  /** ISO-8601 timestamp. */
  timestamp: string;

  /** Short name: "cache_hit", "token_refresh", "stale_fallback", etc. */
  name: string;

  /** Optional key-value payload. */
  attributes?: Record<string, string | number | boolean>;
}
```

### ID Generation

- `traceId`: 32-character hex string derived from `crypto.randomUUID()` with
  hyphens stripped. Alternatively, 21-character nanoid if bundle size matters.
- `spanId`: 16-character hex string from `crypto.getRandomValues(new Uint8Array(8))`
  encoded as hex.

Both are generated server-side only. The trace ID originates in middleware (see
`03-cookie-protocol.md`); span IDs are generated at span-creation time.

---

## 3. Attribute Dictionaries by Boundary

### Route Handler Span (root span)

| Key | Type | Source | Example |
|-----|------|--------|---------|
| `http.method` | string | `request.method` | `"GET"` |
| `http.url` | string | `request.url` (path only, no query) | `"/api/x/bookmarks"` |
| `http.route` | string | Next.js route pattern | `"/api/x/bookmarks"` |
| `http.status_code` | number | Response status | `200` |
| `http.query.slug` | string | Query param (when relevant) | `"my-post"` |
| `http.query.folder` | string | Query param (bookmarks) | `"tech"` |
| `http.request_size` | number | `Content-Length` or body byte count | `142` |
| `http.response_size` | number | Response body byte count | `8420` |
| `vercel.region` | string | `process.env.VERCEL_REGION` | `"iad1"` |
| `vercel.env` | string | `process.env.VERCEL_ENV` | `"production"` |

### Redis Span

| Key | Type | Source | Example |
|-----|------|--------|---------|
| `redis.operation` | string | Command name | `"get"`, `"incr"`, `"rpush"` |
| `redis.key` | string | Key (prefix stripped) | `"pageviews:my-post"` |
| `redis.key_prefix` | string | Environment prefix | `"prod:"` |
| `redis.hit` | boolean | Whether key existed | `true` |
| `redis.fallback` | boolean | Fell back to in-memory | `false` |
| `error.message` | string | If operation failed | `"ECONNREFUSED"` |

### X API Span (external HTTP)

| Key | Type | Source | Example |
|-----|------|--------|---------|
| `x_api.endpoint` | string | URL path only | `"/2/users/me"` |
| `x_api.method` | string | HTTP method | `"GET"` |
| `x_api.status_code` | number | Response status | `200` |
| `x_api.rate_limit_remaining` | number | `x-rate-limit-remaining` header | `14` |
| `x_api.rate_limit_reset` | number | `x-rate-limit-reset` header (epoch) | `1710000000` |
| `error.code` | string | `XIntegrationError.code` | `"reauth_required"` |
| `error.message` | string | Error message | `"Token expired"` |

### Token Lifecycle Span

| Key | Type | Source | Example |
|-----|------|--------|---------|
| `token.action` | string | What happened | `"load"`, `"refresh"`, `"exchange"`, `"promote_legacy"` |
| `token.health` | string | Token health after action | `"valid"`, `"expiring"`, `"missing"` |
| `token.owner_match` | boolean | Owner verification result | `true` |
| `token.discarded` | boolean | Token was deleted due to error | `false` |

### Chat / Streaming Span

| Key | Type | Source | Example |
|-----|------|--------|---------|
| `chat.model` | string | Model identifier | `"grok/grok-3-mini"` |
| `chat.mode` | string | `"blog"` or `"general"` | `"blog"` |
| `chat.slug` | string | Blog slug if blog mode | `"effect-ts-intro"` |
| `chat.web_search` | boolean | Web search enabled | `false` |
| `chat.message_count` | number | Messages in conversation | `4` |
| `chat.github_context` | boolean | GitHub data was included | `true` |

### Error Attributes (attached to any span on failure)

| Key | Type | Source | Example |
|-----|------|--------|---------|
| `error.type` | string | Error constructor name | `"XIntegrationError"` |
| `error.code` | string | Structured error code | `"owner_mismatch"` |
| `error.message` | string | Human-readable message | `"Resolved owner does not match"` |
| `error.stack` | string | Stack trace (dev only) | `"XIntegrationError: ..."` |

---

## 4. Redaction Policy

The following values MUST be redacted before a span is persisted or transmitted.
Redaction means the value is replaced with `"[REDACTED]"` or omitted entirely.

### Always Redact

| Secret | Where it appears | Redaction method |
|--------|-----------------|------------------|
| OAuth access tokens | `tokenRecord.accessToken`, fetch `Authorization` headers | Never stored in attributes. If logged, replace with `"[REDACTED]"`. |
| OAuth refresh tokens | `tokenRecord.refreshToken` | Never stored in attributes. |
| `X_OWNER_SECRET` | Query param in auth routes | Strip from `http.url` before storing. |
| `X_CLIENT_SECRET` | Token exchange request body | Never stored in attributes. |
| `GITHUB_TOKEN` | Fetch headers in chat route | Never stored in attributes. |
| `RESEND_API_KEY` | Email API calls | Never stored in attributes. |
| `KV_REST_API_REDIS_URL` | Redis connection | Never stored in attributes. |
| Cookie values | `viewed_pages`, session cookies | Never stored in attributes. |

### Implementation Rule

Attributes are an allowlist, not a denylist. The tracer only records attributes
from the dictionaries defined in Section 3. Arbitrary `request.headers` or
`process.env` values are never automatically captured.

### Query Parameter Scrubbing

For `http.url`, strip query parameters entirely and store only the pathname.
If specific query params are needed (like `slug` or `folder`), capture them as
named attributes (`http.query.slug`), never as part of the raw URL.

The `secret` query parameter used in `/api/x/auth` and `/api/x/bookmarks/status`
MUST never appear in any attribute.

---

## 5. Span Hierarchies

### 5.1 Bookmark Sync (`GET /api/x/bookmarks`)

This is the deepest span tree in the application:

```
GET /api/x/bookmarks                              [root]
  |
  +-- BookmarksSyncService.getBookmarks            [service]
  |     |
  |     +-- redis.get (snapshot lookup)            [io]
  |     |     event: "cache_hit" or "cache_miss"
  |     |
  |     +-- redis.get (status lookup)              [io]
  |     |
  |     +-- XTokenStore.getTokenForSync            [service]
  |     |     |
  |     |     +-- redis.get (token record)         [io]
  |     |     |
  |     |     +-- XTokenStore.refreshTokenRecord   [service]  (conditional)
  |     |     |     |
  |     |     |     +-- fetch POST api.x.com       [io]
  |     |     |           /2/oauth2/token
  |     |     |
  |     |     +-- XIdentityVerifier.verify         [service]  (inside callback)
  |     |           |
  |     |           +-- fetch GET api.x.com        [io]
  |     |                 /2/users/me
  |     |
  |     +-- XIdentityVerifier.verify               [service]
  |     |     |
  |     |     +-- fetch GET api.x.com/2/users/me   [io]
  |     |
  |     +-- XBookmarksOwnerResolver.resolve        [service]
  |     |     |
  |     |     +-- fetch GET api.x.com              [io]
  |     |           /2/users/by/username/:username
  |     |
  |     +-- fetch GET api.x.com                    [io]
  |     |     /2/users/:id/bookmarks
  |     |
  |     +-- fetch GET api.x.com                    [io]
  |     |     /2/users/:id/bookmark_folders
  |     |
  |     +-- redis.set (save snapshot)              [io]
  |     |
  |     +-- redis.set (save status)                [io]
```

**Worst-case depth**: 4 levels (root -> service -> token store -> fetch).
**Worst-case breadth**: up to 10 leaf spans in a full live sync with token refresh.

On cache hit, the tree collapses to:

```
GET /api/x/bookmarks                              [root]
  |
  +-- BookmarksSyncService.getBookmarks            [service]
        |
        +-- redis.get (snapshot lookup)            [io]
              event: "cache_hit"
```

### 5.2 Chat Streaming (`POST /api/chat`)

```
POST /api/chat                                     [root]
  |
  +-- parseRequestBody                             [service]
  |
  +-- fetchGitHubData                              [service]  (if general mode)
  |     |
  |     +-- fetch GET api.github.com/users/:user   [io]
  |     |
  |     +-- fetch GET api.github.com               [io]
  |           /users/:user/repos
  |
  +-- getPostContent                               [service]  (if blog mode)
  |
  +-- streamText                                   [service]
        event: "stream_start"
        event: "stream_end"
        (individual chunks are NOT traced -- too noisy)
```

### 5.3 Views Increment (`POST /api/views`)

```
POST /api/views                                    [root]
  |
  +-- parseRequestBody                             [service]
  |
  +-- redis.get (view count -- dedup check)        [io]  (if duplicate)
  |
  +-- redis.incr (increment count)                 [io]  (if new view)
  |     event: "fallback_to_memory" (if Redis fails)
  |
  +-- setCookie (viewed_pages)                     [event on root span]
```

### 5.4 OAuth Callback (`GET /api/x/callback`)

```
GET /api/x/callback                                [root]
  |
  +-- redis.get (retrieve code_verifier)           [io]
  |
  +-- redis.del (delete used state)                [io]
  |
  +-- XTokenStore.exchangeAuthorizationCode        [service]
  |     |
  |     +-- fetch POST api.x.com/2/oauth2/token    [io]
  |
  +-- XIdentityVerifier.verify                     [service]
  |     |
  |     +-- fetch GET api.x.com/2/users/me         [io]
  |
  +-- XBookmarksOwnerResolver.resolve              [service]
  |     |
  |     +-- fetch GET api.x.com                    [io]
  |           /2/users/by/username/:username
  |
  +-- XTokenStore.storeVerifiedToken               [service]
  |     |
  |     +-- redis.set (token record)               [io]
  |
  +-- redis.set (sync status)                      [io]
```

---

## Design Decisions

### Why flat attributes instead of nested objects?

Flat dot-notation keys (`redis.operation`, `x_api.status_code`) serialize to JSON
compactly, are trivially filterable, and align with OpenTelemetry semantic
conventions. If we ever export to an OTel collector, the mapping is 1:1.

### Why ISO-8601 timestamps instead of epoch millis?

Human readability in the JSON viewer (Phase 1 of the trace UI). Epoch millis would
be more efficient for sorting, but `Date.parse()` handles ISO-8601 natively and the
span count per trace is small enough (< 20) that sort performance is irrelevant.

### Why no sampling?

At the current traffic volume (personal portfolio), every request is traced. If
traffic grows significantly, add a `sampled: boolean` flag to the trace and a
sampling rate config. The cookie protocol (see `03-cookie-protocol.md`) already
supports this -- simply skip trace ID generation for unsampled requests.

### Span budget

A single trace MUST NOT exceed 50 spans. If a loop creates unbounded spans (e.g.,
paginated bookmark fetches), the tracer should aggregate them into a single span
with a `count` attribute rather than creating one span per iteration.
