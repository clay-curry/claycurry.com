# Phase 4: Route Integration

## Goal

Integrate the debug logging system into all 10 API routes. Each route is
categorized by its execution model and receives the appropriate wrapper.

## Route Categories

### Effect-based routes — use `runWithDebug`

These routes already use `appRuntime.runPromise()` with `Effect.gen`. The
refactor replaces `appRuntime.runPromise(effect)` with
`runWithDebug(request, effect, routeLabel)`.

### Non-Effect routes — use `withDebug`

These routes are plain async functions. The refactor wraps the exported handler
with `withDebug(routeLabel, handler)`.

### Streaming route — custom integration

The chat route uses Vercel AI SDK streaming and requires a different approach.

---

## Effect-Based Routes (7 routes)

### 1. `app/api/clicks/route.ts`

**Handlers**: `GET`, `POST`

**Changes**:
- Import `runWithDebug`, `debugLog`, `debugError` from `lib/debug`
- Add `request: NextRequest` parameter to `GET` handler (currently has none)
- Replace `appRuntime.runPromise(...)` with `runWithDebug(request, ..., label)`
- Add `debugLog` calls at key points:
  - GET: after fetching counts (`"fetched click counts"`, `{ count: Object.keys(counts).length }`)
  - POST: after parsing IDs (`"batch click increment"`, `{ count: ids.length }`)
  - POST error: `debugError("redis unavailable")`

**Route labels**: `"GET /api/clicks"`, `"POST /api/clicks"`

### 2. `app/api/views/route.ts`

**Handlers**: `GET`, `POST`

**Changes**:
- Import `runWithDebug`, `debugLog`, `debugError`
- Replace `appRuntime.runPromise(...)` with `runWithDebug(request, ..., label)`
- Add `debugLog` calls:
  - GET: `"fetched view count"`, `{ slug, count }`
  - POST duplicate: `"duplicate view skipped"`, `{ slug }`
  - POST increment: `"view count incremented"`, `{ slug, count }`
  - POST redis down: `debugError("redis unavailable for view increment")`

**Route labels**: `"GET /api/views"`, `"POST /api/views"`

### 3. `app/api/trace/[id]/route.ts`

**Handler**: `GET`

**Changes**:
- Import `runWithDebug`, `debugLog`
- Replace `appRuntime.runPromise(...)` with `runWithDebug(request, ..., label)`
- Add `debugLog` calls:
  - `"trace lookup"`, `{ traceId, tree: boolean }`
  - `"trace found"`, `{ spanCount }` or `"trace not found"`

**Route label**: `"GET /api/trace/:id"`

### 4. `app/api/x/auth/route.ts`

**Handler**: `GET`

**Changes**:
- Import `runWithDebug`, `debugLog`
- Wrap the Effect pipeline with `runWithDebug`
- Add `debugLog` calls:
  - `"oauth flow initiated"`, `{ provider: "x" }`
  - `"pkce challenge generated"`
  - `"state stored in redis"`, `{ ttl: 300 }`

**Route label**: `"GET /api/x/auth"`

### 5. `app/api/x/callback/route.ts`

**Handler**: `GET`

**Changes**:
- Import `runWithDebug`, `debugLog`, `debugError`
- Wrap with `runWithDebug`
- Add `debugLog` calls:
  - `"oauth callback received"`, `{ hasCode, hasState }`
  - `"token exchanged successfully"`
  - `"token ownership verified"`, `{ username }`
  - Error: `debugError("owner mismatch")`

**Route label**: `"GET /api/x/callback"`

### 6. `app/api/x/bookmarks/route.ts`

**Handler**: `GET`

**Changes**:
- Import `runWithDebug`, `debugLog`
- This route already uses a custom tracer layer — the debug tracer should
  compose with (not replace) the existing one when debug is active
- Add `debugLog` calls:
  - `"bookmarks sync requested"`, `{ mock: mockScenario }`
  - `"sync result"`, `{ status, bookmarkCount }`

**Route label**: `"GET /api/x/bookmarks"`

**Note**: This route already provides `TracerLive` to the effect. When debug
mode is on, `runWithDebug` should merge its debug tracer layer with the existing
one. The implementation in Phase 2 handles this by providing the debug tracer
layer in addition to (not replacing) existing layers.

### 7. `app/api/x/bookmarks/status/route.ts`

**Handler**: `GET`

**Changes**:
- Import `runWithDebug`, `debugLog`
- Wrap with `runWithDebug`
- Add `debugLog` calls:
  - `"bookmarks status check"`
  - `"status result"`, `{ syncStatus }`

**Route label**: `"GET /api/x/bookmarks/status"`

---

## Non-Effect Routes (2 routes)

### 8. `app/api/contact/route.ts`

**Handler**: `POST`

**Changes**:
- Import `withDebug` from `lib/debug`
- Wrap exported `POST` with `withDebug("POST /api/contact", handler)`
- Use the `debug` logger parameter:
  - `debug.log("request parsed", { name, email })`
  - `debug.log("email sent via Resend")`
  - `debug.error("Resend API failed", { error })`

### 9. `app/api/feedback/route.ts`

**Handler**: `POST`

**Changes**:
- Import `withDebug` from `lib/debug`
- Wrap exported `POST` with `withDebug("POST /api/feedback", handler)`
- Use the `debug` logger parameter:
  - `debug.log("feedback received", { page, sentiment })`
  - `debug.log("feedback email sent")`
  - `debug.error("Resend API failed", { error })`

---

## Streaming Route (1 route)

### 10. `app/api/chat/route.ts`

**Handler**: `POST`

This route uses Vercel AI SDK's `streamText()` which returns a streaming
response. The debug payload cannot be injected into the JSON body.

**Strategy**:

1. Check `X-Debug` header at the start of the handler
2. If active: create an imperative debug logger (same as non-Effect routes)
3. Log key events:
   - `debug.log("chat request", { model, messageCount, webSearch, slug })`
   - `debug.log("system prompt built", { type: slug ? "blog" : "general" })`
   - `debug.log("stream started")`
4. After `streamText()` returns, wrap the response stream:
   - Create a `TransformStream` that passes through all chunks
   - After the original stream ends, append a final SSE event:
     ```
     event: debug
     data: {"route":"POST /api/chat","durationMs":1523,"logs":[...],"spans":[]}
     ```
5. Return the wrapped stream as the response

**Client-side handling** (covered in Phase 5):
- In `use-chat-session.ts`, listen for the `debug` SSE event
- Parse the JSON data and call `renderDebugToConsole()`

---

## Migration Checklist

For each route, the migration follows this pattern:

- [ ] Import debug utilities (`runWithDebug` or `withDebug`, `debugLog`, etc.)
- [ ] Add `request: NextRequest` parameter if missing (some GET handlers omit it)
- [ ] Replace `appRuntime.runPromise()` with `runWithDebug()` (Effect routes)
- [ ] Or wrap handler with `withDebug()` (non-Effect routes)
- [ ] Add `debugLog`/`debugError` calls at key decision points
- [ ] Add `DebugLog` to the Effect's requirements type (Effect routes)
- [ ] Verify existing error handling is preserved
- [ ] Verify response shape is unchanged when debug is off

## Import Changes Summary

Every modified route will add one of these import lines:

```typescript
// Effect-based routes
import { runWithDebug, debugLog, debugError } from "@/lib/debug";

// Non-Effect routes
import { withDebug } from "@/lib/debug";
```

The barrel export at `lib/debug/index.ts` will re-export from both `service.ts`
and `with-debug.ts`.
