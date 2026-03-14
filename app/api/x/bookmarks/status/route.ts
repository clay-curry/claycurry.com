/**
 * `GET /api/x/bookmarks/status` — Sync status endpoint.
 *
 * Returns a detailed `BookmarksStatusApiResponse` with owner identity,
 * token health, and sync timestamps. Requires `?secret=<X_OWNER_SECRET>`
 * query parameter for authentication — only the configured site owner
 * can view this data.
 *
 * @module
 */
import { Effect } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { getXOwnerSecret } from "@/lib/x/config";
import { createBookmarksSyncService } from "@/lib/x/runtime";

export async function GET(request: NextRequest) {
  const secret = new URL(request.url).searchParams.get("secret");
  const ownerSecret = getXOwnerSecret();

  if (!ownerSecret) {
    return NextResponse.json(
      { error: "X_OWNER_SECRET not configured" },
      { status: 500 },
    );
  }

  if (!secret || secret !== ownerSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Effect.runPromise(
    Effect.gen(function* () {
      const service = createBookmarksSyncService();
      const response = yield* service.getStatus();
      return NextResponse.json(response);
    }).pipe(
      Effect.catchAllDefect((defect) => {
        console.error("Bookmarks status API error:", defect);
        return Effect.succeed(
          NextResponse.json(
            {
              error: defect instanceof Error ? defect.message : "Unknown error",
            },
            { status: 500 },
          ),
        );
      }),
    ),
  );
}
