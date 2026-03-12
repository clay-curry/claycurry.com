# Trace Storage and Retrieval API

How spans are persisted in Redis and how they can be queried.

---

## Table of Contents

1. [Storage Schema](#1-storage-schema)
2. [Write Path](#2-write-path)
3. [Retrieval API](#3-retrieval-api)
4. [Live Streaming (Optional)](#4-live-streaming-optional)
5. [Span Tree Reconstruction](#5-span-tree-reconstruction)
6. [Access Control](#6-access-control)
7. [Storage Limits and Cleanup](#7-storage-limits-and-cleanup)
8. [Client Viewer](#8-client-viewer)

---

## 1. Storage Schema

### Redis Keys

| Key pattern | Type | TTL | Contents |
|-------------|------|-----|----------|
| `{prefix}trace:{traceId}:spans` | List | 1 hour | JSON-encoded span objects, appended via RPUSH |
| `{prefix}trace:{traceId}:meta` | Hash | 1 hour | Trace-level metadata (start time, request count) |

Where `{prefix}` is the environment prefix from `keyPrefix()` (`prod:`, `preview:`,
`dev:`).

### Why Redis Lists?

- **RPUSH is O(1)**: Appending a span is a single atomic operation with no
  read-modify-write cycle.
- **LRANGE is O(N)**: Reading all spans for a trace is a single call. N is bounded
  by the 50-span budget (see data model).
- **Atomic append**: Multiple concurrent requests sharing a trace ID (same cookie
  session) can RPUSH simultaneously without corruption.
- **Natural ordering**: Spans are stored in insertion order, which approximates
  chronological order (root span first, child spans as they complete).

### Span JSON Format

Each list element is a JSON string matching the `Span` interface from
`03-trace-data-model.md`:

```json
{
  "traceId": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
  "spanId": "1234567890abcdef",
  "parentSpanId": null,
  "name": "GET /api/x/bookmarks",
  "startTime": "2026-03-12T14:30:00.123Z",
  "endTime": "2026-03-12T14:30:01.456Z",
  "durationMs": 1333,
  "status": "ok",
  "attributes": {
    "http.method": "GET",
    "http.route": "/api/x/bookmarks",
    "http.status_code": 200
  },
  "events": [
    {
      "timestamp": "2026-03-12T14:30:00.200Z",
      "name": "cache_miss"
    }
  ]
}
```

### Trace Metadata Hash

The `trace:{traceId}:meta` hash stores lightweight aggregation data:

| Field | Type | Description |
|-------|------|-------------|
| `firstSeen` | string (ISO-8601) | Timestamp of the first span written |
| `requestCount` | number | How many root spans exist (how many requests in this session) |
| `spanCount` | number | Total spans written |

This hash is updated atomically with each span write using a Redis transaction
(MULTI/EXEC).

---

## 2. Write Path

### `persistSpan(span: Span): Promise<void>`

```typescript
async function persistSpan(span: Span): Promise<void> {
  const client = await getRedisClient();
  if (!client) {
    // No Redis -- traces are lost in dev without Redis.
    // This is acceptable; tracing is an observability feature, not a
    // correctness requirement.
    return;
  }

  const prefix = keyPrefix();
  const listKey = `${prefix}trace:${span.traceId}:spans`;
  const metaKey = `${prefix}trace:${span.traceId}:meta`;
  const ttlSeconds = 3600; // 1 hour

  const serialized = JSON.stringify(span);

  // Pipeline: append span + update metadata + set TTL
  const multi = client.multi();
  multi.rPush(listKey, serialized);
  multi.hIncrBy(metaKey, "spanCount", 1);

  if (!span.parentSpanId) {
    // Root span -- increment request count
    multi.hIncrBy(metaKey, "requestCount", 1);
    multi.hSetNX(metaKey, "firstSeen", span.startTime);
  }

  // Refresh TTL on every write (sliding window within the trace)
  multi.expire(listKey, ttlSeconds);
  multi.expire(metaKey, ttlSeconds);

  await multi.exec();
}
```

### When to call `persistSpan`

A span is persisted when it **ends** (when `endSpan()` is called). This ensures
`endTime` and `durationMs` are populated. The tracer buffers the span in memory
during its lifetime and writes to Redis exactly once.

### Failure handling

If `persistSpan` throws (Redis connection error), the error is caught and logged
but does NOT propagate to the route handler. Tracing failures must never break
application behavior. The span is silently dropped.

```typescript
try {
  await persistSpan(span);
} catch (err) {
  console.error("Failed to persist span:", err);
  // Span is lost. This is acceptable.
}
```

---

## 3. Retrieval API

### `GET /api/trace/[id]`

Returns all spans for a given trace ID.

**Route file**: `apps/www/app/api/trace/[id]/route.ts`

#### Request

```
GET /api/trace/a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4
```

#### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `tree` | boolean | `false` | If `true`, return spans as a nested tree instead of a flat array |
| `format` | `"json"` \| `"html"` | `"json"` | Response format (HTML viewer is optional/future) |

#### Response (flat mode, default)

```json
{
  "traceId": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
  "meta": {
    "firstSeen": "2026-03-12T14:30:00.123Z",
    "requestCount": 1,
    "spanCount": 8
  },
  "spans": [
    { "spanId": "...", "parentSpanId": null, "name": "GET /api/x/bookmarks", ... },
    { "spanId": "...", "parentSpanId": "...", "name": "BookmarksSyncService.getBookmarks", ... },
    ...
  ]
}
```

Spans are sorted by `startTime` ascending.

#### Response (tree mode)

```json
{
  "traceId": "...",
  "meta": { ... },
  "tree": {
    "span": { "spanId": "root", "name": "GET /api/x/bookmarks", ... },
    "children": [
      {
        "span": { "spanId": "svc1", "name": "BookmarksSyncService.getBookmarks", ... },
        "children": [
          {
            "span": { "spanId": "io1", "name": "redis.get", ... },
            "children": []
          }
        ]
      }
    ]
  }
}
```

#### Error Responses

| Status | Condition |
|--------|-----------|
| 400 | Trace ID fails `/^[0-9a-f]{32}$/` validation |
| 401 | No valid `__trace` cookie and no `X_OWNER_SECRET` |
| 404 | Trace ID not found in Redis (expired or never existed) |
| 429 | Rate limit exceeded (cookie-based access) |

#### Implementation Sketch

```typescript
// apps/www/app/api/trace/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getRedisClient, keyPrefix } from "@/lib/redis";

const TRACE_ID_PATTERN = /^[0-9a-f]{32}$/;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: traceId } = await params;

  // Validate format
  if (!TRACE_ID_PATTERN.test(traceId)) {
    return NextResponse.json({ error: "Invalid trace ID format" }, { status: 400 });
  }

  // Access control
  const cookieTraceId = request.cookies.get("__trace")?.value;
  const ownerSecret = request.headers.get("x-owner-secret")
    ?? new URL(request.url).searchParams.get("secret");
  const isOwner = ownerSecret === process.env.X_OWNER_SECRET;
  const isCookieMatch = cookieTraceId === traceId;

  if (!isOwner && !isCookieMatch) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch from Redis
  const client = await getRedisClient();
  if (!client) {
    return NextResponse.json({ error: "Tracing not available" }, { status: 503 });
  }

  const prefix = keyPrefix();
  const [rawSpans, meta] = await Promise.all([
    client.lRange(`${prefix}trace:${traceId}:spans`, 0, -1),
    client.hGetAll(`${prefix}trace:${traceId}:meta`),
  ]);

  if (!rawSpans || rawSpans.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const spans = rawSpans.map((raw) => JSON.parse(raw));
  spans.sort((a, b) =>
    Date.parse(a.startTime) - Date.parse(b.startTime)
  );

  const wantTree = new URL(request.url).searchParams.get("tree") === "true";

  if (wantTree) {
    return NextResponse.json({
      traceId,
      meta,
      tree: buildSpanTree(spans),
    });
  }

  return NextResponse.json({ traceId, meta, spans });
}
```

---

## 4. Live Streaming (Optional)

### `GET /api/trace/[id]/stream`

Server-Sent Events endpoint for watching spans arrive in real time. Useful for
long-running requests (bookmark sync, chat streaming) where the developer wants
to see spans as they complete.

#### Protocol

```
GET /api/trace/a1b2.../stream
Accept: text/event-stream

< HTTP/1.1 200 OK
< Content-Type: text/event-stream
< Cache-Control: no-cache
< Connection: keep-alive
<
< event: span
< data: {"spanId":"...","name":"redis.get",...}
<
< event: span
< data: {"spanId":"...","name":"XTokenStore.getTokenForSync",...}
<
< event: done
< data: {"spanCount":8}
```

#### Implementation approach

Use Redis Pub/Sub. When `persistSpan()` writes a span, it also publishes to a
channel `trace:{traceId}:live`. The SSE endpoint subscribes to this channel and
forwards messages to the client.

```typescript
// In persistSpan():
await client.publish(
  `${prefix}trace:${span.traceId}:live`,
  serialized,
);
```

#### Deferral note

The SSE endpoint is explicitly optional and should be deferred to after the
basic JSON retrieval works. The primary use case (debugging a completed request)
does not need live streaming.

---

## 5. Span Tree Reconstruction

Given a flat array of spans, reconstruct the parent-child tree:

```typescript
interface SpanNode {
  span: Span;
  children: SpanNode[];
}

function buildSpanTree(spans: Span[]): SpanNode | null {
  if (spans.length === 0) return null;

  const nodeMap = new Map<string, SpanNode>();
  let root: SpanNode | null = null;

  // Create nodes
  for (const span of spans) {
    nodeMap.set(span.spanId, { span, children: [] });
  }

  // Link parents
  for (const span of spans) {
    const node = nodeMap.get(span.spanId)!;
    if (span.parentSpanId) {
      const parent = nodeMap.get(span.parentSpanId);
      if (parent) {
        parent.children.push(node);
      } else {
        // Orphan span (parent not in this trace -- possible if spans were
        // dropped). Attach to root or treat as independent root.
        if (!root) root = node;
      }
    } else {
      // Multiple root spans are possible (multiple requests in one trace session).
      // Return the first root; additional roots become siblings.
      if (!root) {
        root = node;
      }
    }
  }

  // Sort children by startTime
  function sortChildren(node: SpanNode) {
    node.children.sort((a, b) =>
      Date.parse(a.span.startTime) - Date.parse(b.span.startTime)
    );
    for (const child of node.children) {
      sortChildren(child);
    }
  }

  if (root) sortChildren(root);
  return root;
}
```

### Multi-root traces

When a trace ID spans multiple requests (session-level correlation), there will
be multiple root spans (parentSpanId === null). The tree builder can either:

1. Return an array of roots (one tree per request).
2. Create a synthetic "session" root that parents all request roots.

Option 1 is simpler and recommended for the initial implementation.

---

## 6. Access Control

### Authentication model

Two levels of access:

| Actor | Credential | Access |
|-------|-----------|--------|
| **Current session** | `__trace` cookie matching the requested trace ID | Can view own trace only |
| **Site owner** | `X_OWNER_SECRET` in header or query param | Can view any trace |

### Why cookie-match, not "any valid cookie"?

A visitor should only see traces from their own session. If visitor A's cookie
contains trace ID `aaa...`, they cannot request `/api/trace/bbb...` -- even
though they have a valid `__trace` cookie, it does not match the requested trace.

### 404 vs 403

The endpoint returns **404** for both "trace not found" and "access denied". This
prevents an attacker from distinguishing between "this trace exists but I can't
see it" and "this trace doesn't exist", which would be an information leak.

### Rate limiting

Cookie-based access: 10 requests per minute per trace ID, enforced via a Redis
counter with TTL:

```
Key: {prefix}trace-ratelimit:{traceId}:{minute}
Type: String (counter)
TTL: 120 seconds
```

Owner-secret access: No rate limit (trusted).

---

## 7. Storage Limits and Cleanup

### Per-trace limits

| Limit | Value | Enforcement |
|-------|-------|-------------|
| Max spans per trace | 50 | Checked before RPUSH; excess spans are dropped with a warning event |
| Max span JSON size | 8 KB | Checked before RPUSH; oversized spans have attributes truncated |
| Trace TTL | 1 hour | Redis EXPIRE on every write (sliding window) |

### Span count enforcement

Before appending a span, check the list length:

```typescript
const currentLength = await client.lLen(listKey);
if (currentLength >= 50) {
  console.warn(`Trace ${span.traceId} exceeded 50-span budget. Dropping span: ${span.name}`);
  return; // Silently drop
}
```

This adds one extra Redis round-trip per span write. If this latency is
unacceptable, enforce the limit client-side with an in-memory counter per trace
ID in the AsyncLocalStorage context.

### Global storage budget

At the expected traffic volume (< 100 requests/hour), trace storage is negligible:

- 100 requests x 10 spans/request x 500 bytes/span = 500 KB/hour
- With 1-hour TTL, steady-state Redis usage for traces: ~500 KB

No global cleanup mechanism is needed. If traffic grows 100x, add a Redis memory
policy (`maxmemory-policy allkeys-lru`) or reduce the TTL to 15 minutes.

### Development mode

When `KV_REST_API_REDIS_URL` is not set, `persistSpan()` is a no-op. Traces are
not stored. This matches the existing Redis fallback pattern (in-memory store for
views/clicks, but tracing is purely optional and silent).

If local dev tracing is desired in the future, spans could be written to an
in-memory array and served from a dev-only endpoint. This is not in scope for the
initial implementation.

---

## 8. Client Viewer

### Phase 1: JSON dump

The `GET /api/trace/[id]` endpoint returns JSON. Developers inspect it with
curl, browser DevTools, or `jq`. This is sufficient for initial debugging.

```bash
# View a trace as a flat list
curl -H "x-owner-secret: $X_OWNER_SECRET" \
  https://claycurry.com/api/trace/a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4

# View as a tree
curl -H "x-owner-secret: $X_OWNER_SECRET" \
  "https://claycurry.com/api/trace/a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4?tree=true"
```

### Phase 2: HTML viewer (optional, future)

A minimal HTML page at `/api/trace/[id]?format=html` that renders the span tree
as an expandable timeline. Implementation options:

1. Server-rendered HTML (no client JS needed, just CSS for the timeline).
2. A React page in the app router that fetches the JSON endpoint.

Option 1 is preferred for simplicity -- no build step, no bundle impact. The
HTML can be a template string in the route handler.

### Phase 3: Integration with Vercel

If we later adopt OpenTelemetry, spans can be exported to Vercel's built-in
observability dashboard or to an external collector (Honeycomb, Axiom, etc.).
The Redis-based storage then becomes a local/preview-only debugging tool, and
production traces flow to the managed service.
