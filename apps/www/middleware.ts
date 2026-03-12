import { type NextRequest, NextResponse } from "next/server";

const TRACE_COOKIE = "__trace";
const TRACE_HEADER = "x-trace-id";
const TRACE_TTL_SECONDS = 3600;

function generateTraceId(): string {
  return crypto.randomUUID().replaceAll("-", "");
}

export function middleware(request: NextRequest) {
  const existingTraceId = request.cookies.get(TRACE_COOKIE)?.value;
  const isValid = existingTraceId && /^[0-9a-f]{32}$/.test(existingTraceId);
  const traceId = isValid ? existingTraceId : generateTraceId();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(TRACE_HEADER, traceId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (!isValid) {
    const isProduction = process.env.NODE_ENV === "production";
    response.cookies.set(TRACE_COOKIE, traceId, {
      path: "/api",
      httpOnly: true,
      sameSite: "strict",
      secure: isProduction,
      maxAge: TRACE_TTL_SECONDS,
    });
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
