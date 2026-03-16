/**
 * `GET /api/x/bookmarks` — Main bookmarks retrieval endpoint.
 *
 * Supports:
 * - **Cache-first sync**: returns a fresh Redis snapshot if available,
 *   otherwise triggers a live X API sync.
 * - **Folder filtering**: `?folder=<id>` to scope to a specific folder.
 * - **Debug mock override**: `?mock=<scenario>` in preproduction to simulate
 *   error states (e.g. `reauth_required`, `upstream_error`).
 * - **Force live sync**: `?source=live` in preproduction to bypass the cache.
 * - **Distributed tracing**: when `?debug=1` is present, the proxy injects
 *   a trace ID and this route installs a custom Effect tracer that persists
 *   spans to Redis.
 *
 * @module
 */
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
  let ownerUsername: string | null = null;
  let ownerUserId: string | null = null;
  try {
    const config = getXRuntimeConfig();
    ownerUsername = config.ownerUsername;
    ownerUserId = config.ownerUserId;
  } catch {
    // Config may be unavailable (e.g. X_OWNER_USERNAME not set)
  }

  return NextResponse.json(
    Schema.decodeUnknownSync(BookmarksApiResponseSchema)({
      bookmarks: [],
      folders: [],
      owner: {
        id: ownerUserId,
        username: ownerUsername ?? "unknown",
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

  // If we have a trace ID from middleware, install the custom tracer
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
