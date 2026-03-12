/**
 * @module api/views
 *
 * API Route: Page View Counter
 *
 * Tracks and retrieves page view counts for blog posts and other content.
 * Uses the RedisService Effect layer for persistence with automatic
 * in-memory fallback handled transparently by the service.
 *
 * Cookie-based deduplication prevents the same visitor from inflating
 * counts within a 24-hour window.
 *
 * Endpoints:
 * - GET /api/views?slug=<slug> — Retrieve current view count
 * - POST /api/views { slug: "<slug>" } — Increment and return view count
 *
 * Effect services used: RedisService, TracingService
 */
import { Effect } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { ValidationError } from "@/lib/effect/errors";
import { RedisService } from "@/lib/services/Redis";
import { TracingService } from "@/lib/services/Tracing";
import { runRouteHandler } from "../_shared/handler";

/** Max number of slugs stored in the dedup cookie */
const MAX_VIEWED_PAGES = 100;
const VIEWED_PAGES_COOKIE = "viewed_pages";

const getViewCount = (slug: string) =>
  Effect.gen(function* () {
    const redis = yield* RedisService;
    const tracing = yield* TracingService;
    const key = `${redis.keyPrefix}pageviews:${slug}`;
    const raw = yield* tracing.span("redis.get", redis.get(key));
    return raw ? Number.parseInt(raw, 10) : 0;
  });

const incrementViewCount = (slug: string) =>
  Effect.gen(function* () {
    const redis = yield* RedisService;
    const tracing = yield* TracingService;
    const key = `${redis.keyPrefix}pageviews:${slug}`;
    return yield* tracing.span("redis.incr", redis.incr(key));
  });

const handleGet = (req: NextRequest) =>
  Effect.gen(function* () {
    const tracing = yield* TracingService;
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return yield* Effect.fail(
        new ValidationError({ message: "Missing slug parameter" }),
      );
    }

    const count = yield* tracing.span("getViewCount", getViewCount(slug));
    return NextResponse.json({ slug, count });
  });

const handlePost = (req: NextRequest) =>
  Effect.gen(function* () {
    const tracing = yield* TracingService;

    const body = yield* Effect.tryPromise({
      try: () => req.json(),
      catch: () => new ValidationError({ message: "Invalid request body" }),
    });

    const slug = body.slug;
    if (!slug || typeof slug !== "string") {
      return yield* Effect.fail(
        new ValidationError({ message: "Missing slug in request body" }),
      );
    }

    // Parse the viewed_pages cookie
    let viewedPages: string[] = [];
    const cookie = req.cookies.get(VIEWED_PAGES_COOKIE);
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
      yield* Effect.logDebug("Duplicate view, skipping increment").pipe(
        Effect.annotateLogs("slug", slug),
      );
      const count = yield* tracing.span("getViewCount", getViewCount(slug));
      return NextResponse.json({ slug, count, duplicate: true });
    }

    // New view — increment
    const count = yield* tracing.span(
      "incrementViewCount",
      incrementViewCount(slug),
    );
    yield* Effect.logDebug("View count incremented").pipe(
      Effect.annotateLogs("slug", slug),
      Effect.annotateLogs("count", count),
    );

    // Update the cookie array (cap at MAX_VIEWED_PAGES, drop oldest)
    viewedPages.push(slug);
    if (viewedPages.length > MAX_VIEWED_PAGES) {
      viewedPages = viewedPages.slice(viewedPages.length - MAX_VIEWED_PAGES);
    }

    const response = NextResponse.json({ slug, count, duplicate: false });
    response.cookies.set(VIEWED_PAGES_COOKIE, JSON.stringify(viewedPages), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 86400, // 24 hours
    });

    return response;
  });

export async function GET(req: NextRequest) {
  return runRouteHandler(req, handleGet(req));
}

export async function POST(req: NextRequest) {
  return runRouteHandler(req, handlePost(req));
}
