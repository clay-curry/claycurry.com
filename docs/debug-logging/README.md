# API Debug Logging System

## Problem

There is no way to observe what API routes are doing from the browser. Debugging
requires SSH access to the server or reading Redis-persisted traces after the
fact. This makes it difficult to diagnose issues during development or in
production preview deployments.

## Solution

An opt-in debug mode that, when activated, causes every API call to:

1. Collect structured log entries and span data on the server during execution
2. Return the collected data as a `__debug` field appended to JSON response
   bodies
3. Render the data in the browser console using grouped, formatted output

The system has **zero overhead** when debug mode is off.

## Activation

Debug mode can be activated three ways (any triggers it):

| Method | Scope | Persistence |
|--------|-------|-------------|
| `?debug=1` in page URL | Current page load | None (URL only) |
| `localStorage.setItem('debug', '1')` | All pages | Until cleared |
| `X-Debug: 1` request header | Single request | None |

The client-side fetch wrapper detects the first two methods and automatically
injects the `X-Debug: 1` header on every API request. The server reads only the
header.

## Console Output

When debug mode is active, API responses produce grouped console output:

```
▸ [debug] POST /api/views 23ms
    request  { slug: "hello-world" }
    span: getViewCount  { duration: "8ms", status: "ok" }
    span: redis.incr    { duration: "5ms", status: "ok" }
    response { slug: "hello-world", count: 42, duplicate: false }
```

Error-level logs use `console.error`, warnings use `console.warn`, and info uses
`console.log`. Each API call gets its own collapsed group.

## Response Body Format

The `__debug` field is appended to the existing JSON response body. The client
wrapper strips it before returning data to the caller, so application code never
sees it.

```json
{
  "slug": "hello-world",
  "count": 42,
  "__debug": {
    "route": "POST /api/views",
    "durationMs": 23,
    "logs": [
      {
        "level": "info",
        "msg": "dedup cookie set",
        "ts": 1710000001,
        "attrs": { "slug": "hello-world" }
      }
    ],
    "spans": [
      {
        "name": "getViewCount",
        "durationMs": 8,
        "status": "ok",
        "attrs": { "key": "prod:pageviews:hello-world" }
      },
      {
        "name": "redis.incr",
        "durationMs": 5,
        "status": "ok",
        "attrs": {}
      }
    ]
  }
}
```

## Streaming Routes (Chat)

The chat route uses Vercel AI SDK streaming. Debug data is sent as a trailing SSE
event after the stream completes:

```
event: debug
data: {"route":"POST /api/chat","durationMs":1523,"logs":[...],"spans":[...]}

```

The client-side chat integration listens for this event and renders it to the
console separately from the streamed message content.

## Architecture

The system is built in three layers:

1. **Effect Service (`DebugLog`)** — a `Context.Tag` service with Live
   (collecting) and Noop (zero-cost) layers. Collects log entries and spans
   during Effect program execution using `Ref`.
2. **Route Wrapper (`withDebug` / `runWithDebug`)** — detects `X-Debug` header,
   installs the appropriate layer, and post-processes responses to inject
   `__debug`.
3. **Client Wrapper (`debugFetch`)** — detects debug mode, adds the header,
   strips `__debug` from responses, and renders to console.

## Implementation Phases

| Phase | Document | Summary |
|-------|----------|---------|
| 1 | [phase-1-effect-service.md](phase-1-effect-service.md) | DebugLog Effect service, types, Live/Noop layers |
| 2 | [phase-2-route-wrapper.md](phase-2-route-wrapper.md) | `withDebug` and `runWithDebug` handler wrappers |
| 3 | [phase-3-client-wrapper.md](phase-3-client-wrapper.md) | `debugFetch`, `isDebugMode`, console renderer |
| 4 | [phase-4-route-integration.md](phase-4-route-integration.md) | Per-route integration across all 10 API routes |
| 5 | [phase-5-client-integration.md](phase-5-client-integration.md) | Per-caller integration across all 6 client consumers |
| 6 | [phase-6-testing.md](phase-6-testing.md) | Testing strategy and verification checklist |

## Key Design Decisions

- **Effect-native**: The DebugLog service is an Effect `Context.Tag`, composing
  naturally with the existing Effect-based routes via `Layer.provide`.
- **Reuses existing tracer**: The `makeTracerLayer` from `lib/tracing/tracer.ts`
  is reused with a custom `onSpanEnd` callback that feeds spans into the
  DebugLog service instead of Redis.
- **Zero overhead off-path**: When `X-Debug` is absent, routes use `DebugLogNoop`
  (all methods are `Effect.void`) or skip the layer entirely. No log arrays
  allocated, no spans collected, no response mutation.
- **Non-Effect routes supported**: For routes that don't use Effect (contact,
  feedback), a simple imperative logger object is provided.
- **Client transparency**: The `debugFetch` wrapper strips `__debug` before
  returning, so application code is unaware of the debug system.
