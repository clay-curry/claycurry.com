# Phase 5: Client-Side Integration

## Goal

Replace raw `fetch()` calls in all client-side API consumers with `debugFetch()`
so that debug logging works end-to-end from browser to server and back.

## Client Callers (6 total)

### 1. `lib/hooks/use-click-counts.ts`

**API calls**:
- `fetch("/api/clicks")` — GET, seed initial counts
- `fetch("/api/clicks", { method: "POST", ... })` — POST, batch click tracking

**Changes**:
- Add import: `import { debugFetch } from "@/lib/debug/client";`
- Replace both `fetch(` calls with `debugFetch(`
- No other changes needed — `debugFetch` is a drop-in replacement

**Debug output example**:
```
▸ [debug] GET /api/clicks 12ms
    fetched click counts  { count: 8 }
▸ [debug] POST /api/clicks 18ms
    batch click increment  { count: 3 }
    span: redis.multi     { duration: "6ms", status: "ok" }
```

### 2. `lib/components/site/page-views.tsx`

**API calls**:
- `fetch("/api/views", { method: "POST", ... })` — increment view
- `fetch(\`/api/views?slug=${slug}\`)` — GET count without incrementing

**Changes**:
- Add import: `import { debugFetch } from "@/lib/debug/client";`
- Replace both `fetch(` calls with `debugFetch(`

**Debug output example**:
```
▸ [debug] POST /api/views 23ms
    view count incremented  { slug: "hello-world", count: 42 }
    span: redis.incr       { duration: "5ms", status: "ok" }
```

### 3. `lib/components/site/page-feedback.tsx`

**API calls**:
- `fetch("/api/feedback", { method: "POST", ... })` — submit feedback

**Changes**:
- Add import: `import { debugFetch } from "@/lib/debug/client";`
- Replace `fetch(` with `debugFetch(`

**Debug output example**:
```
▸ [debug] POST /api/feedback 156ms
    feedback received  { page: "/blog/hello", sentiment: "positive" }
    feedback email sent
```

### 4. `app/(portfolio)/contact/page.tsx`

**API calls**:
- `fetch("/api/contact", { method: "POST", ... })` — submit contact form

**Changes**:
- Add import: `import { debugFetch } from "@/lib/debug/client";`
- Replace `fetch(` with `debugFetch(`

**Debug output example**:
```
▸ [debug] POST /api/contact 203ms
    request parsed   { name: "Jane", email: "jane@example.com" }
    email sent via Resend
```

### 5. `lib/hooks/use-bookmarks.ts`

**API calls**:
- `fetch(\`/api/x/bookmarks?...\`)` — GET bookmarks with filters

**Changes**:
- Add import: `import { debugFetch } from "@/lib/debug/client";`
- Replace `fetch(` with `debugFetch(`

**Debug output example**:
```
▸ [debug] GET /api/x/bookmarks 89ms
    bookmarks sync requested  { mock: null }
    sync result              { status: "fresh", bookmarkCount: 24 }
    span: BookmarksSyncService.sync  { duration: "72ms", status: "ok" }
```

### 6. `lib/hooks/use-chat-session.ts` (Streaming)

**API calls**:
- Uses Vercel AI SDK `useChat()` with `DefaultChatTransport` — POST to
  `/api/chat`

**This caller requires special handling** because `useChat` manages its own
fetch internally via the transport layer.

**Changes**:

#### Option A: Custom transport with debug header injection

Create a debug-aware transport that wraps `DefaultChatTransport`:

```typescript
import { isDebugMode, renderDebugToConsole } from "@/lib/debug/client";

// In the useChat configuration:
const transport = new DefaultChatTransport({
  api: `${basePath}/api/chat`,
  headers: () => {
    const headers: Record<string, string> = {};
    if (isDebugMode()) {
      headers["X-Debug"] = "1";
    }
    return headers;
  },
});
```

#### SSE debug event listener

Add an `onFinish` or stream event listener to detect the `debug` SSE event:

```typescript
// After useChat hook setup, add effect to listen for debug events
// The chat route appends: event: debug\ndata: {...}\n\n
// We need to intercept this before useChat processes it

// Approach: Use the onResponse callback to attach an EventSource listener
const { messages, ... } = useChat({
  // ...existing config...
  onResponse(response) {
    if (!isDebugMode()) return;

    // Read the debug event from response clone
    const reader = response.clone().body?.getReader();
    if (!reader) return;

    // Process the stream to find the debug event
    const decoder = new TextDecoder();
    let buffer = "";

    (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
      }

      // Look for the debug event in the complete buffer
      const debugMatch = buffer.match(/event: debug\ndata: (.+)\n/);
      if (debugMatch) {
        try {
          const payload = JSON.parse(debugMatch[1]);
          renderDebugToConsole(payload);
        } catch { /* ignore parse errors */ }
      }
    })();
  },
});
```

**Debug output example**:
```
▸ [debug] POST /api/chat 1523ms
    chat request        { model: "grok-3-mini", messageCount: 5, webSearch: false }
    system prompt built { type: "general" }
    stream started
```

---

## `navigator.sendBeacon` Handling

The `use-click-counts.ts` hook uses `navigator.sendBeacon()` as a fallback for
page unload events. `sendBeacon` does not support custom headers, so debug mode
will not work for beacon requests. This is acceptable because:

1. Beacon requests fire on page hide/unload — the console is about to be
   destroyed anyway
2. The primary `fetch`-based path handles debug mode correctly
3. No changes needed for the beacon fallback

## Import Pattern

All 5 non-streaming callers add the same import:

```typescript
import { debugFetch } from "@/lib/debug/client";
```

The streaming caller imports:

```typescript
import { isDebugMode, renderDebugToConsole } from "@/lib/debug/client";
```

## Barrel Export

Create `lib/debug/index.ts` to re-export all public APIs:

```typescript
// Server-side exports
export {
  DebugLog,
  DebugLogLive,
  DebugLogNoop,
  debugLog,
  debugWarn,
  debugError,
} from "./service";
export type {
  DebugLogEntry,
  DebugSpanEntry,
  DebugPayload,
} from "./service";
export { runWithDebug, withDebug } from "./with-debug";

// Note: client.ts is imported directly as "lib/debug/client"
// because it has the "use client" directive and shouldn't be
// bundled with server code
```
