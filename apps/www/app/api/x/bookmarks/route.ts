/**
 * @module api/x/bookmarks
 *
 * API Route: X Bookmarks
 *
 * Returns bookmarks (optionally filtered by folder) via the
 * BookmarksSyncService, which handles token management, caching,
 * and graceful stale fallback.
 *
 * Endpoint:
 * - GET /api/x/bookmarks?folder=<folderId>
 *
 * Effect services used: RedisService, TracingService
 */
import { Effect } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { UpstreamError } from "@/lib/effect/errors";
import { TracingService } from "@/lib/services/Tracing";
import { getXRuntimeConfig } from "@/lib/x/config";
import { BookmarksApiResponseSchema } from "@/lib/x/contracts";
import {
  MOCK_BOOKMARKS_RESPONSE,
  shouldUseMockBookmarks,
} from "@/lib/x/mock-bookmarks";
import { createBookmarksSyncServiceEffect } from "@/lib/x/runtime";
import { runRouteHandler } from "../../_shared/handler";

const handleGet = (req: NextRequest) =>
  Effect.gen(function* () {
    const tracing = yield* TracingService;

    // In preproduction without X credentials, return mock data
    if (shouldUseMockBookmarks()) {
      yield* Effect.logInfo("Serving mock bookmarks (preproduction mode)");
      return NextResponse.json(MOCK_BOOKMARKS_RESPONSE);
    }

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folder") || undefined;

    yield* Effect.logDebug("Starting live bookmarks sync").pipe(
      Effect.annotateLogs("folderId", folderId ?? "all"),
    );

    const service = yield* createBookmarksSyncServiceEffect();
    const result = yield* tracing.span(
      "x.getBookmarks",
      Effect.tryPromise({
        try: () => service.getBookmarks(folderId),
        catch: (e) =>
          new UpstreamError({
            message: e instanceof Error ? e.message : "Bookmarks sync failed",
            cause: e,
          }),
      }),
    );

    return NextResponse.json(result.response, { status: result.httpStatus });
  }).pipe(
    Effect.catchTag("UpstreamError", (error) => {
      const config = getXRuntimeConfig();
      return Effect.succeed(
        NextResponse.json(
          BookmarksApiResponseSchema.parse({
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
            error: error.message,
          }),
          { status: 500 },
        ),
      );
    }),
  );

export async function GET(req: NextRequest) {
  return runRouteHandler(req, handleGet(req));
}
