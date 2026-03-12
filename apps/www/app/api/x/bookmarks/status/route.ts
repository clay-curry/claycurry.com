/**
 * @module api/x/bookmarks/status
 *
 * API Route: Bookmark Sync Status
 *
 * Returns comprehensive sync status (token health, cache age, errors).
 * Gated behind the X_OWNER_SECRET for admin-only access.
 *
 * Endpoint:
 * - GET /api/x/bookmarks/status?secret=<ownerSecret>
 *
 * Effect services used: RedisService, TracingService
 */
import { Effect } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { AuthError, UpstreamError } from "@/lib/effect/errors";
import { TracingService } from "@/lib/services/Tracing";
import { getXOwnerSecret } from "@/lib/x/config";
import { createBookmarksSyncServiceEffect } from "@/lib/x/runtime";
import { runRouteHandler } from "../../../_shared/handler";

const handleGet = (req: NextRequest) =>
  Effect.gen(function* () {
    const tracing = yield* TracingService;
    const secret = new URL(req.url).searchParams.get("secret");
    const ownerSecret = getXOwnerSecret();

    if (!ownerSecret) {
      return yield* Effect.fail(
        new AuthError({ message: "X_OWNER_SECRET not configured" }),
      );
    }

    if (!secret || secret !== ownerSecret) {
      return yield* Effect.fail(new AuthError({ message: "Unauthorized" }));
    }

    const service = yield* createBookmarksSyncServiceEffect();
    const response = yield* tracing.span(
      "x.getStatus",
      Effect.tryPromise({
        try: () => service.getStatus(),
        catch: (e) =>
          new UpstreamError({
            message: e instanceof Error ? e.message : "Status fetch failed",
            cause: e,
          }),
      }),
    );

    return NextResponse.json(response);
  });

export async function GET(req: NextRequest) {
  return runRouteHandler(req, handleGet(req));
}
