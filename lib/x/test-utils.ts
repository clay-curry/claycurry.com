import { Effect, Layer } from "effect";
import { BookmarksRepo } from "./cache";
import { XBookmarksClient } from "./client";
import type {
  BookmarkSourceOwner,
  BookmarksSnapshotRecord,
  BookmarksSyncStatusRecord,
  NormalizedBookmark,
  XBookmarkFolder,
  XTokenRecord,
} from "./contracts";

export const owner: BookmarkSourceOwner = {
  id: "owner-1",
  username: "claycurry__",
  name: "Clay Curry",
};

export const liveConfig = {
  mode: "live" as const,
  ownerUsername: "claycurry__",
  ownerUserId: "owner-1",
  clientId: "client-id",
  clientSecret: "client-secret",
  ownerSecret: "owner-secret",
  snapshotFreshnessMs: 30 * 60 * 1000,
};

export function createBookmark(id: string): NormalizedBookmark {
  return {
    id,
    text: `bookmark ${id}`,
    createdAt: "2026-03-10T07:00:00.000Z",
    author: {
      id: "author-1",
      name: "Author",
      username: "author",
    },
    metrics: {
      likes: 1,
      retweets: 2,
      replies: 3,
      impressions: 4,
    },
    media: [],
  };
}

export function createTokenRecord(expiresAt: number): XTokenRecord {
  return {
    accessToken: "stored-access-token",
    refreshToken: "stored-refresh-token",
    expiresAt,
    owner,
    createdAt: "2026-03-10T06:00:00.000Z",
    updatedAt: "2026-03-10T06:00:00.000Z",
    lastRefreshedAt: null,
  };
}

export function createSnapshot(input: {
  lastSyncedAt: string | null;
  cachedAt: string;
  bookmarkId: string;
}): BookmarksSnapshotRecord {
  return {
    owner,
    folderId: null,
    bookmarks: [createBookmark(input.bookmarkId)],
    folders: [],
    lastSyncedAt: input.lastSyncedAt,
    cachedAt: input.cachedAt,
    source: "live",
  };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** Mutable in-memory state backing the test BookmarksRepo layer. */
export interface MemoryRepoState {
  tokenRecord: XTokenRecord | null;
  snapshot: BookmarksSnapshotRecord | null;
  statusRecord: BookmarksSyncStatusRecord | null;
}

/** Creates a test `BookmarksRepo` layer backed by mutable in-memory state. */
export function makeTestBookmarksRepo(): {
  state: MemoryRepoState;
  layer: Layer.Layer<BookmarksRepo>;
} {
  const state: MemoryRepoState = {
    tokenRecord: null,
    snapshot: null,
    statusRecord: null,
  };

  const layer = Layer.succeed(BookmarksRepo, {
    getTokenRecord: (_ownerUsername) => Effect.succeed(state.tokenRecord),
    setTokenRecord: (_ownerUsername, record) =>
      Effect.sync(() => {
        state.tokenRecord = record;
      }),
    deleteTokenRecord: (_ownerUsername) =>
      Effect.sync(() => {
        state.tokenRecord = null;
      }),
    getSnapshot: (_owner, _folderId) => Effect.succeed(state.snapshot),
    setSnapshot: (_ownerUsername, snapshot) =>
      Effect.sync(() => {
        state.snapshot = snapshot;
      }),
    getStatus: (_ownerUsername) => Effect.succeed(state.statusRecord),
    setStatus: (_ownerUsername, status) =>
      Effect.sync(() => {
        state.statusRecord = status;
      }),
  });

  return { state, layer };
}

export class StubBookmarksClient extends XBookmarksClient {
  bookmarks: NormalizedBookmark[] = [createBookmark("fresh-live")];
  folders: XBookmarkFolder[] = [{ id: "folder-1", name: "Favorites" }];
  authenticatedOwner = owner;
  resolvedOwner = owner;

  constructor() {
    super(async () => new Response(null, { status: 200 }));
  }

  getAuthenticatedUser(_accessToken: string) {
    return Effect.succeed(this.authenticatedOwner);
  }

  getUserByUsername(_username: string, _accessToken: string) {
    return Effect.succeed(this.resolvedOwner);
  }

  fetchAllBookmarks(_userId: string, _accessToken: string) {
    return Effect.succeed(this.bookmarks);
  }

  fetchBookmarksByFolder(
    _userId: string,
    _folderId: string,
    _accessToken: string,
  ) {
    return Effect.succeed(this.bookmarks);
  }

  fetchBookmarkFolders(_userId: string, _accessToken: string) {
    return Effect.succeed(this.folders);
  }
}

export class StubIdentityClient extends XBookmarksClient {
  constructor(
    private readonly authenticatedUsername: string,
    private readonly resolvedOwnerId = "owner-1",
  ) {
    super(async () => new Response(null, { status: 200 }));
  }

  getAuthenticatedUser(_accessToken: string) {
    return Effect.succeed({
      id: "auth-1",
      username: this.authenticatedUsername,
      name: "Authenticated User",
    });
  }

  getUserByUsername(username: string, _accessToken: string) {
    return Effect.succeed({
      id: this.resolvedOwnerId,
      username,
      name: "Resolved User",
    });
  }
}

export function withEnv<T>(
  overrides: Record<string, string | undefined>,
  run: () => T,
): T {
  const previous = new Map<string, string | undefined>();
  const restore = () => {
    for (const [key, value] of previous) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };

  for (const [key, value] of Object.entries(overrides)) {
    previous.set(key, process.env[key]);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    const result = run();

    if (
      result &&
      typeof result === "object" &&
      "finally" in result &&
      typeof result.finally === "function"
    ) {
      return result.finally(() => restore()) as T;
    }

    restore();
    return result;
  } catch (error) {
    restore();
    throw error;
  }
}
