import { Effect } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { withDebug } from "@/lib/effect/with-debug";
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

  return withDebug(
    request,
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
