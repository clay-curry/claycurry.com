import { Effect } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { getXRuntimeConfig } from "@/lib/x/config";
import { BookmarksApiResponseSchema } from "@/lib/x/contracts";
import { createBookmarksSyncService } from "@/lib/x/runtime";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folder") || undefined;

  return Effect.runPromise(
    Effect.tryPromise({
      try: async () => {
        const service = createBookmarksSyncService();
        const { response, httpStatus } = await service.getBookmarks(folderId);
        return NextResponse.json(response, { status: httpStatus });
      },
      catch: (error) => error,
    }).pipe(
      Effect.catchAll((error) => {
        const config = getXRuntimeConfig();
        console.error("Bookmarks API error:", error);

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
              error: error instanceof Error ? error.message : "Unknown error",
            }),
            { status: 500 },
          ),
        );
      }),
    ),
  );
}
