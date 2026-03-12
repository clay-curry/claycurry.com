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
    Effect.tryPromise({
      try: async () => {
        const service = createBookmarksSyncService();
        const response = await service.getStatus();
        return NextResponse.json(response);
      },
      catch: (error) => error,
    }).pipe(
      Effect.catchAll((error) => {
        console.error("Bookmarks status API error:", error);
        return Effect.succeed(
          NextResponse.json(
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
          ),
        );
      }),
    ),
  );
}
