/**
 * API Route: Page View Counter
 *
 * Tracks and retrieves page view counts for blog posts and other content.
 * Uses Redis for persistent storage in production, with an in-memory fallback
 * for local development when Redis is not configured.
 *
 * Endpoints:
 * - GET /api/views?slug=<slug> - Retrieve the current view count for a page
 * - POST /api/views { slug: "<slug>" } - Increment and return the view count
 *
 * Environment Variables:
 * - KV_REST_API_REDIS_URL: Redis connection URL (optional, falls back to in-memory)
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/route-handlers
 */
import { type NextRequest, NextResponse } from "next/server";
import { getInMemoryStore, getRedisClient, keyPrefix } from "@/lib/redis";

/**
 * Retrieves the current view count for a given page slug.
 *
 * @param slug - The unique identifier for the page (e.g., blog post slug)
 * @returns The current view count, or 0 if not found
 */
async function getViewCount(slug: string): Promise<number> {
  const inMemoryStore = getInMemoryStore();
  try {
    const client = await getRedisClient();
    if (!client) {
      return inMemoryStore.get(slug) ?? 0;
    }

    const count = await client.get(`${keyPrefix()}pageviews:${slug}`);
    return count ? parseInt(count, 10) : 0;
  } catch (err) {
    console.error("Redis get error:", err);
    return inMemoryStore.get(slug) ?? 0;
  }
}

/**
 * Atomically increments the view count for a given page slug.
 *
 * @param slug - The unique identifier for the page (e.g., blog post slug)
 * @returns The new view count after incrementing
 */
async function incrementViewCount(slug: string): Promise<number> {
  const inMemoryStore = getInMemoryStore();
  try {
    const client = await getRedisClient();
    if (!client) {
      const current = inMemoryStore.get(slug) ?? 0;
      const newCount = current + 1;
      inMemoryStore.set(slug, newCount);
      return newCount;
    }

    const count = await client.incr(`${keyPrefix()}pageviews:${slug}`);
    return count;
  } catch (err) {
    console.error("Redis incr error:", err);
    const current = inMemoryStore.get(slug) ?? 0;
    const newCount = current + 1;
    inMemoryStore.set(slug, newCount);
    return newCount;
  }
}

/**
 * GET /api/views
 *
 * Fetches the current view count for a page without incrementing it.
 *
 * @param request - The incoming request with `slug` query parameter
 * @returns JSON response with `{ slug, count }` or error
 *
 * @example
 * // Request
 * GET /api/views?slug=my-blog-post
 *
 * // Response
 * { "slug": "my-blog-post", "count": 42 }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { error: "Missing slug parameter" },
      { status: 400 },
    );
  }

  const count = await getViewCount(slug);
  return NextResponse.json({ slug, count });
}

/** Max number of slugs stored in the dedup cookie */
const MAX_VIEWED_PAGES = 100;
const VIEWED_PAGES_COOKIE = "viewed_pages";

/**
 * POST /api/views
 *
 * Increments and returns the view count for a page. Uses a cookie to
 * deduplicate views from the same visitor within a 24-hour window.
 *
 * @param request - The incoming request with `{ slug }` in the JSON body
 * @returns JSON response with `{ slug, count, duplicate }` or error
 */
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
      const count = await getViewCount(slug);
      return NextResponse.json({ slug, count, duplicate: true });
    }

    // New view — increment
    const count = await incrementViewCount(slug);

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
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
