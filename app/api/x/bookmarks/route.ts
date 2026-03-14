import { Effect, Schema } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { appRuntime } from "@/lib/effect/runtime";
import { makeTracer, persistSpan, traceIdFromRequest } from "@/lib/tracing";
import { getXRuntimeConfig } from "@/lib/x/config";
import { BookmarksApiResponseSchema } from "@/lib/x/contracts";
import {
  BOOKMARKS_API_SOURCE_QUERY_PARAM,
  BOOKMARKS_LIVE_SOURCE,
  isLiveBookmarksSource,
} from "@/lib/x/debug";
import {
  getMockScenarioResponse,
  type MockScenario,
} from "@/lib/x/mock-bookmarks";
import { createBookmarksSyncService } from "@/lib/x/runtime";

const VALID_SCENARIOS = new Set<MockScenario>([
  "static",
  "empty",
  "reauth_required",
  "owner_mismatch",
  "schema_invalid",
  "upstream_error",
  "stale",
]);

function buildBookmarksErrorResponse(message: string, httpStatus: number) {
  const config = getXRuntimeConfig();

  return NextResponse.json(
    Schema.decodeUnknownSync(BookmarksApiResponseSchema)({
      bookmarks: [],
      folders: [],
      owner: {
        id: config.ownerUserId,
        username: config.ownerUsername,
        name: null,
      },
      status: "upstream_error",
      isStale: false,
      lastSyncedAt: null,
      cachedAt: new Date().toISOString(),
      error: message,
    }),
    { status: httpStatus },
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folder") || undefined;
  const traceId = traceIdFromRequest(request);
  const forceLive = isLiveBookmarksSource(
    searchParams.get(BOOKMARKS_API_SOURCE_QUERY_PARAM),
  );
  const isPreproduction = process.env.VERCEL_ENV !== "production";

  if (forceLive && !isPreproduction) {
    return buildBookmarksErrorResponse(
      "The live X API debug override is only available outside production.",
      400,
    );
  }

  // Debug mock override — non-production only
  const mockParam = searchParams.get("mock");
  if (
    !forceLive &&
    mockParam &&
    VALID_SCENARIOS.has(mockParam as MockScenario) &&
    isPreproduction
  ) {
    const { response, httpStatus } = getMockScenarioResponse(
      mockParam as MockScenario,
      folderId,
    );
    return NextResponse.json(response, { status: httpStatus });
  }

  const program = Effect.gen(function* () {
    const service = createBookmarksSyncService(fetch, {
      preferMockFallback: !forceLive,
    });
    const { response, httpStatus } = yield* service
      .getBookmarks(folderId, { forceLive })
      .pipe(Effect.withSpan("BookmarksSyncService.getBookmarks"));
    return NextResponse.json(response, { status: httpStatus });
  }).pipe(
    Effect.withSpan("GET /api/x/bookmarks", {
      attributes: {
        "http.method": "GET",
        "http.route": "/api/x/bookmarks",
        ...(folderId ? { "http.query.folder": folderId } : {}),
        ...(forceLive ? { "http.query.source": BOOKMARKS_LIVE_SOURCE } : {}),
      },
    }),
    Effect.catchAllDefect((defect) => {
      console.error("Bookmarks API error:", defect);

      return Effect.succeed(
        buildBookmarksErrorResponse(
          defect instanceof Error ? defect.message : "Unknown error",
          500,
        ),
      );
    }),
  );

  // If we have a trace ID from proxy, install the custom tracer
  // using Effect.withTracer so it overrides the default no-op tracer.
  if (traceId) {
    const onSpanEnd = (span: import("@/lib/tracing").Span) => {
      appRuntime.runPromise(persistSpan(span)).catch((err) => {
        console.error("[trace] persistSpan failed:", err);
      });
    };
    return appRuntime.runPromise(
      program.pipe(Effect.withTracer(makeTracer(traceId, onSpanEnd))),
    );
  }

  return Effect.runPromise(program);
}
