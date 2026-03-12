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
  try {
    const body = await request.json();
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
      try {
        const parsed = JSON.parse(cookie.value);
        if (Array.isArray(parsed)) {
          viewedPages = parsed;
        }
      } catch {
        // Malformed cookie — treat as empty
      }
    }

    // Check if this slug was already viewed
    if (viewedPages.includes(slug)) {
      return appRuntime.runPromise(
        getViewCount(slug).pipe(
          Effect.map((count) =>
            NextResponse.json({ slug, count, duplicate: true }),
          ),
          Effect.catchTag("RedisError", () =>
            Effect.succeed(
              NextResponse.json({ slug, count: 0, duplicate: true }),
            ),
          ),
        ),
      );
    }

    // New view — increment
    return await appRuntime.runPromise(
      incrementViewCount(slug).pipe(
        Effect.map((count) => {
          viewedPages.push(slug);
          if (viewedPages.length > MAX_VIEWED_PAGES) {
            viewedPages = viewedPages.slice(
              viewedPages.length - MAX_VIEWED_PAGES,
            );
          }

          const response = NextResponse.json({
            slug,
            count,
            duplicate: false,
          });
          response.cookies.set(
            VIEWED_PAGES_COOKIE,
            JSON.stringify(viewedPages),
            {
              httpOnly: true,
              sameSite: "lax",
              path: "/",
              maxAge: 86400,
            },
          );
          return response;
        }),
        Effect.catchTag("RedisError", (err) => {
          console.error("Redis incr error:", err.message);
          return Effect.succeed(
            NextResponse.json({ slug, count: 0, duplicate: false }),
          );
        }),
      ),
    );
  } catch (err) {
    console.error("Views POST parse error:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
