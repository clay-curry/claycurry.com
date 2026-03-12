/**
 * @module x/mock-bookmarks
 *
 * Static mock bookmarks for preproduction environments (dev, preview).
 * Used when X OAuth credentials are not configured, providing realistic
 * sample data for UI development and testing without hitting the X API.
 *
 * Activated automatically by `BookmarksSyncService` when:
 * - `VERCEL_ENV` is not "production", AND
 * - `X_CLIENT_ID` / `X_CLIENT_SECRET` are not set
 */
import type { BookmarksApiResponse } from "./contracts";

const MOCK_OWNER = {
  id: "mock-owner-id",
  username: "claycurry__",
  name: "Clay Curry",
};

export const MOCK_BOOKMARKS_RESPONSE: BookmarksApiResponse = {
  bookmarks: [
    {
      id: "mock-1",
      text: "Effect is a powerful synchronous & asynchronous effect system for TypeScript. It provides a structured way to handle errors, manage resources, and compose complex operations.",
      createdAt: "2026-03-01T12:00:00.000Z",
      author: {
        id: "author-effect",
        name: "Effect",
        username: "EffectTS_",
      },
      metrics: { likes: 342, retweets: 89, replies: 23, impressions: 15200 },
      media: [],
    },
    {
      id: "mock-2",
      text: "Next.js 16 is here! App Router improvements, React 19 support, and better performance across the board. Check out the migration guide.",
      createdAt: "2026-02-15T09:30:00.000Z",
      author: {
        id: "author-vercel",
        name: "Vercel",
        username: "vercel",
      },
      metrics: { likes: 2841, retweets: 612, replies: 189, impressions: 98000 },
      media: [],
    },
    {
      id: "mock-3",
      text: "The future of TypeScript type-level programming is incredibly exciting. Conditional types, template literal types, and mapped types are just the beginning.",
      createdAt: "2026-02-10T15:45:00.000Z",
      author: {
        id: "author-ts",
        name: "TypeScript",
        username: "typescript",
      },
      metrics: { likes: 1523, retweets: 301, replies: 87, impressions: 52000 },
      media: [],
    },
    {
      id: "mock-4",
      text: "Building in public: shipped a cookie-based request tracing system with Effect.ts. Developers can see the full span tree of success/error values through the program. Debug mode: ?debug=1",
      createdAt: "2026-03-05T18:00:00.000Z",
      author: MOCK_OWNER,
      metrics: { likes: 47, retweets: 12, replies: 8, impressions: 3200 },
      media: [],
    },
    {
      id: "mock-5",
      text: "Structured concurrency > unstructured concurrency. Always. Your program should be a tree of effects, not a soup of promises.",
      createdAt: "2026-01-28T11:20:00.000Z",
      author: {
        id: "author-dev",
        name: "Software Design",
        username: "sw_design",
      },
      metrics: { likes: 891, retweets: 203, replies: 45, impressions: 28000 },
      media: [],
    },
  ],
  folders: [
    { id: "folder-tech", name: "Tech" },
    { id: "folder-fp", name: "Functional Programming" },
  ],
  owner: MOCK_OWNER,
  status: "fresh",
  isStale: false,
  lastSyncedAt: new Date().toISOString(),
  cachedAt: new Date().toISOString(),
};

/**
 * Returns true if the current environment should use mock bookmarks
 * (non-production without X credentials configured).
 */
export function shouldUseMockBookmarks(): boolean {
  const vercelEnv = process.env.VERCEL_ENV;
  const isProduction = vercelEnv === "production";
  const hasCredentials =
    Boolean(process.env.X_CLIENT_ID) && Boolean(process.env.X_CLIENT_SECRET);

  return !isProduction && !hasCredentials;
}
