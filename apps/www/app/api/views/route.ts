import { Effect } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { appRuntime } from "@/lib/effect/runtime";
import { keyPrefix, RedisClient } from "@/lib/effect/services/redis";

/** Max number of slugs stored in the dedup cookie */
const MAX_VIEWED_PAGES = 100;
const VIEWED_PAGES_COOKIE = "viewed_pages";

function viewKey(slug: string): string {
  return `${keyPrefix()}pageviews:${slug}`;
}

const getViewCount = (slug: string) =>
  Effect.gen(function* () {
    const redis = yield* RedisClient;
    const raw = yield* redis.get(viewKey(slug));
    return raw ? Number.parseInt(raw, 10) : 0;
  });

const incrementViewCount = (slug: string) =>
  Effect.gen(function* () {
    const redis = yield* RedisClient;
    return yield* redis.incr(viewKey(slug));
  });

export async function GET(request: NextRequest) {
  const slug = new URL(request.url).searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { error: "Missing slug parameter" },
      { status: 400 },
    );
  }

  return appRuntime.runPromise(
    getViewCount(slug).pipe(
      Effect.map((count) => NextResponse.json({ slug, count })),
      Effect.catchTag("RedisError", (err) => {
        console.error("Redis get error:", err.message);
        return Effect.succeed(NextResponse.json({ slug, count: 0 }));
      }),
    ),
  );
}

export async function POST(request: NextRequest) {
  return appRuntime.runPromise(
    Effect.gen(function* () {
      const body = yield* Effect.tryPromise({
        try: () => request.json(),
        catch: () => ({ _tag: "ParseError" as const }),
      });

      const slug = body.slug;
      if (!slug) {
        return NextResponse.json(
          { error: "Missing slug in request body" },
          { status: 400 },
        );
      }

      // Parse the viewed_pages cookie
      let viewedPages: string[] = [];
      const cookie = request.cookies.get(VIEWED_PAGES_COOKIE);
      if (cookie?.value) {
        const parsed = Effect.try(() => JSON.parse(cookie.value));
        const result = Effect.runSync(Effect.either(parsed));
        if (result._tag === "Right" && Array.isArray(result.right)) {
          viewedPages = result.right;
        }
      }

      // Check if this slug was already viewed
      if (viewedPages.includes(slug)) {
        const count = yield* getViewCount(slug).pipe(
          Effect.catchTag("RedisError", () => Effect.succeed(0)),
        );
        return NextResponse.json({ slug, count, duplicate: true });
      }

      // New view — increment
      const count = yield* incrementViewCount(slug).pipe(
        Effect.catchTag("RedisError", (err) => {
          console.error("Redis incr error:", err.message);
          return Effect.succeed(0);
        }),
      );

      viewedPages.push(slug);
      if (viewedPages.length > MAX_VIEWED_PAGES) {
        viewedPages = viewedPages.slice(viewedPages.length - MAX_VIEWED_PAGES);
      }

      const response = NextResponse.json({
        slug,
        count,
        duplicate: false,
      });
      response.cookies.set(VIEWED_PAGES_COOKIE, JSON.stringify(viewedPages), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 86400,
      });
      return response;
    }).pipe(
      Effect.catchTag("ParseError", () =>
        Effect.succeed(
          NextResponse.json({ error: "Invalid request body" }, { status: 400 }),
        ),
      ),
    ),
  );
}
