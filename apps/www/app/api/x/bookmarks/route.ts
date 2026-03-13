import { Effect, Schema } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { appRuntime } from "@/lib/effect/runtime";
import {
  makeTracerLayer,
  persistSpan,
  traceIdFromRequest,
} from "@/lib/tracing";
import { getXRuntimeConfig } from "@/lib/x/config";
import { BookmarksApiResponseSchema } from "@/lib/x/contracts";
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folder") || undefined;
  const traceId = traceIdFromRequest(request);

  // Debug mock override — non-production only
  const mockParam = searchParams.get("mock");
  if (
    mockParam &&
    VALID_SCENARIOS.has(mockParam as MockScenario) &&
    process.env.VERCEL_ENV !== "production"
  ) {
    const { response, httpStatus } = getMockScenarioResponse(
      mockParam as MockScenario,
      folderId,
    );
    return NextResponse.json(response, { status: httpStatus });
  }

  const program = Effect.gen(function* () {
    const service = createBookmarksSyncService();
    const { response, httpStatus } = yield* service
      .getBookmarks(folderId)
      .pipe(Effect.withSpan("BookmarksSyncService.getBookmarks"));
    return NextResponse.json(response, { status: httpStatus });
  }).pipe(
    Effect.withSpan("GET /api/x/bookmarks", {
      attributes: {
        "http.method": "GET",
        "http.route": "/api/x/bookmarks",
        ...(folderId ? { "http.query.folder": folderId } : {}),
      },
    }),
    Effect.catchAllDefect((defect) => {
      const config = getXRuntimeConfig();
      console.error("Bookmarks API error:", defect);

      return Effect.succeed(
        NextResponse.json(
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
            error: defect instanceof Error ? defect.message : "Unknown error",
          }),
          { status: 500 },
        ),
      );
    }),
  );

  // If we have a trace ID from middleware, install the tracer layer
  if (traceId) {
    const onSpanEnd = (span: import("@/lib/tracing").Span) => {
      appRuntime.runFork(persistSpan(span));
    };
    return appRuntime.runPromise(
      program.pipe(Effect.provide(makeTracerLayer(traceId, onSpanEnd))),
    );
  }

  return Effect.runPromise(program);
}
