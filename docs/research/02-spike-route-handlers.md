# Spike 1: Effect.runPromise in Next.js 16 Route Handlers

**Date**: 2026-03-12
**Status**: Research complete
**Verdict**: GO (with caveats for streaming routes)

---

## Executive Summary

`Effect.runPromise()` works inside Next.js App Router route handlers with no fundamental incompatibilities. The pattern is straightforward for request/response handlers (views, clicks, bookmarks). Streaming responses (chat) require a hybrid approach where Effect handles pre-stream logic but the stream itself remains outside the Effect pipeline. Effect v4 beta is available but v3 remains recommended for production; all patterns below use v3-compatible APIs that carry forward to v4.

---

## 1. Can `Effect.runPromise()` run inside `export async function POST(req: NextRequest)`?

**Yes.** `Effect.runPromise()` returns a `Promise<A>`, which is exactly what an async function returns. The pattern is:

```typescript
import { Effect } from "effect"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  return Effect.runPromise(
    Effect.gen(function* () {
      const body = yield* Effect.tryPromise(() => req.json())
      // ... business logic as Effects ...
      return NextResponse.json({ success: true })
    })
  )
}
```

Alternatively, with a `ManagedRuntime` (when you need injected services):

```typescript
import { ManagedRuntime } from "effect"

// Module-level runtime (see Spike 2 for lifecycle details)
const runtime = ManagedRuntime.make(AppLive)

export async function POST(req: NextRequest) {
  return runtime.runPromise(
    Effect.gen(function* () {
      const redis = yield* RedisClient
      // ... use services from the runtime ...
      return NextResponse.json({ ok: true })
    })
  )
}
```

Both `Effect.runPromise` and `ManagedRuntime.runPromise` convert an `Effect<A, E, R>` into a `Promise<A>`. The key constraint: `E` must be `never` (all errors handled) for `runPromise`, or it throws a `FiberFailure`. For route handlers, we want to catch errors and return appropriate HTTP responses, so the pattern is to handle all errors within the Effect pipeline before running.

**Source**: [Effect Runtime Documentation](https://effect.website/docs/runtime/), [Effect by Example: Next.js API Handler](https://effectbyexample.com/nextjs-api-handler)

---

## 2. How does Effect interact with `NextRequest`/`NextResponse` types?

Effect has **no opinion** about `NextRequest`/`NextResponse`. They are plain objects passed into and returned from the Effect pipeline:

```typescript
export async function GET(request: NextRequest) {
  return Effect.runPromise(
    Effect.gen(function* () {
      // NextRequest is used normally inside the generator
      const slug = new URL(request.url).searchParams.get("slug")

      if (!slug) {
        // NextResponse is returned as the success value
        return NextResponse.json(
          { error: "Missing slug" },
          { status: 400 }
        )
      }

      const count = yield* getViewCountEffect(slug)
      return NextResponse.json({ slug, count })
    })
  )
}
```

The Effect pipeline's return type is `Effect<NextResponse, never, R>`, and `runPromise` produces `Promise<NextResponse>`, which is exactly what Next.js expects.

**Alternative: `@effect/platform` HTTP primitives.** The `@effect/platform` package provides `HttpServerRequest`, `HttpServerResponse`, and `HttpApp` abstractions that can replace `NextRequest`/`NextResponse`. However, this adds complexity and is unnecessary for wrapping existing handlers. The recommendation is to keep using `NextRequest`/`NextResponse` directly and adopt `@effect/platform` only if building a full Effect-based HTTP layer.

---

## 3. Can streaming responses work with Effect wrapping?

**Partially.** The chat route uses Vercel AI SDK's `streamText()` which returns a `StreamTextResult` with a `.toUIMessageStreamResponse()` method that produces a streaming `Response`. This streaming mechanism operates outside Effect's control flow.

### Recommended hybrid pattern for streaming:

```typescript
export async function POST(req: Request) {
  // Phase 1: Use Effect for pre-stream setup (parsing, validation, data fetching)
  const { messages, systemPrompt } = await Effect.runPromise(
    Effect.gen(function* () {
      const body = yield* Effect.tryPromise({
        try: () => req.json(),
        catch: () => new ParseError("Invalid JSON body"),
      })

      const messages: UIMessage[] = body.messages
      const slug: string | undefined = body.slug

      // Fetch GitHub data or blog content via Effect services
      const systemPrompt = yield* buildSystemPrompt(slug)

      return { messages, systemPrompt }
    }).pipe(
      Effect.provide(AppLive),
      Effect.catchAll((error) =>
        Effect.succeed({
          messages: [] as UIMessage[],
          systemPrompt: "",
          error: error.message,
        })
      )
    )
  )

  // Phase 2: Streaming remains outside Effect (Vercel AI SDK owns the stream)
  const result = streamText({
    model: gateway(model),
    messages: await convertToModelMessages(messages),
    system: systemPrompt,
  })

  return result.toUIMessageStreamResponse({ sendSources: true, sendReasoning: true })
}
```

**Why not wrap the stream in Effect?** The Vercel AI SDK's streaming response uses `ReadableStream` and `TransformStream` internally. Effect has `Stream` primitives, but converting between Vercel AI SDK streams and Effect streams adds complexity with no clear benefit. The value of Effect here is in the _setup_ phase (validation, service resolution, error handling), not in the byte-level streaming.

**Future consideration**: If we adopt `@effect/rpc` for client-server communication, it has built-in streaming support. But that would replace the AI SDK's transport, which is a much larger change.

---

## 4. Minimal boilerplate to wrap an existing route handler

### Pattern A: Zero-dependency (no services needed)

```typescript
import { Effect } from "effect"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  return Effect.runPromise(
    Effect.gen(function* () {
      // Your existing logic, wrapped in Effects
      const result = yield* Effect.tryPromise(() => someAsyncOperation())
      return NextResponse.json(result)
    }).pipe(
      Effect.catchAll((error) =>
        Effect.succeed(
          NextResponse.json({ error: "Internal error" }, { status: 500 })
        )
      )
    )
  )
}
```

**Boilerplate cost**: ~5 lines wrapping (Effect.gen, pipe, catchAll, runPromise).

### Pattern B: With services via ManagedRuntime

```typescript
import { Effect } from "effect"
import { NextRequest, NextResponse } from "next/server"
import { appRuntime } from "@/lib/effect/runtime"

export async function GET(request: NextRequest) {
  return appRuntime.runPromise(
    Effect.gen(function* () {
      const redis = yield* RedisClient   // injected from the runtime's layer
      const result = yield* redis.get("key")
      return NextResponse.json({ value: result })
    }).pipe(
      Effect.catchAll((error) =>
        Effect.succeed(
          NextResponse.json({ error: "Internal error" }, { status: 500 })
        )
      )
    )
  )
}
```

### Helper: `withEffect` wrapper (optional DRY utility)

```typescript
// lib/effect/route-handler.ts
import { Effect } from "effect"
import { NextResponse } from "next/server"
import { appRuntime } from "./runtime"

export function withEffect<A>(
  effect: Effect.Effect<NextResponse, never, AppServices>
): Promise<NextResponse> {
  return appRuntime.runPromise(effect)
}

// Convenience for wrapping with standard error handling
export function handleRoute<E>(
  effect: Effect.Effect<NextResponse, E, AppServices>,
  onError?: (error: E) => NextResponse
): Promise<NextResponse> {
  return appRuntime.runPromise(
    effect.pipe(
      Effect.catchAll((error) =>
        Effect.succeed(
          onError
            ? onError(error)
            : NextResponse.json({ error: "Internal error" }, { status: 500 })
        )
      )
    )
  )
}
```

---

## 5. Concrete Before/After Examples

### 5a. Views Route (simplest)

#### BEFORE (`app/api/views/route.ts` — current)

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get("slug")

  if (!slug) {
    return NextResponse.json(
      { error: "Missing slug parameter" },
      { status: 400 },
    )
  }

  const count = await getViewCount(slug)
  return NextResponse.json({ slug, count })
}
```

No error handling around `getViewCount`. If Redis throws unexpectedly, the function crashes with a 500 and no structured error.

#### AFTER (with Effect)

```typescript
import { Effect, Schema } from "effect"
import { NextRequest, NextResponse } from "next/server"
import { appRuntime } from "@/lib/effect/runtime"
import { RedisClient } from "@/lib/effect/services/redis"

// Define typed errors
class MissingSlugError {
  readonly _tag = "MissingSlugError"
}

class RedisError {
  readonly _tag = "RedisError"
  constructor(readonly cause: unknown) {}
}

// Pure effect: get view count
const getViewCount = (slug: string) =>
  Effect.gen(function* () {
    const redis = yield* RedisClient
    return yield* redis.getPageViews(slug)
  })

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

      const count = yield* getViewCount(slug)
      return NextResponse.json({ slug, count })
    }).pipe(
      Effect.catchTag("RedisError", (error) =>
        Effect.succeed(
          NextResponse.json(
            { error: "Storage unavailable", slug: null, count: 0 },
            { status: 503 }
          )
        )
      ),
      Effect.catchAll((error) =>
        Effect.succeed(
          NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
          )
        )
      )
    )
  )
}
```

**What changed:**
- Redis errors are typed and caught explicitly (`catchTag`)
- The entire handler body is wrapped — no unhandled promise rejections possible
- The `RedisClient` service is injected, not imported as a singleton (testable, swappable)
- Fallback behavior is explicit in the error handler, not buried in try-catch

### 5b. Bookmarks Route (most complex)

#### BEFORE (`app/api/x/bookmarks/route.ts` — current)

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const folderId = searchParams.get("folder") || undefined

  try {
    const service = createBookmarksSyncService()
    const { response, httpStatus } = await service.getBookmarks(folderId)
    return NextResponse.json(response, { status: httpStatus })
  } catch (error) {
    const config = getXRuntimeConfig()
    console.error("Bookmarks API error:", error)

    return NextResponse.json(
      BookmarksApiResponseSchema.parse({
        bookmarks: [],
        folders: [],
        owner: {
          id: config.ownerUserId,
          username: config.ownerUsername,
          name: null,
        },
        status: "upstream_error",
        isStale: false,
        lastSyncedAt: null,
        cachedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 },
    )
  }
}
```

Problems: `createBookmarksSyncService()` is a factory that hides its dependencies. `getXRuntimeConfig()` is called only in the error path. Error type is `unknown`.

#### AFTER (with Effect)

```typescript
import { Effect } from "effect"
import { NextRequest, NextResponse } from "next/server"
import { appRuntime } from "@/lib/effect/runtime"
import { BookmarksSyncService } from "@/lib/effect/services/bookmarks"
import { XConfig } from "@/lib/effect/services/x-config"
import { BookmarksApiResponseSchema } from "@/lib/x/contracts"

class BookmarksFetchError {
  readonly _tag = "BookmarksFetchError"
  constructor(readonly cause: unknown) {}
}

const getBookmarks = (folderId: string | undefined) =>
  Effect.gen(function* () {
    const service = yield* BookmarksSyncService
    return yield* Effect.tryPromise({
      try: () => service.getBookmarks(folderId),
      catch: (cause) => new BookmarksFetchError(cause),
    })
  })

const fallbackResponse = (error: BookmarksFetchError) =>
  Effect.gen(function* () {
    const config = yield* XConfig

    yield* Effect.logError("Bookmarks API error").pipe(
      Effect.annotateLogs("cause", String(error.cause))
    )

    const body = BookmarksApiResponseSchema.parse({
      bookmarks: [],
      folders: [],
      owner: {
        id: config.ownerUserId,
        username: config.ownerUsername,
        name: null,
      },
      status: "upstream_error",
      isStale: false,
      lastSyncedAt: null,
      cachedAt: new Date().toISOString(),
      error: error.cause instanceof Error
        ? error.cause.message
        : "Unknown error",
    })

    return NextResponse.json(body, { status: 500 })
  })

export async function GET(request: NextRequest) {
  return appRuntime.runPromise(
    Effect.gen(function* () {
      const folderId =
        new URL(request.url).searchParams.get("folder") || undefined

      const { response, httpStatus } = yield* getBookmarks(folderId)
      return NextResponse.json(response, { status: httpStatus })
    }).pipe(
      Effect.catchTag("BookmarksFetchError", fallbackResponse),
      Effect.catchAll((error) =>
        Effect.succeed(
          NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
          )
        )
      )
    )
  )
}
```

**What changed:**
- `BookmarksSyncService` and `XConfig` are injected via the Effect context
- The error path uses `catchTag` for type-safe, discriminated error handling
- `Effect.logError` replaces `console.error` (integrates with Effect's logging/tracing)
- The fallback response is a separate, testable function
- A catch-all prevents any unhandled errors from crashing the function

---

## 6. How does `maxDuration` export work alongside Effect?

`maxDuration` is a static export from the route file, not related to the handler function's runtime behavior:

```typescript
// This is fine — maxDuration is just a named export
export const maxDuration = 30

export async function POST(req: Request) {
  return Effect.runPromise(/* ... */)
}
```

Next.js reads `maxDuration` at build/deploy time to configure the serverless function timeout on Vercel. It has no interaction with Effect's runtime. Effect's own timeout mechanisms (`Effect.timeout`, `Effect.timeoutFail`) can be used _within_ the pipeline for more granular control:

```typescript
export async function POST(req: Request) {
  return Effect.runPromise(
    myEffect.pipe(
      Effect.timeout("25 seconds"),  // Bail out before Vercel kills us
      Effect.catchTag("TimeoutException", () =>
        Effect.succeed(
          NextResponse.json({ error: "Request timed out" }, { status: 504 })
        )
      )
    )
  )
}
```

This is strictly better than `maxDuration` alone: you get a controlled error response instead of Vercel's generic 504.

---

## Ecosystem Packages Evaluated

### `@mcrovero/effect-nextjs` (alpha)

- **What it does**: Typed helpers for pages, layouts, server components, and actions.
- **Route handler support**: None. Focused on React components, not API routes.
- **Runtime setup**: `Next.make("name", layer)` with `globalValue` under the hood.
- **Verdict**: Useful for pages/layouts later, but not relevant to route handler wrapping.
- **Source**: [github.com/mcrovero/effect-nextjs](https://github.com/mcrovero/effect-nextjs)

### `@effect/rpc-nextjs` (deprecated)

- **What it does**: Was the official Effect RPC adapter for Next.js.
- **Current status**: Deprecated. Last published 2+ years ago, 59 downloads.
- **Replacement**: `@effect/rpc` + `@effect/rpc-http` (now part of core `effect` in v4).
- **Verdict**: Do not use. If we want RPC, use `@effect/rpc` directly.
- **Source**: [npmjs.com/package/@effect/rpc-nextjs](https://www.npmjs.com/package/@effect/rpc-nextjs)

### `@effect/rpc` + `@effect/rpc-http`

- **What it does**: Full RPC framework with schema-validated requests, streaming support.
- **Next.js integration**: Works with App Router route handlers as shown in the [DEV Community article](https://dev.to/titouancreach/how-i-replaced-trpc-with-effect-rpc-in-a-nextjs-app-router-application-4j8p).
- **Verdict**: Overkill for our use case (simple REST-ish API routes). Worth revisiting if we add client-server type safety needs.

### Direct `Effect.runPromise` / `ManagedRuntime` (recommended)

- **What it does**: Vanilla Effect, no framework adapter needed.
- **Verdict**: The right choice for wrapping existing route handlers incrementally.

---

## Effect v4 Considerations

Effect v4 beta launched February 2026. Key changes relevant to this spike:

- **Unified package**: `@effect/platform`, `@effect/rpc`, etc. merge into core `effect` package.
- **Smaller bundles**: Minimal program ~6.3 KB (down from ~70 KB in v3).
- **Unstable modules**: HTTP, RPC, Schema move to `effect/unstable/*` import paths initially.
- **v3 maintenance continues**: Bug fixes and security patches, but no new features.

**Recommendation**: Start with Effect v3 (stable, production-ready). The core APIs (`Effect.gen`, `Effect.runPromise`, `ManagedRuntime`, `Layer`) are the same in v4. Migration will be import path changes, not logic changes.

**Source**: [Effect v4 Beta announcement](https://effect.website/blog/releases/effect/40-beta/), [Migration guide](https://github.com/Effect-TS/effect-smol/blob/main/MIGRATION.md)

---

## Migration Strategy

### Phase 1: Add Effect as a dependency, create shared runtime
- Install `effect` (v3)
- Create `lib/effect/runtime.ts` with `ManagedRuntime` + `globalValue`
- Create `RedisClient` service layer (see Spike 2)

### Phase 2: Wrap simplest route first (views GET)
- Convert `getViewCount` to an Effect
- Wrap the GET handler in `Effect.runPromise`
- Verify no behavioral changes

### Phase 3: Wrap remaining routes incrementally
- clicks GET/POST
- views POST (cookie logic)
- bookmarks GET
- chat POST (hybrid pattern — Effect for setup, AI SDK for streaming)

### Phase 4: Extract shared error handling
- Create `withEffect` / `handleRoute` helpers
- Standardize error response shapes

---

## Go/No-Go

| Criterion | Status |
|---|---|
| `Effect.runPromise` in route handlers | Works |
| `NextRequest`/`NextResponse` compatibility | No issues |
| Streaming responses (AI SDK) | Hybrid pattern required |
| `maxDuration` export | Compatible (no interaction) |
| Bundle size impact | ~6 KB min+gzip (v4), ~20 KB (v3) |
| Incremental adoption | Yes — one route at a time |
| v3 stability for production | Yes |

**Verdict: GO** — Adopt `Effect.runPromise` / `ManagedRuntime.runPromise` in route handlers. Use the hybrid pattern for streaming routes. Start with Effect v3.
