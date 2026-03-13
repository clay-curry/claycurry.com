# Phase 2: Route Handler Wrappers

## Goal

Create two wrapper functions that integrate the DebugLog service into route
handlers with minimal boilerplate. One for Effect-based routes (`runWithDebug`)
and one for plain async handlers (`withDebug`).

## New File

**`apps/www/lib/debug/with-debug.ts`**

## `isDebugRequest`

Utility to check whether a request has debug mode enabled.

```typescript
function isDebugRequest(request: NextRequest): boolean {
  return request.headers.get("X-Debug") === "1";
}
```

## `runWithDebug` — For Effect-Based Routes

Most routes use `appRuntime.runPromise(effect)`. This wrapper replaces that
pattern.

### Signature

```typescript
function runWithDebug<E>(
  request: NextRequest,
  effect: Effect.Effect<NextResponse, E, RedisClient | DebugLog>,
  routeLabel: string,
): Promise<NextResponse>;
```

### Behavior

**When `X-Debug` is absent (fast path):**
1. Provide `DebugLogNoop` to the effect
2. Run via `appRuntime.runPromise()`
3. Return the response unchanged

**When `X-Debug: 1` is present:**
1. Record `startTime = performance.now()`
2. Generate a trace ID (reuse `crypto.randomUUID()`)
3. Construct layers: `DebugLogLive` + debug tracer layer
4. Provide layers to the effect
5. Before returning, call `DebugLog.collect()` to gather logs and spans
6. Compute `durationMs = performance.now() - startTime`
7. Parse the response body as JSON
8. Append `__debug: { route, durationMs, logs, spans }` to the JSON
9. Return a new `NextResponse` with the augmented body, preserving original
   status code, headers, and cookies

### Implementation Detail

The effect must yield `DebugLog` service calls, so the wrapper modifies the
pipeline:

```typescript
async function runWithDebug<E>(
  request: NextRequest,
  effect: Effect.Effect<NextResponse, E, RedisClient | DebugLog>,
  routeLabel: string,
): Promise<NextResponse> {
  const debug = isDebugRequest(request);

  if (!debug) {
    // Fast path: no debug overhead
    return appRuntime.runPromise(
      effect.pipe(Effect.provide(DebugLogNoop)),
    );
  }

  const startTime = performance.now();
  const traceId = crypto.randomUUID();

  // Build the debug pipeline: run effect, then collect debug data
  const pipeline = Effect.gen(function* () {
    const response = yield* effect;
    const debugService = yield* DebugLog;
    const { logs, spans } = yield* debugService.collect();
    const durationMs = Math.round(performance.now() - startTime);

    // Inject __debug into response body
    const body = await response.json();
    return NextResponse.json(
      { ...body, __debug: { route: routeLabel, durationMs, logs, spans } },
      {
        status: response.status,
        headers: response.headers,
      },
    );
  });

  return appRuntime.runPromise(
    pipeline.pipe(
      Effect.provide(DebugLogLive),
      Effect.provide(makeDebugTracerLayer(traceId)),
    ),
  );
}
```

### Usage in a Route

Before:
```typescript
export async function GET() {
  return appRuntime.runPromise(
    getAllCounts.pipe(
      Effect.map((counts) => NextResponse.json({ counts })),
      Effect.catchTag("RedisError", (err) => {
        console.error("Redis error:", err.message);
        return Effect.succeed(NextResponse.json({ counts: {} }));
      }),
    ),
  );
}
```

After:
```typescript
export async function GET(request: NextRequest) {
  return runWithDebug(
    request,
    getAllCounts.pipe(
      Effect.tap(() => debugLog("fetched all click counts")),
      Effect.map((counts) => NextResponse.json({ counts })),
      Effect.catchTag("RedisError", (err) => {
        console.error("Redis error:", err.message);
        return debugError("redis unavailable", { error: err.message }).pipe(
          Effect.map(() => NextResponse.json({ counts: {} })),
        );
      }),
    ),
    "GET /api/clicks",
  );
}
```

## `withDebug` — For Non-Effect Routes

For routes that don't use Effect (contact, feedback), a simpler wrapper is
provided.

### Signature

```typescript
function withDebug(
  routeLabel: string,
  handler: (
    request: NextRequest,
    debug: ImperativeDebugLogger,
  ) => Promise<NextResponse>,
): (request: NextRequest) => Promise<NextResponse>;
```

### `ImperativeDebugLogger`

A plain object with imperative log methods. When debug is off, all methods are
no-ops.

```typescript
interface ImperativeDebugLogger {
  log: (msg: string, attrs?: Record<string, unknown>) => void;
  warn: (msg: string, attrs?: Record<string, unknown>) => void;
  error: (msg: string, attrs?: Record<string, unknown>) => void;
}
```

### Behavior

**When `X-Debug` is absent:**
1. Create a no-op logger (methods do nothing)
2. Call `handler(request, noopLogger)`
3. Return the response unchanged

**When `X-Debug: 1` is present:**
1. Record `startTime`
2. Create a collecting logger (pushes to internal array)
3. Call `handler(request, collectingLogger)`
4. Compute duration
5. Parse response JSON, inject `__debug`, return augmented response

### Usage in a Route

Before:
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  // ... validate, send email ...
  return NextResponse.json({ success: true });
}
```

After:
```typescript
export const POST = withDebug("POST /api/contact", async (request, debug) => {
  const body = await request.json();
  debug.log("parsed request body", { name: body.name });
  // ... validate, send email ...
  debug.log("email sent via Resend");
  return NextResponse.json({ success: true });
});
```

## `injectDebugPayload`

Shared utility used by both wrappers to inject `__debug` into a response.

```typescript
async function injectDebugPayload(
  response: NextResponse,
  payload: DebugPayload,
): Promise<NextResponse> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    // Non-JSON response: attach as header instead (base64, truncated to 8KB)
    const encoded = btoa(JSON.stringify(payload)).slice(0, 8192);
    response.headers.set("X-Debug-Log", encoded);
    return response;
  }

  const body = await response.json();
  return NextResponse.json(
    { ...body, __debug: payload },
    { status: response.status, headers: response.headers },
  );
}
```

## Exports

```typescript
export { runWithDebug, withDebug, isDebugRequest };
export type { ImperativeDebugLogger };
```

## Dependencies

- `lib/debug/service.ts` — DebugLog, DebugLogLive, DebugLogNoop, etc.
- `lib/effect/runtime.ts` — appRuntime
- `next/server` — NextRequest, NextResponse
