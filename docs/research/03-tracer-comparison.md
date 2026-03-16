# Tracer Implementation Comparison

Two approaches for instrumenting the claycurry.studio API routes: Effect.ts native
tracing vs. standalone AsyncLocalStorage. This document evaluates both on code
overhead, type safety, integration effort, and maintenance burden.

---

## Table of Contents

1. [Option A: Effect.ts Native Tracer](#option-a-effectts-native-tracer)
2. [Option B: Standalone AsyncLocalStorage](#option-b-standalone-asynclocalstorage)
3. [Side-by-Side Comparison](#side-by-side-comparison)
4. [Feature Parity Analysis](#feature-parity-analysis)
5. [Recommendation](#recommendation)

---

## Option A: Effect.ts Native Tracer

### How it works

Effect.ts has a built-in `Tracer` interface in `effect/Tracer`. You implement a
custom `Tracer` that writes spans to Redis (per `03-trace-api.md`), then provide
it as a Layer. All `Effect.withSpan()` calls automatically use this tracer, and
span context propagates through Effect's fiber system without any manual
`AsyncLocalStorage` management.

### Custom Tracer implementation

```typescript
// lib/tracing/redis-tracer.ts
import { Tracer, Layer, Effect } from "effect";
import { persistSpan } from "./storage";
import type { Span as TraceSpan } from "./types";

const RedisTracerImpl = Tracer.make({
  span(name, parent, context, links, startTime, kind) {
    const spanId = generateSpanId();
    const traceId = parent?._tag === "Some"
      ? parent.value.traceId
      : context.traceId; // from middleware via FiberRef

    const span: TraceSpan = {
      traceId,
      spanId,
      parentSpanId: parent?._tag === "Some" ? parent.value.spanId : null,
      name,
      startTime: new Date(Number(startTime) / 1_000_000).toISOString(),
      endTime: null,
      durationMs: null,
      status: "ok",
      attributes: {},
      events: [],
    };

    return {
      _tag: "Span",
      name,
      spanId,
      traceId,
      parent,
      context,
      links,
      status: { _tag: "Started", startTime },
      attributes: new Map(),
      kind,
      attribute(key, value) {
        span.attributes[key] = value;
      },
      event(eventName, startTime, attrs) {
        span.events.push({
          timestamp: new Date(Number(startTime) / 1_000_000).toISOString(),
          name: eventName,
          attributes: attrs ? Object.fromEntries(attrs) : undefined,
        });
      },
      end(endTime, exit) {
        span.endTime = new Date(Number(endTime) / 1_000_000).toISOString();
        span.durationMs = (Number(endTime) - Number(startTime)) / 1_000_000;
        span.status = exit._tag === "Failure" ? "error" : "ok";

        // Fire-and-forget persistence
        Effect.runFork(
          Effect.catchAll(
            Effect.tryPromise(() => persistSpan(span)),
            (err) => Effect.logWarning("Failed to persist span", err),
          ),
        );
      },
    };
  },
  context(f) {
    return f();
  },
});

export const RedisTracerLayer = Layer.unwrapEffect(
  Effect.succeed(Layer.setTracer(RedisTracerImpl)),
);
```

### Instrumented route handler (bookmarks)

```typescript
// app/api/x/bookmarks/route.ts -- with Effect tracing
import { Effect, pipe } from "effect";
import { NextResponse } from "next/server";
import { RedisTracerLayer } from "@/lib/tracing/redis-tracer";
import { TraceIdLayer } from "@/lib/tracing/context";

export async function GET(request: NextRequest) {
  const traceId = request.headers.get("x-trace-id") ?? generateTraceId();

  const program = pipe(
    getBookmarksEffect(folderId),
    Effect.withSpan("GET /api/x/bookmarks", {
      attributes: {
        "http.method": "GET",
        "http.route": "/api/x/bookmarks",
      },
    }),
    Effect.provide(RedisTracerLayer),
    Effect.provide(TraceIdLayer(traceId)),
  );

  const result = await Effect.runPromise(program);
  return NextResponse.json(result.response, { status: result.httpStatus });
}
```

**Lines of instrumentation added to route handler**: ~12 (import + pipe wrapper +
provide layers).

### Instrumented service method

```typescript
// lib/x/service.ts -- getBookmarks with Effect spans
getBookmarks(folderId?: string) {
  return Effect.gen(function* () {
    const snapshot = yield* pipe(
      Effect.tryPromise(() => this.options.repository.getSnapshot(this.ownerHint, folderId)),
      Effect.withSpan("redis.get", {
        attributes: { "redis.operation": "get", "redis.key": "snapshot" },
      }),
    );

    if (snapshot && this.isSnapshotFresh(snapshot)) {
      yield* Effect.annotateCurrentSpan("cache_result", "hit");
      return { response: this.snapshotToApiResponse(snapshot, "fresh"), httpStatus: 200 };
    }

    yield* Effect.annotateCurrentSpan("cache_result", "miss");

    const tokenRecord = yield* pipe(
      getTokenForSyncEffect(/* ... */),
      Effect.withSpan("XTokenStore.getTokenForSync"),
    );

    const authenticatedOwner = yield* pipe(
      verifyIdentityEffect(tokenRecord.accessToken),
      Effect.withSpan("XIdentityVerifier.verify"),
    );

    // ... remaining steps, each wrapped in Effect.withSpan
  }).pipe(
    Effect.withSpan("BookmarksSyncService.getBookmarks"),
  );
}
```

**Lines of instrumentation per service method**: ~3-5 per span (pipe + withSpan
wrapper). For the full `getBookmarks` method with ~8 spans, roughly 25-30 lines
of span wrapping added to an existing ~100-line method.

### What must change in existing code

1. **Route handlers**: Wrap the main logic in `Effect.gen` + `Effect.runPromise`.
   This is the primary migration cost.
2. **Service layer**: Convert `BookmarksSyncService` methods to return `Effect`
   instead of `Promise`. This is a significant refactor -- the entire class
   becomes Effect-based.
3. **Redis client**: Wrap Redis calls in `Effect.tryPromise`. Can be done
   incrementally with a thin adapter.
4. **Error types**: Map `XIntegrationError` to Effect's typed error channel.
   The error normalization code becomes `Effect.mapError` calls.

### Pros

- **Automatic propagation**: Parent-child span relationships are handled by
  Effect's fiber system. No manual `parentSpanId` tracking.
- **Type-safe errors**: The error channel carries typed errors. Spans
  automatically capture error status from the `Exit` type.
- **No `AsyncLocalStorage` management**: Effect manages context internally.
- **Composable**: `Effect.withSpan` composes naturally with `Effect.retry`,
  `Effect.timeout`, `Effect.catchTag`, etc.
- **Future-proof**: If the app adopts Effect for error handling (Phase 2), the
  tracing is already integrated.

### Cons

- **Requires Effect adoption**: Cannot use `Effect.withSpan` unless the code is
  running inside an Effect pipeline. The existing `async/await` code must be
  converted.
- **Phase 2 dependency**: This approach only makes sense if Phase 2 (Effect
  migration of the service layer) is committed to.
- **Learning curve**: Contributors unfamiliar with Effect must learn the fiber
  model, Layer system, and generator syntax.
- **Bundle size**: Effect adds ~40-60 KB gzipped to the server bundle (acceptable
  for serverless, but not zero).

---

## Option B: Standalone AsyncLocalStorage

### How it works

Use Node.js `AsyncLocalStorage` to carry trace context through the call stack.
A thin `tracer` module provides `startSpan()` / `endSpan()` functions. Each
instrumentation point calls these manually.

### Tracer module

```typescript
// lib/tracing/tracer.ts
import { AsyncLocalStorage } from "node:async_hooks";
import { persistSpan } from "./storage";
import type { Span, SpanEvent } from "./types";

interface TraceContext {
  traceId: string;
  spanStack: Span[];
}

export const traceStore = new AsyncLocalStorage<TraceContext>();

export function runWithTrace<T>(traceId: string, fn: () => Promise<T>): Promise<T> {
  return traceStore.run({ traceId, spanStack: [] }, fn);
}

export function startSpan(
  name: string,
  attributes?: Record<string, string | number | boolean>,
): Span {
  const ctx = traceStore.getStore();
  if (!ctx) {
    // Not in a traced context -- return a no-op span
    return createNoOpSpan(name);
  }

  const parentSpan = ctx.spanStack[ctx.spanStack.length - 1] ?? null;

  const span: Span = {
    traceId: ctx.traceId,
    spanId: generateSpanId(),
    parentSpanId: parentSpan?.spanId ?? null,
    name,
    startTime: new Date().toISOString(),
    endTime: null,
    durationMs: null,
    status: "ok",
    attributes: attributes ?? {},
    events: [],
  };

  ctx.spanStack.push(span);
  return span;
}

export function addEvent(
  name: string,
  attributes?: Record<string, string | number | boolean>,
): void {
  const ctx = traceStore.getStore();
  if (!ctx) return;
  const span = ctx.spanStack[ctx.spanStack.length - 1];
  if (!span) return;
  span.events.push({
    timestamp: new Date().toISOString(),
    name,
    attributes,
  });
}

export function setAttributes(
  attributes: Record<string, string | number | boolean>,
): void {
  const ctx = traceStore.getStore();
  if (!ctx) return;
  const span = ctx.spanStack[ctx.spanStack.length - 1];
  if (!span) return;
  Object.assign(span.attributes, attributes);
}

export async function endSpan(status: "ok" | "error" = "ok"): Promise<void> {
  const ctx = traceStore.getStore();
  if (!ctx) return;

  const span = ctx.spanStack.pop();
  if (!span) return;

  span.endTime = new Date().toISOString();
  span.durationMs = Date.parse(span.endTime) - Date.parse(span.startTime);
  span.status = status;

  try {
    await persistSpan(span);
  } catch (err) {
    console.error("Failed to persist span:", err);
  }
}

/**
 * Helper: wrap an async function in a span.
 */
export async function withSpan<T>(
  name: string,
  attributes: Record<string, string | number | boolean>,
  fn: () => Promise<T>,
): Promise<T> {
  startSpan(name, attributes);
  try {
    const result = await fn();
    await endSpan("ok");
    return result;
  } catch (err) {
    if (err instanceof Error) {
      setAttributes({
        "error.type": err.constructor.name,
        "error.message": err.message,
      });
    }
    await endSpan("error");
    throw err;
  }
}

function createNoOpSpan(name: string): Span {
  return {
    traceId: "",
    spanId: "",
    parentSpanId: null,
    name,
    startTime: "",
    endTime: null,
    durationMs: null,
    status: "ok",
    attributes: {},
    events: [],
  };
}
```

### Instrumented route handler (bookmarks)

```typescript
// app/api/x/bookmarks/route.ts -- with ALS tracing
import { type NextRequest, NextResponse } from "next/server";
import { runWithTrace, startSpan, endSpan, setAttributes } from "@/lib/tracing/tracer";

export async function GET(request: NextRequest) {
  const traceId = request.headers.get("x-trace-id") ?? generateTraceId();

  return runWithTrace(traceId, async () => {
    startSpan("GET /api/x/bookmarks", {
      "http.method": "GET",
      "http.route": "/api/x/bookmarks",
    });

    try {
      const service = createBookmarksSyncService();
      const { response, httpStatus } = await service.getBookmarks(folderId);
      setAttributes({ "http.status_code": httpStatus });
      await endSpan("ok");
      return NextResponse.json(response, { status: httpStatus });
    } catch (error) {
      setAttributes({
        "http.status_code": 500,
        "error.message": error instanceof Error ? error.message : "Unknown",
      });
      await endSpan("error");
      // ... existing error handling
    }
  });
}
```

**Lines of instrumentation added to route handler**: ~15 (imports + runWithTrace
wrapper + startSpan/endSpan + setAttributes).

### Instrumented service method

```typescript
// lib/x/service.ts -- getBookmarks with ALS tracing
async getBookmarks(folderId?: string) {
  const snapshot = await withSpan(
    "redis.get",
    { "redis.operation": "get", "redis.key": "snapshot" },
    () => this.options.repository.getSnapshot(this.ownerHint, folderId),
  );

  if (snapshot && this.isSnapshotFresh(snapshot)) {
    addEvent("cache_hit");
    return { response: this.snapshotToApiResponse(snapshot, "fresh"), httpStatus: 200 };
  }

  addEvent("cache_miss");

  const tokenRecord = await withSpan(
    "XTokenStore.getTokenForSync",
    { "token.action": "load" },
    () => tokenStore.getTokenForSync(/* ... */),
  );

  const authenticatedOwner = await withSpan(
    "XIdentityVerifier.verify",
    {},
    () => identityVerifier.verify(tokenRecord.accessToken),
  );

  // ... remaining steps, each wrapped in withSpan()
}
```

**Lines of instrumentation per service method**: ~4 per span (withSpan wrapper
replacing the direct call). For the full `getBookmarks` method, roughly 30-35
lines of span wrapping.

### What must change in existing code

1. **Route handlers**: Wrap body in `runWithTrace()`. Add `startSpan`/`endSpan`
   calls. Minimal structural change -- the existing `async/await` code stays
   as-is.
2. **Service layer**: Wrap each I/O call in `withSpan()`. The existing class
   structure and error handling are unchanged.
3. **Redis client**: No changes needed. Tracing wraps the caller, not the Redis
   client itself.
4. **Error types**: No changes. The `withSpan` helper catches errors, attaches
   attributes, and re-throws.

### Pros

- **No new dependencies**: Uses only `node:async_hooks` (built-in).
- **Incremental adoption**: Can instrument one route at a time without touching
  the rest of the codebase.
- **Familiar model**: `async/await` code stays as-is. No new programming paradigm.
- **Zero Phase 2 dependency**: Works regardless of whether Effect.ts is adopted.
- **Simple debugging**: `console.log(traceStore.getStore())` shows the current
  trace context.

### Cons

- **Manual parent tracking**: The `spanStack` approach requires disciplined
  `startSpan`/`endSpan` pairing. An unclosed span corrupts the parent chain
  for all subsequent spans.
- **No type-safe error channel**: Errors are caught generically. The tracer
  does not know the difference between an `XIntegrationError` and a `TypeError`
  unless the caller explicitly sets attributes.
- **Boilerplate**: Every instrumentation point needs an explicit `withSpan()`
  or `startSpan()`/`endSpan()` pair.
- **Fragile nesting**: If a `withSpan` callback throws before `endSpan` is called
  (and the `withSpan` helper is not used), the span stack leaks. The `withSpan`
  helper mitigates this, but direct `startSpan`/`endSpan` usage is error-prone.
- **AsyncLocalStorage edge cases**: `AsyncLocalStorage` context can be lost in
  certain scenarios (e.g., `Promise.allSettled` with unhandled rejections,
  some `EventEmitter` patterns). Not a concern for the current codebase but
  worth noting.

---

## Side-by-Side Comparison

| Dimension | Option A: Effect Tracer | Option B: AsyncLocalStorage |
|-----------|------------------------|----------------------------|
| **New dependencies** | `effect` (~45 KB gzipped) | None (built-in) |
| **Lines per route handler** | ~12 | ~15 |
| **Lines per service span** | ~3-5 | ~4 |
| **Total instrumentation (bookmarks route)** | ~50 lines | ~55 lines |
| **Structural changes to existing code** | Significant (async/await to Effect) | Minimal (wrap in callbacks) |
| **Parent-child tracking** | Automatic (fiber system) | Manual (span stack) |
| **Error type awareness** | Full (typed Exit) | None (generic catch) |
| **Works without Effect Phase 2** | No | Yes |
| **Incremental adoption** | Partial (need Effect runtime per route) | Full (one route at a time) |
| **Span leak risk** | None (fiber lifecycle manages spans) | Medium (unclosed startSpan) |
| **Bundle impact (server)** | +45 KB | 0 |
| **Learning curve** | High (Effect paradigm) | Low (familiar async/await) |
| **OpenTelemetry alignment** | Effect has OTel exporter | Manual OTel bridge needed |
| **Maintenance burden** | Low once adopted; Effect handles context | Medium; must audit span pairing |

---

## Feature Parity Analysis

### What Effect can do that ALS cannot

| Feature | Effect | ALS |
|---------|--------|-----|
| Typed error propagation to spans | Automatic via `Exit.Failure` | Manual attribute setting |
| Span auto-close on fiber interruption | Built-in | Not possible without wrapper |
| Retry with per-attempt spans | `Effect.retry` + `withSpan` composable | Manual retry loop with manual spans |
| Concurrent span forking | `Effect.all` preserves span context per fiber | `Promise.all` shares one ALS context (correct for our use) |
| Timeout spans | `Effect.timeout` + span annotation | Manual `AbortController` + span |
| Structured concurrency | Fibers guarantee all child spans complete | No guarantee; leaked promises lose spans |

### What ALS can do that Effect cannot

| Feature | ALS | Effect |
|---------|-----|--------|
| Instrument non-Effect code | Yes (any async/await code) | No (must be inside Effect pipeline) |
| Instrument third-party libraries | Yes (wrap their calls) | Only if their APIs return Promise/Effect |
| Zero-dependency deployment | Yes | No (requires `effect` package) |
| Gradual removal | Trivial (remove withSpan wrappers) | Requires removing Effect runtime |

---

## Recommendation

### If Phase 2 (Effect migration) is committed: Option A

The Effect tracer provides the cleanest integration with zero span-management
boilerplate. The investment in converting the service layer to Effect pays off
doubly: better error handling AND automatic tracing. The tracer implementation
itself is ~60 lines (the `RedisTracerImpl` above).

### If Phase 2 is uncertain or deferred: Option B

The AsyncLocalStorage approach lets us ship tracing immediately with no new
dependencies and no structural changes to the codebase. The `withSpan` helper
mitigates most of the span-leak risk. The overhead is ~4 lines per
instrumentation point, which is acceptable for 9 route handlers and one complex
service class.

### Hybrid approach (recommended)

Start with **Option B** (AsyncLocalStorage) for immediate value. Design the
`withSpan` and `persistSpan` APIs so they can be called from both async/await
code and Effect pipelines. When Phase 2 lands, implement the Effect `Tracer`
that delegates to the same `persistSpan` function. The storage layer, retrieval
API, and cookie protocol are identical for both approaches.

This means:
1. Implement `lib/tracing/tracer.ts` (Option B) now.
2. Instrument the bookmarks route and service as the first target.
3. When Effect is adopted, add `lib/tracing/redis-tracer.ts` (Option A) that
   reuses `persistSpan` from the same `lib/tracing/storage.ts`.
4. Gradually migrate instrumented routes from ALS `withSpan` to Effect
   `Effect.withSpan` as their handlers are converted to Effect.

The shared `persistSpan` function, Redis schema, and retrieval API mean zero
throwaway work regardless of which tracer approach wins long-term.
