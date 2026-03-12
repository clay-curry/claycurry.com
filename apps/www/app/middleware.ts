/**
 * @module middleware
 *
 * Next.js middleware for request tracing and debug mode.
 *
 * On every API request:
 * 1. Reads or generates a `trace_id` cookie (UUID v4, persists across requests)
 * 2. Checks for a `debug` cookie (set via `?debug=1` query param)
 * 3. Sets `x-trace-id` and `x-debug-mode` request headers for downstream handlers
 *
 * The `?debug=1` query param sets the debug cookie; `?debug=0` clears it.
 * This enables the developer debug panel for viewing request traces.
 */
import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // ─── Trace ID ──────────────────────────────────────────────────────────────
  let traceId = request.cookies.get("trace_id")?.value;
  if (!traceId) {
    traceId = crypto.randomUUID();
    response.cookies.set("trace_id", traceId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 86400, // 24 hours
    });
  }

  // Forward trace ID to route handler via request header
  response.headers.set("x-trace-id", traceId);

  // ─── Debug mode ────────────────────────────────────────────────────────────
  const debugParam = request.nextUrl.searchParams.get("debug");

  if (debugParam === "1") {
    response.cookies.set("debug", "1", {
      httpOnly: false, // client-side debug panel needs to read this
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    });
  } else if (debugParam === "0") {
    response.cookies.delete("debug");
  }

  const isDebug =
    debugParam === "1" || request.cookies.get("debug")?.value === "1";
  if (isDebug) {
    response.headers.set("x-debug-mode", "true");
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
