# Phase 2: Effect.ts Feasibility Summary

**Date**: 2026-03-12
**Status**: All 5 spikes complete — all GO

---

## Sub-Documents

| Spike | Document | Verdict |
|-------|----------|---------|
| Route handlers | [`02-spike-route-handlers.md`](./02-spike-route-handlers.md) | **GO** (hybrid for streaming) |
| Serverless layers | [`02-spike-serverless-layers.md`](./02-spike-serverless-layers.md) | **GO** (module-level ManagedRuntime) |
| Schema migration | [`02-spike-schema-migration.md`](./02-spike-schema-migration.md) | **GO** (conditional — coexist first) |
| Custom tracer | [`02-spike-tracer.md`](./02-spike-tracer.md) | **GO** (Redis span persistence) |
| Error model | [`02-spike-error-model.md`](./02-spike-error-model.md) | **GO** (incremental migration) |

---

## Key Findings

### 1. Route Handlers — GO

`Effect.runPromise()` works directly inside Next.js App Router `export async function GET/POST()` handlers. For request/response routes (views, clicks, bookmarks), the pattern is straightforward:

```typescript
export async function GET(req: NextRequest) {
  return AppRuntime.runPromise(
    Effect.gen(function* () {
      const redis = yield* RedisService
      // ... handler logic
      return NextResponse.json(result)
    })
  )
}
```

**Caveat**: The chat route uses `streamText()` which returns a streaming response. Effect should handle pre-stream setup (GitHub data fetch, system prompt construction) but the stream itself must stay outside the Effect pipeline. This is a hybrid pattern, not a limitation.

### 2. Serverless Layers — GO

`ManagedRuntime.make()` at module scope works on Vercel. Layers are initialized on cold start and reused across warm invocations — identical behavior to the current `let redisClient` singleton but with proper error handling and lifecycle management.

**Key pattern**: Use `effect/GlobalValue` or module-level `const` for the runtime. Redis connections survive across warm invocations. Finalizers may not run on Vercel shutdown, but Redis handles abandoned connections natively.

### 3. Schema Migration — GO (Conditional)

Zod and @effect/schema can coexist. The current Zod usage surface is narrow (3 call patterns: `parseContract`, `getValidated`/`setValidated`, direct `.parse()`). Migration strategy:

1. **Phase 0**: Keep all 30 Zod schemas in `contracts.ts` as-is
2. **New code**: Use @effect/schema for new domains
3. **Gradual migration**: Convert schemas one-at-a-time when touching the module
4. **Bridge**: Use `@effect/schema`'s `Schema.fromBrand` for branded types

@effect/schema advantages over Zod: bidirectional encode/decode, native Effect error channel integration, annotation metadata, and better composition. No immediate migration pressure — Zod works fine for current needs.

### 4. Custom Tracer — GO

Effect's `Tracer` interface has a single method (`span()`) to implement. A custom Redis-persisting tracer:
- Buffers span data in memory during the span's lifetime
- Serializes and pushes to Redis on `end()` via `RPUSH`
- Automatically captures all `Effect.withSpan()` instrumentation
- No manual context propagation needed (Effect's fiber model handles it)

### 5. Error Model — GO

The existing `XIntegrationError` maps cleanly to Effect `Data.TaggedError`:

| Current | Effect.ts |
|---------|-----------|
| `new XIntegrationError("reauth_required", msg)` | `new ReauthRequired({ message: msg })` |
| `catch (e) { toIntegrationError(e) }` | `Effect.catchTag("ReauthRequired", handler)` |
| `switch (error.code)` | Type-safe `Effect.catchTags({ ... })` |
| 445-line try-catch in service.ts | Composed Effect pipeline with per-stage error handling |

Migration is incremental: wrap existing `XIntegrationError` throws in Effect errors one module at a time, starting from leaf modules (errors.ts, client.ts) up to the service orchestrator.

---

## Overall Recommendation

**Proceed with Effect.ts adoption.** All 5 spikes returned GO verdicts. The migration can be incremental:

1. **Start**: `RedisLayer` (highest impact — 6 consumers, fixes connection bug)
2. **Then**: Error model (leaf → root: errors.ts → client.ts → tokens.ts → service.ts)
3. **Then**: Route handlers (views/clicks first, bookmarks second, chat last)
4. **Then**: Custom tracer (depends on route handler migration)
5. **Later**: Schema migration (only when touching the module, no urgency)

No big-bang rewrite needed. Each step produces independently testable, deployable code.
