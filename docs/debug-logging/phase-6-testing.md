# Phase 6: Testing & Verification

## Goal

Verify the debug logging system works correctly end-to-end, has zero overhead
when disabled, and doesn't break any existing functionality.

## Automated Checks

Run all three before and after integration to ensure no regressions:

```bash
pnpm check          # Biome lint + fix
pnpm check-types    # TypeScript type-checking
pnpm build          # Production build
```

All three must pass cleanly.

## Manual Testing Protocol

### Setup

1. Run `pnpm dev` to start the development server
2. Open `http://localhost:3000?debug=1` in the browser
3. Open DevTools → Console tab
4. Optionally set `localStorage.setItem('debug', '1')` for persistence

### Test Matrix

| # | Action | Expected Console Output | Route |
|---|--------|------------------------|-------|
| 1 | Navigate to any page | `[debug] POST /api/views ...ms` with view count span | `/api/views` |
| 2 | Navigate to same page again | `[debug] POST /api/views ...ms` with `duplicate: true` log | `/api/views` |
| 3 | Click a tracked link (has `data-click-id`) | `[debug] POST /api/clicks ...ms` with batch info | `/api/clicks` |
| 4 | Submit contact form | `[debug] POST /api/contact ...ms` with parsed body log | `/api/contact` |
| 5 | Click feedback thumbs up/down | `[debug] POST /api/feedback ...ms` with sentiment | `/api/feedback` |
| 6 | Open chat, send a message | `[debug] POST /api/chat ...ms` with model, message count | `/api/chat` |
| 7 | Navigate to bookmarks page | `[debug] GET /api/x/bookmarks ...ms` with sync status | `/api/x/bookmarks` |
| 8 | Load page without `?debug=1` | No `[debug]` output in console, no `__debug` in responses | All |

### Per-Route Verification

For each route, verify:

- [ ] `__debug` field is present in response when `X-Debug: 1` is sent
- [ ] `__debug` field is absent when `X-Debug` header is not sent
- [ ] `__debug.route` matches expected label (e.g., `"POST /api/views"`)
- [ ] `__debug.durationMs` is a positive number
- [ ] `__debug.logs` contains expected log entries
- [ ] `__debug.spans` contains span entries (for Effect-based routes)
- [ ] Response body without `__debug` matches the original response shape
- [ ] Status codes are preserved (200, 400, 500, etc.)
- [ ] Response headers and cookies are preserved

### Debug Mode Activation Verification

| Activation Method | Expected | Persists? |
|-------------------|----------|-----------|
| `?debug=1` in URL | Debug active | No |
| `localStorage.setItem('debug', '1')` | Debug active on all pages | Until cleared |
| Neither set | Debug inactive | N/A |
| `localStorage.removeItem('debug')` + no query param | Debug inactive | N/A |

### Console Output Quality

For each `[debug]` group in the console:

- [ ] Group is collapsed by default (uses `console.groupCollapsed`)
- [ ] Group header shows route and duration: `[debug] POST /api/views 23ms`
- [ ] Header is styled with cyan color
- [ ] Log entries use correct console method (`log`, `warn`, `error`)
- [ ] Span entries show name, duration, and status
- [ ] OK spans are styled green, error spans are styled red
- [ ] Attributes are rendered as expandable objects

## Edge Cases

### Redis unavailable

1. Stop Redis (or unset `KV_REST_API_REDIS_URL`)
2. Navigate to a page with `?debug=1`
3. Verify:
   - Debug output still appears in console
   - Error logs show Redis fallback: `debugError("redis unavailable")`
   - Response gracefully degrades (returns 0 counts, etc.)
   - No unhandled exceptions

### Large payloads

1. Open chat and send 10+ messages with `?debug=1`
2. Verify:
   - Debug SSE event is sent after stream completes
   - Console renders correctly
   - No memory issues from large log arrays

### Concurrent requests

1. Navigate to a page with `?debug=1` (triggers views + clicks simultaneously)
2. Verify:
   - Each request gets its own console group
   - Logs and spans don't leak between requests
   - `Ref` isolation per-request works correctly

### Non-JSON responses

1. If any route returns non-JSON (e.g., redirect), verify:
   - Debug payload is sent as `X-Debug-Log` header (base64)
   - Client reads and renders it from the header
   - Response is not corrupted

### Debug mode OFF performance

1. Navigate normally without `?debug=1` or localStorage
2. Verify in Network tab:
   - No `X-Debug` header sent on requests
   - No `__debug` field in response bodies
   - No `X-Debug-Log` header in responses
3. Verify no additional console output

## Unit Test Opportunities

### `lib/debug/service.ts`

```typescript
// Test DebugLogLive collects entries
test("DebugLogLive collects log entries", async () => {
  const result = await Effect.runPromise(
    Effect.gen(function* () {
      const debug = yield* DebugLog;
      yield* debug.log("info", "test message", { key: "value" });
      yield* debug.log("error", "error message");
      return yield* debug.collect();
    }).pipe(Effect.provide(DebugLogLive)),
  );

  expect(result.logs).toHaveLength(2);
  expect(result.logs[0].msg).toBe("test message");
  expect(result.logs[1].level).toBe("error");
});

// Test DebugLogNoop is truly no-op
test("DebugLogNoop returns empty collections", async () => {
  const result = await Effect.runPromise(
    Effect.gen(function* () {
      const debug = yield* DebugLog;
      yield* debug.log("info", "ignored");
      yield* debug.addSpan({ name: "ignored", durationMs: 1, status: "ok" });
      return yield* debug.collect();
    }).pipe(Effect.provide(DebugLogNoop)),
  );

  expect(result.logs).toHaveLength(0);
  expect(result.spans).toHaveLength(0);
});
```

### `lib/debug/client.ts`

```typescript
// Test isDebugMode detection
test("isDebugMode detects query param", () => {
  // Mock window.location.search = "?debug=1"
  expect(isDebugMode()).toBe(true);
});

// Test debugFetch strips __debug
test("debugFetch strips __debug from response", async () => {
  // Mock fetch to return { data: 1, __debug: {...} }
  const response = await debugFetch("/api/test");
  const body = await response.json();
  expect(body.__debug).toBeUndefined();
  expect(body.data).toBe(1);
});
```

## Regression Verification

After all integration is complete, verify that the existing test suite still
passes:

```bash
# If tests exist for Effect services
pnpm test

# Full build pipeline
pnpm check && pnpm check-types && pnpm build
```

## Acceptance Criteria

1. All 10 API routes emit `__debug` when `X-Debug: 1` header is present
2. All 6 client callers inject `X-Debug: 1` when debug mode is active
3. Console output is grouped, collapsed, and color-coded
4. Zero overhead when debug mode is off (no extra allocations, no response
   mutation)
5. `pnpm check`, `pnpm check-types`, and `pnpm build` all pass
6. Existing functionality is unchanged when debug mode is off
