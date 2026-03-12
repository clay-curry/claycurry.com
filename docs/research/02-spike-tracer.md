# Spike: Effect Tracer for Custom Span Persistence

**Status**: Research complete
**Date**: 2026-03-12
**Verdict**: GO — Effect's Tracer interface is simple to implement, and Redis span persistence is straightforward.

---

## 1. Can we write a custom Tracer that stores spans in Redis?

**Yes.** Effect exposes a `Tracer` interface in `effect/Tracer` with a single key method: `span()`. A custom implementation creates `Span` objects and can hook into their lifecycle (specifically `end()`) to persist data.

The interface (simplified from source):

```ts
import type { Context, Option } from "effect"

interface Tracer {
  span(
    name: string,
    parent: Option.Option<AnySpan>,
    context: Context.Context<never>,
    links: ReadonlyArray<SpanLink>,
    startTime: bigint,
    kind: SpanKind
  ): Span
}

interface Span {
  readonly _tag: "Span"
  readonly name: string
  readonly spanId: string
  readonly traceId: string
  readonly parent: Option.Option<AnySpan>
  readonly status: SpanStatus
  readonly attributes: ReadonlyMap<string, unknown>
  readonly links: ReadonlyArray<SpanLink>
  attribute(key: string, value: unknown): void
  event(name: string, startTime: bigint, attributes?: Record<string, unknown>): void
  end(endTime: bigint, exit: Exit<unknown, unknown>): void
}
```

A Redis-persisting implementation would buffer span data in memory during the span's lifetime, then serialize and push to Redis on `end()`. Here is a concrete implementation:

```ts
import { Tracer, Context, Option, Exit, Layer, Effect } from "effect"
import type { RedisClientType } from "redis"

interface RedisSpanRecord {
  traceId: string
  spanId: string
  parentSpanId: string | null
  name: string
  startTime: string
  endTime: string
  durationMs: number
  status: "ok" | "error" | "unset"
  attributes: Record<string, unknown>
  events: Array<{ name: string; time: string; attributes?: Record<string, unknown> }>
  exitTag: "Success" | "Failure" | "Interrupt"
  errorMessage?: string
}

function makeRedisTracer(redis: RedisClientType, keyPrefix: string): Tracer.Tracer {
  return Tracer.make({
    span(name, parent, _context, links, startTime, _kind) {
      const spanId = crypto.randomUUID()
      const traceId = Option.match(parent, {
        onNone: () => crypto.randomUUID(),
        onSome: (p) => p.traceId,
      })
      const attrs = new Map<string, unknown>()
      const events: RedisSpanRecord["events"] = []
      let spanStatus: Tracer.SpanStatus = { _tag: "Unset" }

      const span: Tracer.Span = {
        _tag: "Span",
        name,
        spanId,
        traceId,
        parent,
        links,
        get status() { return spanStatus },
        get attributes() { return attrs },

        attribute(key, value) {
          attrs.set(key, value)
        },

        event(eventName, eventTime, eventAttrs) {
          events.push({
            name: eventName,
            time: new Date(Number(eventTime / 1_000_000n)).toISOString(),
            attributes: eventAttrs,
          })
        },

        end(endTime, exit) {
          spanStatus = Exit.match(exit, {
            onSuccess: () => ({ _tag: "Ok" as const, startTime, endTime }),
            onFailure: (cause) => ({
              _tag: "Error" as const,
              startTime,
              endTime,
              message: String(cause),
            }),
          })

          const record: RedisSpanRecord = {
            traceId,
            spanId,
            parentSpanId: Option.match(parent, {
              onNone: () => null,
              onSome: (p) => p.spanId,
            }),
            name,
            startTime: new Date(Number(startTime / 1_000_000n)).toISOString(),
            endTime: new Date(Number(endTime / 1_000_000n)).toISOString(),
            durationMs: Number((endTime - startTime) / 1_000_000n),
            status: Exit.isSuccess(exit) ? "ok" : "error",
            attributes: Object.fromEntries(attrs),
            events,
            exitTag: Exit.match(exit, {
              onSuccess: () => "Success" as const,
              onFailure: () => "Failure" as const,
            }),
            errorMessage: Exit.isFailure(exit) ? String(exit.cause) : undefined,
          }

          // Fire-and-forget push to Redis list keyed by traceId
          const key = `${keyPrefix}trace:${traceId}:spans`
          redis.rPush(key, JSON.stringify(record)).catch((err) => {
            console.error("[RedisTracer] Failed to persist span:", err)
          })

          // Also set a TTL so traces auto-expire (e.g., 24 hours)
          redis.expire(key, 86400).catch(() => {})
        },
      }

      return span
    },
  })
}
```

### Sources
- [Effect Tracer.ts API](https://effect-ts.github.io/effect/effect/Tracer.ts.html)
- [Effect Tracing Documentation](https://effect.website/docs/observability/tracing/)

---

## 2. How do `Effect.withSpan()` and `Effect.annotateCurrentSpan()` propagate through `Effect.gen` pipelines?

**`Effect.withSpan(name, options?)`** wraps an effect in a new span. The span becomes the "current span" in the fiber's context for all effects nested inside. This propagation is automatic through `Effect.gen` generators:

```ts
const getBookmarks = Effect.gen(function* () {
  const cached = yield* checkCache
  if (cached) return cached

  const token = yield* getToken
  yield* Effect.annotateCurrentSpan("token.status", "refreshed")

  const owner = yield* verifyIdentity(token)
  yield* Effect.annotateCurrentSpan("owner.username", owner.username)

  const bookmarks = yield* fetchBookmarks(token, owner)
  yield* Effect.annotateCurrentSpan("bookmarks.count", bookmarks.length)

  return bookmarks
}).pipe(Effect.withSpan("BookmarkSync"))
```

Key behaviors:
- **Type preservation**: `Effect.withSpan` does not alter the `Effect<A, E, R>` type signature.
- **Parent-child nesting**: When a `withSpan`-wrapped effect yields another `withSpan`-wrapped effect, the inner span automatically becomes a child of the outer span.
- **Annotations are scoped**: `annotateCurrentSpan` attaches key-value pairs to the nearest enclosing span only.
- **Generators propagate context**: Each `yield*` in `Effect.gen` carries the fiber context (including current span) forward.

---

## 3. Can span data include arbitrary attributes?

**Yes.** Both `Effect.withSpan` options and `Effect.annotateCurrentSpan` support arbitrary key-value attributes:

```ts
// At span creation time
Effect.withSpan("FetchBookmarks", {
  attributes: {
    "http.method": "GET",
    "http.url": "https://api.x.com/2/users/.../bookmarks",
    "x.owner_id": ownerId,
  }
})

// During execution
Effect.annotateCurrentSpan("http.status_code", 200)
Effect.annotateCurrentSpan("bookmarks.count", 42)
Effect.annotateCurrentSpan("cache.hit", false)
Effect.annotateCurrentSpan("error.code", "rate_limited")
```

Attribute values can be strings, numbers, booleans, or arrays thereof. The `Span.attribute(key, value)` method on the Tracer interface accepts `unknown`, so our Redis tracer can serialize anything JSON-compatible.

The custom `end()` callback receives an `Exit<A, E>` value, so we can capture:
- **Success values**: bookmark count, snapshot timestamp
- **Error values**: error code, error message, token status
- **Timing**: start/end bigints provide nanosecond precision

---

## 4. Span structure for the bookmark sync flow

The bookmark sync flow maps naturally to a parent span with child spans:

```
BookmarkSync (root span)
├── CheckCache
│   attributes: { cache.hit: true/false, cache.age_seconds: 120 }
├── GetToken
│   attributes: { token.status: "refreshed"|"valid", token.expires_in_ms: 3600000 }
├── VerifyIdentity
│   attributes: { owner.username: "claycurry", owner.id: "123456" }
├── FetchBookmarks
│   attributes: { http.status: 200, bookmarks.count: 42, folders.count: 3 }
└── SaveSnapshot
    attributes: { snapshot.source: "live", snapshot.bookmark_count: 42 }
```

In Effect code:

```ts
const checkCache = (owner: BookmarkSourceOwner, folderId?: string) =>
  Effect.gen(function* () {
    const snapshot = yield* repository.getSnapshot(owner, folderId)
    const isFresh = snapshot ? isSnapshotFresh(snapshot) : false
    yield* Effect.annotateCurrentSpan("cache.hit", !!snapshot && isFresh)
    if (snapshot) {
      yield* Effect.annotateCurrentSpan(
        "cache.age_seconds",
        Math.floor((Date.now() - Date.parse(snapshot.cachedAt)) / 1000)
      )
    }
    return isFresh ? snapshot : null
  }).pipe(Effect.withSpan("CheckCache"))

const getToken = Effect.gen(function* () {
  const record = yield* tokenStore.getTokenForSync(verifyOwnerFn)
  yield* Effect.annotateCurrentSpan("token.status", deriveTokenHealth(record.expiresAt))
  yield* Effect.annotateCurrentSpan("token.expires_in_ms", record.expiresAt - Date.now())
  return record
}).pipe(Effect.withSpan("GetToken"))

const verifyIdentity = (token: string) =>
  Effect.gen(function* () {
    const owner = yield* identityVerifier.verify(token)
    yield* Effect.annotateCurrentSpan("owner.username", owner.username)
    yield* Effect.annotateCurrentSpan("owner.id", owner.id)
    return owner
  }).pipe(Effect.withSpan("VerifyIdentity"))

const fetchBookmarks = (ownerId: string, token: string, folderId?: string) =>
  Effect.gen(function* () {
    const [bookmarks, folders] = yield* Effect.all([
      folderId
        ? client.fetchBookmarksByFolder(ownerId, folderId, token)
        : client.fetchAllBookmarks(ownerId, token),
      client.fetchBookmarkFolders(ownerId, token),
    ])
    yield* Effect.annotateCurrentSpan("bookmarks.count", bookmarks.length)
    yield* Effect.annotateCurrentSpan("folders.count", folders.length)
    return { bookmarks, folders }
  }).pipe(Effect.withSpan("FetchBookmarks"))

const saveSnapshot = (snapshot: BookmarksSnapshotRecord) =>
  Effect.gen(function* () {
    yield* repository.setSnapshot(config.ownerUsername, snapshot)
    yield* Effect.annotateCurrentSpan("snapshot.source", "live")
    yield* Effect.annotateCurrentSpan("snapshot.bookmark_count", snapshot.bookmarks.length)
  }).pipe(Effect.withSpan("SaveSnapshot"))
```

---

## 5. TracerLayer that captures spans to a Redis list per trace ID

**Yes.** We provide the custom tracer as a `Layer`:

```ts
import { Layer, Effect, Tracer } from "effect"
import type { RedisClientType } from "redis"

// Effect service tag for Redis
class RedisService extends Effect.Tag("RedisService")<
  RedisService,
  { client: RedisClientType }
>() {}

// Build the TracerLayer
const RedisTracerLayer = Layer.effect(
  Tracer.Tracer,
  Effect.gen(function* () {
    const { client } = yield* RedisService
    const prefix = process.env.VERCEL_ENV === "production" ? "prod:" : "dev:"
    return makeRedisTracer(client, prefix)
  })
)

// Provide the Redis dependency
const RedisLiveLayer = Layer.effect(
  RedisService,
  Effect.sync(() => {
    const client = createClient({ url: process.env.KV_REST_API_REDIS_URL })
    // connect is async, but for Layer we'd use Effect.promise
    return { client }
  })
)

// Compose layers
const AppTracerLayer = RedisTracerLayer.pipe(Layer.provide(RedisLiveLayer))
```

Usage at the application boundary:

```ts
import { Effect } from "effect"

const program = getBookmarksSyncEffect(folderId).pipe(
  Effect.withSpan("BookmarkSync.getBookmarks")
)

// Run with the custom tracer layer
const result = await Effect.runPromise(
  program.pipe(Effect.provide(AppTracerLayer))
)
```

### Redis data structure

Each trace produces a Redis list at key `{prefix}trace:{traceId}:spans`. Example query to retrieve a full trace:

```ts
const spans = await redis.lRange(`prod:trace:${traceId}:spans`, 0, -1)
const trace = spans.map((s) => JSON.parse(s))
// Returns array of RedisSpanRecord objects, ordered by completion time
```

Each key auto-expires after 24 hours (configurable). For longer retention, a background job could archive traces to a more permanent store.

---

## 6. How does `Logger.structured` integrate with custom spans?

Effect's `Logger.structured` outputs JSON log entries that include a `spans` field tracking active log spans. When combined with tracing:

```ts
import { Effect, Logger } from "effect"

const program = Effect.gen(function* () {
  yield* Effect.log("Starting bookmark sync")
  const token = yield* getToken
  yield* Effect.log("Token acquired")
  // ...
}).pipe(
  Effect.withSpan("BookmarkSync"),
  Effect.withLogSpan("bookmark-sync")
)

// Provide structured logger
const runnable = program.pipe(Effect.provide(Logger.structured))
```

Output:
```json
{
  "message": "Token acquired",
  "logLevel": "INFO",
  "timestamp": "2026-03-12T10:00:00.000Z",
  "annotations": {},
  "spans": { "bookmark-sync": 42 },
  "fiberId": "#3"
}
```

Key integration points:

1. **Log spans vs trace spans**: `Effect.withLogSpan` creates lightweight timing spans that appear in log output. `Effect.withSpan` creates full tracing spans. Both can coexist.

2. **Span events from logs**: When using `@effect/opentelemetry`, `Effect.log()` calls within a traced span are automatically converted to **Span Events** in the OpenTelemetry output. This means logs become part of the trace timeline.

3. **Annotations carry through**: `Effect.annotateLogs({ "sync.phase": "token" })` adds context to all subsequent log messages, complementing span attributes.

4. **For our Redis tracer**: We capture log-originated span events in the `event()` method of our custom Span implementation, so they appear in the persisted trace data alongside timing and attribute data.

### Sources
- [Effect Logging Documentation](https://effect.website/docs/observability/logging/)
- [Effect Tracing Documentation](https://effect.website/docs/observability/tracing/)

---

## Go/No-Go Verdict: GO

### Reasons

1. **Simple interface**: The `Tracer` interface requires implementing only a `span()` factory method. Our custom Redis persistence hooks into `Span.end()`.

2. **Zero-overhead opt-in**: `Effect.withSpan` does not change effect types. We can instrument incrementally — start with `getBookmarks`, expand later.

3. **Reuses existing Redis**: Our app already has a Redis client (`lib/redis.ts`) with environment-prefixed keys. The tracer layer follows the same pattern.

4. **Rich context capture**: Span attributes, events, and exit values give us everything needed for debugging the bookmark sync flow (token status, cache hits, error codes, timing).

5. **OpenTelemetry compatibility**: If we later want Grafana/Tempo visualization, we can swap `RedisTracerLayer` for `@effect/opentelemetry`'s `NodeSdk.layer` without changing any `withSpan`/`annotateCurrentSpan` call sites.

### Risks

- **Fire-and-forget persistence**: The Redis write in `end()` is async but not awaited. If Redis is down, spans are silently lost. Mitigation: add an in-memory buffer with periodic flush, or log failures.
- **Span data volume**: High-traffic traces could produce significant Redis writes. Mitigation: sampling (only trace N% of requests) or conditional tracing via `Effect.withTracerEnabled(false)`.

### Next steps

1. Add `effect` to `package.json` dependencies
2. Implement `RedisTracer` in `lib/x/tracing.ts`
3. Instrument `getBookmarks()` with 5 child spans (as shown in section 4)
4. Add a `/api/x/traces/[traceId]` debug endpoint for development
