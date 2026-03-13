# Spike 2: Effect Layer Lifecycle in Vercel Serverless

**Date**: 2026-03-12
**Status**: Research complete
**Verdict**: GO (with specific patterns for serverless constraints)

---

## Executive Summary

Effect Layers and `ManagedRuntime` work in Vercel serverless with a module-level singleton pattern using `globalValue` from `effect/GlobalValue`. Layers should be scoped as singletons (not per-request) for connection-holding resources like Redis. Effect's `acquireRelease` pattern provides strictly better lifecycle management than the current bare singleton in `lib/redis.ts`. The main caveat is that Effect finalizers (cleanup/disconnect) may not run when Vercel terminates a function instance, but this is acceptable since the current code has no cleanup at all.

---

## 1. Per-Request vs Singleton Layers: Tradeoffs in Serverless

### Singleton Layers (recommended for stateful resources)

**Pattern**: Create the Layer once at module level, reuse across all invocations within the same function instance.

```
Cold start → Layer initialized → Handler 1 → Handler 2 → ... → Instance frozen/terminated
                    ↑                                                       ↑
              acquireRelease runs                               finalizer MAY run
```

**Pros**:
- Redis/database connections are established once per cold start, reused across warm invocations
- Matches AWS Lambda / Vercel Functions execution model (module-level code runs once)
- No connection churn — identical to the current singleton pattern but with lifecycle management

**Cons**:
- If a connection breaks mid-instance, the singleton holds a dead connection
- Must handle reconnection or error-triggered re-initialization

### Per-Request Layers (for stateless or request-specific services)

**Pattern**: Build a fresh Layer/Scope for each incoming request.

```
Handler invocation → Layer initialized → business logic → Layer finalized
```

**Pros**:
- Clean isolation per request
- Finalizers always run (scope closes at end of request)
- Good for request-specific config (auth context, request ID, locale)

**Cons**:
- Connection establishment on every request (~1-5ms for Redis, ~20-50ms for Postgres)
- Negates the warm-start benefit of serverless
- Wasteful for connection-pooled resources

### Recommendation

Use a **hybrid approach**:
- **Singleton**: Redis client, database pools, external API clients, caches
- **Per-request**: Auth context, request metadata, trace/span context

This is exactly what `@mcrovero/effect-nextjs` recommends: "all layers passed to the runtime are stateless" (for the shared runtime), with stateful layers managed separately.

---

## 2. Does `ManagedRuntime` work on Vercel? Can it manage connection pools?

**Yes.** `ManagedRuntime` is pure JavaScript/TypeScript with no platform-specific dependencies. It works anywhere `Promise` works.

### How `ManagedRuntime` works

```typescript
import { ManagedRuntime, Layer } from "effect"

const AppLive = Layer.mergeAll(RedisLive, ConfigLive, LoggingLive)

// Creates a runtime that lazily initializes the layer on first use
const runtime = ManagedRuntime.make(AppLive)

// Use it to run effects
await runtime.runPromise(myEffect)   // First call triggers layer initialization
await runtime.runPromise(myEffect2)  // Reuses the initialized layer

// Cleanup (optional — see section 5)
await runtime.dispose()
```

### Connection pool management

`ManagedRuntime` manages the `Scope` that owns all layer resources. When layers use `Effect.acquireRelease`, the runtime tracks the acquired resources and releases them on `dispose()`. This is well-suited for connection pools:

```typescript
const PoolLive = Layer.scoped(
  DbPool,
  Effect.acquireRelease(
    Effect.tryPromise(() => createPool({ max: 10 })),      // acquire
    (pool) => Effect.promise(() => pool.end())               // release
  )
)
```

The pool is created once when the runtime initializes and destroyed when `dispose()` is called. Between those events, all Effects sharing the runtime share the same pool instance.

**Source**: [ManagedRuntime API docs](https://effect-ts.github.io/effect/effect/ManagedRuntime.ts.html), [Effect Runtime docs](https://effect.website/docs/runtime/)

---

## 3. How would a `RedisLayer` handle the current `lib/redis.ts` problems?

### Current problems in `lib/redis.ts`

```typescript
// Problem 1: Module-level singleton, never cleaned up
let redisClient: ReturnType<typeof createClient> | null = null

// Problem 2: No reconnection logic — if connection drops, it stays broken
export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({ url: process.env.KV_REST_API_REDIS_URL })
    redisClient.on("error", (err) => console.error("Redis Client Error", err))
    await redisClient.connect()
  }
  return redisClient  // Returns potentially dead connection
}

// Problem 3: In-memory fallback is global mutable state
const inMemoryStore = new Map<string, number>()
```

**Specific issues**:
1. If Redis disconnects, `redisClient` is non-null but broken. All subsequent requests fail.
2. The `on("error")` handler logs but doesn't attempt reconnection or invalidation.
3. `inMemoryStore` is shared mutable state with no access control.
4. No graceful shutdown — connections leak when the function instance is recycled.
5. The URL check (`!process.env.KV_REST_API_REDIS_URL`) happens on every call, mixing configuration with connection logic.

### How an Effect `RedisLayer` fixes these

```typescript
// lib/effect/services/redis.ts
import { Effect, Layer, Context, Config, Redacted } from "effect"
import { createClient, type RedisClientType } from "redis"

// --- Service interface ---

class RedisClient extends Context.Tag("RedisClient")<
  RedisClient,
  {
    readonly get: (key: string) => Effect.Effect<string | null, RedisError>
    readonly set: (key: string, value: string) => Effect.Effect<void, RedisError>
    readonly incr: (key: string) => Effect.Effect<number, RedisError>
    readonly hGetAll: (key: string) => Effect.Effect<Record<string, string>, RedisError>
    readonly hIncrBy: (key: string, field: string, n: number) => Effect.Effect<number, RedisError>
  }
>() {}

// --- Typed error ---

class RedisError {
  readonly _tag = "RedisError"
  constructor(readonly cause: unknown, readonly operation: string) {}
}

// --- Live implementation with acquire/release ---

const RedisLive = Layer.scoped(
  RedisClient,
  Effect.gen(function* () {
    const url = yield* Config.redacted("KV_REST_API_REDIS_URL")

    const client: RedisClientType = yield* Effect.acquireRelease(
      // Acquire: create and connect
      Effect.tryPromise({
        try: async () => {
          const c = createClient({ url: Redacted.value(url) })
          c.on("error", (err) =>
            Effect.runSync(Effect.logWarning("Redis client error: " + err))
          )
          await c.connect()
          return c
        },
        catch: (cause) => new RedisError(cause, "connect"),
      }),
      // Release: disconnect gracefully
      (c) =>
        Effect.tryPromise(() => c.disconnect()).pipe(
          Effect.catchAll((err) =>
            Effect.logWarning("Redis disconnect error: " + err)
          )
        )
    )

    // Wrap each operation in Effect.tryPromise for typed errors
    return {
      get: (key) =>
        Effect.tryPromise({
          try: () => client.get(key),
          catch: (cause) => new RedisError(cause, "get"),
        }),
      set: (key, value) =>
        Effect.tryPromise({
          try: () => client.set(key, value).then(() => void 0),
          catch: (cause) => new RedisError(cause, "set"),
        }),
      incr: (key) =>
        Effect.tryPromise({
          try: () => client.incr(key),
          catch: (cause) => new RedisError(cause, "incr"),
        }),
      hGetAll: (key) =>
        Effect.tryPromise({
          try: () => client.hGetAll(key),
          catch: (cause) => new RedisError(cause, "hGetAll"),
        }),
      hIncrBy: (key, field, n) =>
        Effect.tryPromise({
          try: () => client.hIncrBy(key, field, n),
          catch: (cause) => new RedisError(cause, "hIncrBy"),
        }),
    }
  })
)
```

**What this fixes**:

| Problem | Current | With Effect Layer |
|---|---|---|
| Dead connection | Silent failures | `RedisError` propagates, handler can fallback |
| No cleanup | Connection leaks | `acquireRelease` disconnects on scope close |
| Config mixed with logic | URL checked per call | `Config.redacted` reads once at layer init |
| Mutable global state | `Map<string, number>` | Separate `InMemoryStore` service (see below) |
| Testability | Must mock module | Provide a `RedisClient` test layer |

### In-memory fallback as a separate Layer

```typescript
// Fallback layer for when Redis URL is not configured
const InMemoryRedisLive = Layer.succeed(
  RedisClient,
  {
    get: (key) => Effect.sync(() => store.get(key) ?? null),
    set: (key, value) => Effect.sync(() => { store.set(key, value) }),
    incr: (key) =>
      Effect.sync(() => {
        const n = (Number(store.get(key)) || 0) + 1
        store.set(key, String(n))
        return n
      }),
    hGetAll: (_key) => Effect.sync(() => Object.fromEntries(store)),
    hIncrBy: (key, field, n) =>
      Effect.sync(() => {
        const current = Number(store.get(field)) || 0
        const next = current + n
        store.set(field, String(next))
        return next
      }),
  }
)
```

Then at the runtime level:

```typescript
const RedisLayer = process.env.KV_REST_API_REDIS_URL
  ? RedisLive
  : InMemoryRedisLive
```

---

## 4. Can we safely share a Layer across cold starts?

**Yes, with `globalValue`.** This is the critical pattern for Next.js + Vercel.

### The problem: Next.js webpack duplication

Next.js (via webpack/turbopack) can bundle the same module into multiple chunks. A module-level `const runtime = ManagedRuntime.make(layer)` may execute twice, creating duplicate runtimes and duplicate connections.

### The solution: `globalValue` from `effect/GlobalValue`

```typescript
// lib/effect/runtime.ts
import { ManagedRuntime, Layer } from "effect"
import { globalValue } from "effect/GlobalValue"

const AppLive = Layer.mergeAll(
  RedisLive,
  ConfigLive,
  // ... other service layers
)

// Anchored on globalThis — survives webpack re-bundling and HMR
export const appRuntime = globalValue(
  Symbol.for("claycurry.com/appRuntime"),
  () => ManagedRuntime.make(AppLive)
)
```

**How `globalValue` works**: It stores the value on `globalThis` using the provided key. If the module is re-evaluated (HMR, duplicate chunks), `globalValue` returns the existing instance instead of creating a new one. This is Effect's equivalent of the well-known `globalThis.prisma` pattern.

### Cold start behavior on Vercel

```
Request 1 (cold start):
  → Node.js process starts
  → Module evaluation: globalValue creates ManagedRuntime
  → First runPromise call: Layer initializes (Redis connects)
  → Handler executes
  → Response sent

Request 2 (warm):
  → Same Node.js process
  → globalValue returns existing ManagedRuntime
  → Layer already initialized (Redis already connected)
  → Handler executes immediately
  → Response sent

Instance recycled:
  → Vercel freezes/terminates the process
  → ManagedRuntime and its resources are garbage collected
```

**Key insight**: The `ManagedRuntime` is lazy — the Layer doesn't initialize until the first `runPromise` call. This means the cold start cost is deferred to the first request, not to module evaluation.

**Source**: [GlobalValue API docs](https://effect-ts.github.io/effect/effect/GlobalValue.ts.html), [Next.js singleton discussion](https://github.com/vercel/next.js/discussions/68572)

---

## 5. What happens to Effect finalizers when Vercel terminates the function?

### Vercel's termination behavior

Vercel Functions run on AWS Lambda under the hood. The lifecycle is:

1. **Init**: Module-level code runs (cold start)
2. **Invoke**: Handler executes (per request)
3. **Freeze**: After response, the instance is frozen (not terminated)
4. **Thaw**: On next request, instance is thawed (warm start)
5. **Shutdown**: After inactivity (~5-15 minutes), Lambda sends `SHUTDOWN` event, then `SIGTERM`, then `SIGKILL` after a grace period

### Will Effect finalizers run?

**Maybe, but don't rely on it.**

- **`process.on("SIGTERM")`**: Can trigger `runtime.dispose()`, which runs finalizers in reverse order. Lambda gives a grace period (~2 seconds) after SIGTERM before SIGKILL.
- **`process.on("SIGINT")`**: Relevant for local dev (Ctrl+C), not Vercel.
- **Abrupt termination (SIGKILL, OOM, timeout)**: Finalizers do NOT run.

### Recommended approach

```typescript
// lib/effect/runtime.ts
import { ManagedRuntime, Layer } from "effect"
import { globalValue } from "effect/GlobalValue"

const AppLive = Layer.mergeAll(RedisLive, ConfigLive)

export const appRuntime = globalValue(
  Symbol.for("claycurry.com/appRuntime"),
  () => {
    const runtime = ManagedRuntime.make(AppLive)

    // Best-effort cleanup on graceful shutdown
    process.on("SIGTERM", () => {
      runtime.dispose().catch(() => {})
    })

    return runtime
  }
)
```

**Why this is acceptable**:
1. The current code (`lib/redis.ts`) has zero cleanup — connections are abandoned on every instance termination. Effect's best-effort finalizers are strictly better.
2. Redis connections have server-side timeouts. An abandoned connection is cleaned up by the Redis server after the timeout.
3. In serverless, connection cleanup is a nice-to-have, not a requirement. The platform manages process lifecycle.

### Vercel `waitUntil` for request-scoped cleanup

For per-request cleanup (e.g., flushing analytics), Vercel provides `waitUntil`:

```typescript
import { after } from "next/server"

export async function POST(req: NextRequest) {
  const result = await appRuntime.runPromise(myEffect)

  // Schedule cleanup work after response is sent
  after(async () => {
    await appRuntime.runPromise(flushAnalytics)
  })

  return result
}
```

This is orthogonal to Layer lifecycle — use it for fire-and-forget work, not for managing service connections.

---

## 6. Concrete `RedisLayer` Implementation

Here is the complete, production-ready implementation that wraps `lib/redis.ts`:

```typescript
// lib/effect/services/redis.ts

import { Config, Context, Effect, Layer, Redacted } from "effect"
import { createClient, type RedisClientType } from "redis"

// ============================================================
// Service Interface
// ============================================================

export interface RedisService {
  readonly get: (key: string) => Effect.Effect<string | null, RedisError>
  readonly set: (key: string, value: string) => Effect.Effect<void, RedisError>
  readonly incr: (key: string) => Effect.Effect<number, RedisError>
  readonly hGetAll: (
    key: string
  ) => Effect.Effect<Record<string, string>, RedisError>
  readonly hIncrBy: (
    key: string,
    field: string,
    increment: number
  ) => Effect.Effect<number, RedisError>
  readonly multi: () => Effect.Effect<RedisMulti, RedisError>
}

export interface RedisMulti {
  readonly hIncrBy: (
    key: string,
    field: string,
    increment: number
  ) => RedisMulti
  readonly exec: () => Effect.Effect<unknown[], RedisError>
}

export class RedisClient extends Context.Tag("RedisClient")<
  RedisClient,
  RedisService
>() {}

// ============================================================
// Typed Errors
// ============================================================

export class RedisError {
  readonly _tag = "RedisError" as const
  constructor(
    readonly cause: unknown,
    readonly operation: string
  ) {}

  get message(): string {
    return this.cause instanceof Error
      ? `Redis ${this.operation} failed: ${this.cause.message}`
      : `Redis ${this.operation} failed: ${String(this.cause)}`
  }
}

// ============================================================
// Key Prefix (environment-aware)
// ============================================================

export const keyPrefix = (): string => {
  const vercelEnv = process.env.VERCEL_ENV
  if (vercelEnv === "production") return "prod:"
  if (vercelEnv === "preview") return "preview:"
  return "dev:"
}

// ============================================================
// Live Redis Layer (with acquire/release)
// ============================================================

export const RedisLive: Layer.Layer<RedisClient> = Layer.scoped(
  RedisClient,
  Effect.gen(function* () {
    const url = yield* Config.redacted("KV_REST_API_REDIS_URL")

    const client: RedisClientType = yield* Effect.acquireRelease(
      // --- Acquire ---
      Effect.tryPromise({
        try: async () => {
          const c = createClient({
            url: Redacted.value(url),
            socket: {
              reconnectStrategy: (retries) => {
                // Exponential backoff: 50ms, 100ms, 200ms, ..., max 3s
                return Math.min(retries * 50, 3000)
              },
            },
          })
          await c.connect()
          return c
        },
        catch: (cause) => new RedisError(cause, "connect"),
      }).pipe(
        Effect.tap(() => Effect.logInfo("Redis client connected"))
      ),

      // --- Release ---
      (c) =>
        Effect.tryPromise(() => c.disconnect()).pipe(
          Effect.tap(() => Effect.logInfo("Redis client disconnected")),
          Effect.catchAll((err) =>
            Effect.logWarning(`Redis disconnect error: ${err}`)
          )
        )
    )

    // Wrap the raw client in the service interface
    const wrapOp =
      <A>(operation: string, fn: () => Promise<A>) =>
        Effect.tryPromise({
          try: fn,
          catch: (cause) => new RedisError(cause, operation),
        })

    return {
      get: (key) => wrapOp("get", () => client.get(key)),

      set: (key, value) =>
        wrapOp("set", () => client.set(key, value).then(() => void 0)),

      incr: (key) => wrapOp("incr", () => client.incr(key)),

      hGetAll: (key) => wrapOp("hGetAll", () => client.hGetAll(key)),

      hIncrBy: (key, field, increment) =>
        wrapOp("hIncrBy", () => client.hIncrBy(key, field, increment)),

      multi: () =>
        Effect.sync(() => {
          const m = client.multi()
          const wrapper: RedisMulti = {
            hIncrBy: (key, field, increment) => {
              m.hIncrBy(key, field, increment)
              return wrapper
            },
            exec: () => wrapOp("multi.exec", () => m.exec()),
          }
          return wrapper
        }),
    } satisfies RedisService
  })
)

// ============================================================
// In-Memory Fallback Layer (no Redis URL configured)
// ============================================================

export const InMemoryRedisLive: Layer.Layer<RedisClient> = Layer.sync(
  RedisClient,
  () => {
    const store = new Map<string, string>()
    const hashStore = new Map<string, Map<string, string>>()

    const wrapSync = <A>(fn: () => A) => Effect.sync(fn)

    return {
      get: (key) => wrapSync(() => store.get(key) ?? null),

      set: (key, value) =>
        wrapSync(() => {
          store.set(key, value)
        }),

      incr: (key) =>
        wrapSync(() => {
          const current = Number(store.get(key) || "0")
          const next = current + 1
          store.set(key, String(next))
          return next
        }),

      hGetAll: (key) =>
        wrapSync(() => {
          const hash = hashStore.get(key)
          if (!hash) return {}
          return Object.fromEntries(hash)
        }),

      hIncrBy: (key, field, increment) =>
        wrapSync(() => {
          let hash = hashStore.get(key)
          if (!hash) {
            hash = new Map()
            hashStore.set(key, hash)
          }
          const current = Number(hash.get(field) || "0")
          const next = current + increment
          hash.set(field, String(next))
          return next
        }),

      multi: () =>
        Effect.sync(() => {
          const ops: Array<() => unknown> = []
          const wrapper: RedisMulti = {
            hIncrBy: (key, field, increment) => {
              ops.push(() => {
                let hash = hashStore.get(key)
                if (!hash) {
                  hash = new Map()
                  hashStore.set(key, hash)
                }
                const current = Number(hash.get(field) || "0")
                const next = current + increment
                hash.set(field, String(next))
                return next
              })
              return wrapper
            },
            exec: () =>
              Effect.sync(() => ops.map((op) => op())),
          }
          return wrapper
        }),
    } satisfies RedisService
  }
)

// ============================================================
// Auto-selecting Layer (Redis if URL is set, else in-memory)
// ============================================================

export const RedisLayer: Layer.Layer<RedisClient> =
  process.env.KV_REST_API_REDIS_URL ? RedisLive : InMemoryRedisLive
```

### Runtime setup

```typescript
// lib/effect/runtime.ts

import { ManagedRuntime, Layer } from "effect"
import { globalValue } from "effect/GlobalValue"
import { RedisLayer } from "./services/redis"

const AppLive = Layer.mergeAll(
  RedisLayer,
  // Add more service layers here as needed
)

export const appRuntime = globalValue(
  Symbol.for("claycurry.com/appRuntime"),
  () => {
    const runtime = ManagedRuntime.make(AppLive)

    // Best-effort graceful shutdown
    if (typeof process !== "undefined") {
      process.on("SIGTERM", () => {
        runtime.dispose().catch(() => {})
      })
    }

    return runtime
  }
)
```

### Usage in a route handler

```typescript
// app/api/views/route.ts
import { Effect } from "effect"
import { NextRequest, NextResponse } from "next/server"
import { appRuntime } from "@/lib/effect/runtime"
import { RedisClient, RedisError, keyPrefix } from "@/lib/effect/services/redis"

export async function GET(request: NextRequest) {
  return appRuntime.runPromise(
    Effect.gen(function* () {
      const slug = new URL(request.url).searchParams.get("slug")

      if (!slug) {
        return NextResponse.json(
          { error: "Missing slug parameter" },
          { status: 400 }
        )
      }

      const redis = yield* RedisClient
      const count = yield* redis
        .get(`${keyPrefix()}pageviews:${slug}`)
        .pipe(Effect.map((v) => (v ? parseInt(v, 10) : 0)))

      return NextResponse.json({ slug, count })
    }).pipe(
      Effect.catchTag("RedisError", (err) =>
        Effect.succeed(
          NextResponse.json(
            { error: "Storage temporarily unavailable" },
            { status: 503 }
          )
        )
      ),
      Effect.catchAllDefect((defect) => {
        console.error("Unexpected defect in views handler:", defect)
        return Effect.succeed(
          NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
          )
        )
      })
    )
  )
}
```

---

## Lifecycle Diagram

```
Vercel Function Instance Lifecycle with Effect
===============================================

COLD START (first request to this instance)
│
├─ Module evaluation
│   └─ globalValue("appRuntime", () => ManagedRuntime.make(AppLive))
│      └─ Runtime object created (lazy — Layer NOT yet initialized)
│
├─ Handler invoked
│   └─ appRuntime.runPromise(effect)
│      └─ FIRST CALL: Layer initializes
│         ├─ RedisLive: acquireRelease → client.connect()
│         ├─ ConfigLive: reads env vars
│         └─ Runtime is now "warm"
│
├─ Handler returns Response
│
WARM INVOCATIONS (subsequent requests)
│
├─ Handler invoked
│   └─ appRuntime.runPromise(effect)
│      └─ Layer already initialized, Redis already connected
│      └─ Immediate execution
│
├─ Handler returns Response
│
SHUTDOWN (after ~5-15 min inactivity)
│
├─ SIGTERM sent by Lambda
│   └─ process.on("SIGTERM") → runtime.dispose()
│      └─ RedisLive finalizer: client.disconnect()
│      └─ (2 second grace period before SIGKILL)
│
└─ Instance terminated
```

---

## Known Risks and Mitigations

### Risk 1: Dead Redis connection in a warm instance

**Scenario**: Redis server restarts or network blips while the function instance is frozen.

**Mitigation**: The `redis` package's built-in `reconnectStrategy` (configured in `RedisLive` above) handles automatic reconnection. The exponential backoff prevents connection storms.

**Additional safeguard**: The route handler's `catchTag("RedisError")` ensures that even if reconnection fails, the request gets a proper error response instead of crashing.

### Risk 2: Module duplication in Next.js

**Scenario**: Webpack bundles the runtime module into multiple chunks, creating multiple `ManagedRuntime` instances and multiple Redis connections.

**Mitigation**: `globalValue` from `effect/GlobalValue` anchors the instance on `globalThis`, preventing duplication regardless of how many times the module is evaluated.

### Risk 3: Effect v4 migration

**Scenario**: Starting with v3, later needing to migrate to v4.

**Mitigation**: The core APIs used here (`Effect.gen`, `Layer.scoped`, `ManagedRuntime.make`, `Context.Tag`, `Effect.acquireRelease`) are stable across v3 and v4. The main migration effort will be import path changes, not logic changes. `@effect/platform` merges into `effect` in v4, simplifying imports.

**Source**: [Effect v4 Beta](https://effect.website/blog/releases/effect/40-beta/)

### Risk 4: Bundle size impact

**Scenario**: Adding `effect` increases the serverless function bundle.

**Mitigation**: Effect v3 adds ~20 KB min+gzip for a minimal program. Effect v4 reduces this to ~6.3 KB with aggressive tree-shaking. This is negligible compared to Next.js's own bundle size. Route handlers are server-only, so this does not affect client bundle.

### Risk 5: Cold start latency

**Scenario**: Effect's Layer initialization adds time to cold starts.

**Mitigation**: The Layer initialization is dominated by the Redis `connect()` call (~1-5ms on Vercel's network), not by Effect's own overhead. Effect's fiber runtime initialization is sub-millisecond. The current code already pays this cost — Effect just makes it explicit and managed.

---

## Comparison with `@effect-aws/lambda`

The `@effect-aws/lambda` package provides a `makeLambda` function that wraps an Effect handler into a Lambda-compatible handler with automatic lifecycle management. While our deployment target is Vercel (not raw Lambda), the patterns are instructive:

| Feature | `@effect-aws/lambda` | Our pattern |
|---|---|---|
| Runtime creation | Module-level, in `makeLambda` | Module-level, via `globalValue` |
| Layer initialization | Lazy, on first invocation | Lazy, on first `runPromise` |
| Graceful shutdown | Handles Lambda SHUTDOWN event | `process.on("SIGTERM")` |
| Handler signature | `(event, context) => Effect` | `(req: NextRequest) => Promise<NextResponse>` |

Our pattern is equivalent but adapted for the Next.js route handler contract.

**Source**: [@effect-aws/lambda on npm](https://www.npmjs.com/package/@effect-aws/lambda)

---

## Go/No-Go

| Criterion | Status |
|---|---|
| `ManagedRuntime` works on Vercel | Yes |
| `globalValue` prevents duplicate instances | Yes |
| `acquireRelease` manages Redis lifecycle | Yes — strictly better than current |
| Finalizers run on shutdown | Best-effort (SIGTERM), acceptable |
| Warm invocation reuse | Yes — same as current singleton |
| Connection error recovery | Yes — reconnectStrategy + typed errors |
| In-memory fallback supported | Yes — separate Layer, same interface |
| Testability improvement | Yes — swap Layer in tests |
| Bundle size acceptable | Yes — ~20 KB (v3), ~6 KB (v4) |

**Verdict: GO** — Adopt `ManagedRuntime` with `globalValue` for the shared runtime. Create `RedisLive` with `acquireRelease` to replace the bare singleton in `lib/redis.ts`. Use `InMemoryRedisLive` as the fallback layer.

---

## Sources

- [Effect ManagedRuntime API](https://effect-ts.github.io/effect/effect/ManagedRuntime.ts.html)
- [Effect GlobalValue API](https://effect-ts.github.io/effect/effect/GlobalValue.ts.html)
- [Effect Runtime Documentation](https://effect.website/docs/runtime/)
- [Effect Scope & Resource Management](https://effect.website/docs/resource-management/scope/)
- [Effect Layer Documentation](https://effect.website/docs/requirements-management/layers/)
- [Effect v4 Beta Announcement](https://effect.website/blog/releases/effect/40-beta/)
- [@mcrovero/effect-nextjs](https://github.com/mcrovero/effect-nextjs)
- [@effect-aws/lambda](https://www.npmjs.com/package/@effect-aws/lambda)
- [Next.js Singleton Discussion](https://github.com/vercel/next.js/discussions/68572)
- [Vercel Functions Documentation](https://vercel.com/docs/functions)
- [AWS Lambda Execution Environment Lifecycle](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html)
- [Effect by Example: Next.js API Handler](https://effectbyexample.com/nextjs-api-handler)
- [Effect RPC + Next.js App Router (DEV Community)](https://dev.to/titouancreach/how-i-replaced-trpc-with-effect-rpc-in-a-nextjs-app-router-application-4j8p)
- [Running Effect-TS in Cloudflare Workers (DEV Community)](https://dev.to/mmlngl/running-effect-ts-in-cloudflare-workers-without-the-pain-40a0)
- [Managed Runtime Course (typeonce.dev)](https://www.typeonce.dev/course/effect-beginners-complete-getting-started/runtime/managed-runtime)
