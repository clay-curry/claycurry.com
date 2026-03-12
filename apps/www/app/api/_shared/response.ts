/**
 * @module api/_shared/response
 *
 * Standardized response helpers for API routes. Ensures consistent JSON
 * response shapes across all endpoints.
 *
 * Success responses: `{ ...data }`
 * Error responses: `{ error: string }`
 * Debug responses: `{ ...data, __trace: TraceLog }` (when debug mode is active)
 */
import { NextResponse } from "next/server";
import type { TraceLog } from "@/lib/services/Tracing";

export function jsonSuccess<T extends Record<string, unknown>>(
  data: T,
  options?: { trace?: TraceLog; cookies?: NextResponse },
): NextResponse {
  const body = options?.trace ? { ...data, __trace: options.trace } : data;
  return NextResponse.json(body);
}

export function jsonError(
  message: string,
  status: number,
  trace?: TraceLog,
): NextResponse {
  const body = trace ? { error: message, __trace: trace } : { error: message };
  return NextResponse.json(body, { status });
}

/** Map error tags to HTTP status codes */
export function errorToStatus(tag: string): number {
  switch (tag) {
    case "ValidationError":
      return 400;
    case "AuthError":
      return 401;
    case "RedisError":
      return 500;
    case "EmailError":
      return 502;
    case "UpstreamError":
      return 502;
    default:
      return 500;
  }
}
