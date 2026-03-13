import { Effect } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { withDebug } from "@/lib/effect/with-debug";
import { buildSpanTree } from "@/lib/tracing/span-tree";
import { getTrace } from "@/lib/tracing/storage";

const TRACE_ID_PATTERN = /^[0-9a-f]{32}$/;
const TRACE_COOKIE = "__trace";

function isAuthorized(request: NextRequest, traceId: string): boolean {
  // Allow if the __trace cookie matches the requested trace
  const cookieTraceId = request.cookies.get(TRACE_COOKIE)?.value;
  if (cookieTraceId === traceId) {
    return true;
  }

  // Allow if X_OWNER_SECRET matches
  const ownerSecret = process.env.X_OWNER_SECRET;
  if (ownerSecret) {
    const headerSecret = request.headers.get("x-owner-secret");
    const querySecret = new URL(request.url).searchParams.get("secret");
    if (headerSecret === ownerSecret || querySecret === ownerSecret) {
      return true;
    }
  }

  return false;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: traceId } = await params;

  if (!TRACE_ID_PATTERN.test(traceId)) {
    return NextResponse.json(
      { error: "Invalid trace ID format" },
      { status: 400 },
    );
  }

  if (!isAuthorized(request, traceId)) {
    // Return 404 to prevent information leakage
    return NextResponse.json({ error: "Trace not found" }, { status: 404 });
  }

  const tree = new URL(request.url).searchParams.get("tree") === "true";

  return withDebug(
    request,
    getTrace(traceId).pipe(
      Effect.map((result) => {
        if (!result) {
          return NextResponse.json(
            { error: "Trace not found" },
            { status: 404 },
          );
        }

        if (tree) {
          return NextResponse.json({
            traceId: result.traceId,
            meta: result.meta,
            roots: buildSpanTree(result.spans),
          });
        }

        return NextResponse.json(result);
      }),
      Effect.catchAll((err) => {
        console.error("Trace retrieval error:", err);
        return Effect.succeed(
          NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
          ),
        );
      }),
    ),
  );
}
