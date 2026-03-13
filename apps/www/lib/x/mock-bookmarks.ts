import type {
  BookmarksApiResponse,
  BookmarksStatusApiResponse,
  NormalizedBookmark,
  XBookmarkFolder,
} from "./contracts";

const MOCK_OWNER = {
  id: "1234567890",
  username: "claycurry__",
  name: "Clay Curry",
} as const;

const MOCK_FOLDERS: XBookmarkFolder[] = [
  { id: "folder-1", name: "Engineering" },
  { id: "folder-2", name: "Design" },
  { id: "folder-3", name: "Research" },
];

const MOCK_BOOKMARKS: NormalizedBookmark[] = [
  {
    id: "tweet-001",
    text: "The best way to learn a new framework is to build something real with it. Start with a problem you care about, not a todo app.",
    createdAt: "2025-12-15T14:30:00.000Z",
    author: {
      id: "auth-001",
      name: "Sarah Chen",
      username: "sarahchen_dev",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/placeholder/sarah.jpg",
      verified: true,
    },
    metrics: { likes: 2847, retweets: 512, replies: 89, impressions: 145000 },
    media: [],
  },
  {
    id: "tweet-002",
    text: "Just shipped our migration from REST to tRPC. Type safety across the entire stack changes how you think about API design. No more guessing what the server returns.",
    createdAt: "2025-12-10T09:15:00.000Z",
    author: {
      id: "auth-002",
      name: "Marcus Webb",
      username: "marcuswebb",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/placeholder/marcus.jpg",
      verified: false,
    },
    metrics: { likes: 1203, retweets: 287, replies: 45, impressions: 67000 },
    media: [],
  },
  {
    id: "tweet-003",
    text: "Effect.ts is not just another library — it's a paradigm shift for TypeScript. Typed errors, dependency injection, and observability built in from day one.",
    createdAt: "2025-11-28T16:45:00.000Z",
    author: {
      id: "auth-003",
      name: "Priya Sharma",
      username: "priya_fp",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/placeholder/priya.jpg",
      verified: true,
    },
    metrics: { likes: 4521, retweets: 891, replies: 203, impressions: 289000 },
    media: [],
  },
  {
    id: "tweet-004",
    text: "Hot take: most performance problems in React apps aren't React problems. They're data fetching problems disguised as rendering problems. Fix the waterfall, not the memo.",
    createdAt: "2025-11-20T11:00:00.000Z",
    author: {
      id: "auth-004",
      name: "Alex Rivera",
      username: "alexrivera_ui",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/placeholder/alex.jpg",
      verified: false,
    },
    metrics: { likes: 6732, retweets: 1543, replies: 412, impressions: 520000 },
    media: [],
  },
  {
    id: "tweet-005",
    text: "We replaced 400 lines of hand-rolled Redis caching with 30 lines of Effect layers. The testability improvement alone was worth the migration.",
    createdAt: "2025-11-15T08:20:00.000Z",
    author: {
      id: "auth-005",
      name: "Jordan Lee",
      username: "jordanlee_eng",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/placeholder/jordan.jpg",
      verified: false,
    },
    metrics: { likes: 892, retweets: 156, replies: 31, impressions: 42000 },
    media: [],
  },
  {
    id: "tweet-006",
    text: "The OKLCh color space is genuinely better for building design systems. Perceptually uniform lightness means your grays actually look like grays across all hues.",
    createdAt: "2025-11-08T13:10:00.000Z",
    author: {
      id: "auth-006",
      name: "Nina Patel",
      username: "ninapatel_design",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/placeholder/nina.jpg",
      verified: true,
    },
    metrics: { likes: 3105, retweets: 623, replies: 87, impressions: 178000 },
    media: [],
  },
  {
    id: "tweet-007",
    text: "Observability tip: structured logging with trace IDs will save you more debugging hours than any amount of unit tests. Instrument first, test second.",
    createdAt: "2025-10-30T17:55:00.000Z",
    author: {
      id: "auth-007",
      name: "David Kim",
      username: "davidkim_ops",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/placeholder/david.jpg",
      verified: false,
    },
    metrics: { likes: 1567, retweets: 342, replies: 56, impressions: 91000 },
    media: [],
  },
  {
    id: "tweet-008",
    text: "Functional programming in TypeScript doesn't mean abandoning OOP. It means choosing the right abstraction for the problem. Services as classes, data transforms as functions.",
    createdAt: "2025-10-22T10:30:00.000Z",
    author: {
      id: "auth-003",
      name: "Priya Sharma",
      username: "priya_fp",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/placeholder/priya.jpg",
      verified: true,
    },
    metrics: { likes: 2234, retweets: 478, replies: 112, impressions: 156000 },
    media: [],
  },
];

function nowIsoString(): string {
  return new Date().toISOString();
}

export function getMockBookmarksResponse(
  folderId?: string,
): BookmarksApiResponse {
  const bookmarks = folderId ? MOCK_BOOKMARKS.slice(0, 3) : MOCK_BOOKMARKS;

  return {
    bookmarks,
    folders: MOCK_FOLDERS,
    owner: MOCK_OWNER,
    status: "fresh",
    isStale: false,
    lastSyncedAt: nowIsoString(),
    cachedAt: nowIsoString(),
  };
}

/**
 * Debug mock scenarios for testing error states in preproduction.
 * Activated via `?mock=<scenario>` query param on the bookmarks API.
 */
export type MockScenario =
  | "static"
  | "empty"
  | "reauth_required"
  | "owner_mismatch"
  | "schema_invalid"
  | "upstream_error"
  | "stale";

export const MOCK_SCENARIOS: {
  value: MockScenario;
  label: string;
  description: string;
}[] = [
  {
    value: "static",
    label: "Static data",
    description: "Hardcoded bookmarks, no API calls",
  },
  {
    value: "empty",
    label: "Empty bookmarks",
    description: "Owner exists but has no bookmarks",
  },
  {
    value: "reauth_required",
    label: "Reauth required",
    description: "No X tokens stored",
  },
  {
    value: "owner_mismatch",
    label: "Owner mismatch",
    description: "Authenticated user differs from configured owner",
  },
  {
    value: "schema_invalid",
    label: "Schema invalid",
    description: "Upstream API returned unexpected shape",
  },
  {
    value: "upstream_error",
    label: "Upstream error",
    description: "X API returned a server error",
  },
  {
    value: "stale",
    label: "Stale cache",
    description: "Showing cached data after sync failure",
  },
];

export function getMockScenarioResponse(
  scenario: MockScenario,
  folderId?: string,
): { response: BookmarksApiResponse; httpStatus: number } {
  const now = nowIsoString();
  const base = {
    folders: MOCK_FOLDERS,
    owner: MOCK_OWNER,
    cachedAt: now,
  };

  switch (scenario) {
    case "static":
      return {
        response: {
          ...base,
          bookmarks: folderId ? MOCK_BOOKMARKS.slice(0, 3) : MOCK_BOOKMARKS,
          status: "fresh",
          isStale: false,
          lastSyncedAt: now,
        },
        httpStatus: 200,
      };

    case "empty":
      return {
        response: {
          ...base,
          bookmarks: [],
          status: "fresh",
          isStale: false,
          lastSyncedAt: now,
        },
        httpStatus: 200,
      };

    case "reauth_required":
      return {
        response: {
          ...base,
          bookmarks: [],
          status: "reauth_required",
          isStale: false,
          lastSyncedAt: null,
          error: "No X tokens stored. Run the OAuth setup flow first.",
        },
        httpStatus: 503,
      };

    case "owner_mismatch":
      return {
        response: {
          ...base,
          bookmarks: [],
          owner: {
            id: "9999999999",
            username: "wrong_user",
            name: "Wrong User",
          },
          status: "owner_mismatch",
          isStale: false,
          lastSyncedAt: null,
          error:
            "Authenticated user @wrong_user does not match configured owner @claycurry__.",
        },
        httpStatus: 409,
      };

    case "schema_invalid":
      return {
        response: {
          ...base,
          bookmarks: [],
          status: "schema_invalid",
          isStale: false,
          lastSyncedAt: null,
          error:
            "X API response did not match the expected schema. The upstream format may have changed.",
        },
        httpStatus: 502,
      };

    case "upstream_error":
      return {
        response: {
          ...base,
          bookmarks: [],
          status: "upstream_error",
          isStale: false,
          lastSyncedAt: null,
          error: "X API returned HTTP 500: Internal Server Error",
        },
        httpStatus: 502,
      };

    case "stale": {
      const staleTime = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      return {
        response: {
          ...base,
          bookmarks: MOCK_BOOKMARKS.slice(0, 4),
          status: "stale",
          isStale: true,
          lastSyncedAt: staleTime,
          error: "Live sync failed. Showing cached bookmarks.",
        },
        httpStatus: 200,
      };
    }
  }
}

export function getMockBookmarksStatusResponse(): BookmarksStatusApiResponse {
  return {
    owner: {
      configuredUsername: MOCK_OWNER.username,
      configuredUserId: MOCK_OWNER.id,
      resolvedOwner: MOCK_OWNER,
      authenticatedOwner: MOCK_OWNER,
    },
    token: {
      status: "valid",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      lastRefreshedAt: nowIsoString(),
    },
    sync: {
      lastAttemptedSyncAt: nowIsoString(),
      lastSuccessfulSyncAt: nowIsoString(),
      cacheAgeSeconds: 0,
      isSnapshotStale: false,
      lastError: null,
    },
  };
}
