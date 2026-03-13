# Phase 3: Client-Side Debug Fetch Wrapper

## Goal

Create a client-side utility that detects debug mode, injects the `X-Debug`
header into outgoing requests, strips the `__debug` field from responses, and
renders debug information to the browser console.

## New File

**`apps/www/lib/debug/client.ts`** — marked with `"use client"` directive

## `isDebugMode`

Detects whether debug mode is active on the client side.

```typescript
"use client";

function isDebugMode(): boolean {
  if (typeof window === "undefined") return false;

  // Check URL query parameter
  const params = new URLSearchParams(window.location.search);
  if (params.get("debug") === "1") return true;

  // Check localStorage persistence
  try {
    if (localStorage.getItem("debug") === "1") return true;
  } catch {
    // localStorage may be unavailable (private browsing, etc.)
  }

  return false;
}
```

### Persistence Behavior

- `?debug=1` in URL: active for current page load only
- `localStorage.setItem('debug', '1')`: active across all pages until cleared
- `localStorage.removeItem('debug')`: deactivates persistent debug mode

## `debugFetch`

Drop-in replacement for `fetch()` that handles debug mode transparently.

### Signature

```typescript
async function debugFetch(
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response>;
```

### Behavior

1. **Check debug mode**: call `isDebugMode()`
2. **If not active**: delegate to `fetch(input, init)` unchanged
3. **If active**:
   a. Clone/merge headers to add `X-Debug: 1`
   b. Call `fetch(input, augmentedInit)`
   c. Check `content-type` of response
   d. If JSON: clone response, parse body, check for `__debug` field
   e. If `__debug` present: call `renderDebugToConsole(__debug)`, reconstruct
      response without `__debug`
   f. Return clean response to caller

### Implementation

```typescript
async function debugFetch(
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  const debug = isDebugMode();

  if (!debug) {
    return fetch(input, init);
  }

  // Inject X-Debug header
  const headers = new Headers(init?.headers);
  headers.set("X-Debug", "1");
  const augmentedInit = { ...init, headers };

  const response = await fetch(input, augmentedInit);

  // Only process JSON responses
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    // Check for header-based debug payload (non-JSON responses)
    const headerPayload = response.headers.get("X-Debug-Log");
    if (headerPayload) {
      try {
        const payload = JSON.parse(atob(headerPayload));
        renderDebugToConsole(payload);
      } catch { /* ignore malformed debug header */ }
    }
    return response;
  }

  // Clone and parse to extract __debug
  const body = await response.clone().json();

  if (!body.__debug) {
    return response;
  }

  const { __debug, ...cleanBody } = body;
  renderDebugToConsole(__debug);

  // Reconstruct response without __debug
  return new Response(JSON.stringify(cleanBody), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
```

## `renderDebugToConsole`

Formats the `DebugPayload` into grouped, styled console output.

### Console Output Format

```
▸ [debug] POST /api/views 23ms
    request   { slug: "hello-world" }
    span: getViewCount   { duration: "8ms", status: "ok" }
    span: redis.incr     { duration: "5ms", status: "ok" }
    response  { slug: "hello-world", count: 42 }
```

### Implementation

```typescript
import type { DebugPayload } from "./service";

function renderDebugToConsole(debug: DebugPayload): void {
  const label = `[debug] ${debug.route} ${debug.durationMs}ms`;

  // Use color styling for the group header
  console.groupCollapsed(
    `%c${label}`,
    "color: #0ff; font-weight: bold;",
  );

  // Render log entries
  for (const entry of debug.logs) {
    const method =
      entry.level === "error"
        ? "error"
        : entry.level === "warn"
          ? "warn"
          : "log";
    if (entry.attrs && Object.keys(entry.attrs).length > 0) {
      console[method](`${entry.msg}`, entry.attrs);
    } else {
      console[method](entry.msg);
    }
  }

  // Render span summaries
  for (const span of debug.spans) {
    const style =
      span.status === "error"
        ? "color: #f44; font-weight: bold;"
        : "color: #8f8;";
    console.log(
      `%cspan: ${span.name}`,
      style,
      {
        duration: span.durationMs !== null ? `${span.durationMs}ms` : "n/a",
        status: span.status,
        ...(span.attrs && Object.keys(span.attrs).length > 0
          ? { attrs: span.attrs }
          : {}),
      },
    );
  }

  console.groupEnd();
}
```

### Color Scheme

The console output uses TRON-inspired colors to match the site theme:

| Element | Color | CSS |
|---------|-------|-----|
| Group header | Cyan | `color: #0ff` |
| Info logs | Default | (no styling) |
| Warning logs | Yellow | `console.warn` (browser default) |
| Error logs | Red | `console.error` (browser default) |
| OK spans | Green | `color: #8f8` |
| Error spans | Red bold | `color: #f44; font-weight: bold` |

## Exports

```typescript
export { debugFetch, isDebugMode, renderDebugToConsole };
```

## Dependencies

- `lib/debug/service.ts` — `DebugPayload` type (import type only)
- No runtime dependencies beyond native `fetch` and `console`

## Notes

- `debugFetch` is a pure wrapper — it does not modify the original response
  object, only creates a new one without `__debug`
- The `Response` constructor preserves status and headers from the original
- `renderDebugToConsole` is exported separately for use in the streaming chat
  handler, which needs to render debug data from an SSE event rather than a
  JSON body
- `isDebugMode` is also exported for components that need to conditionally render
  debug UI (e.g., a debug indicator badge)
