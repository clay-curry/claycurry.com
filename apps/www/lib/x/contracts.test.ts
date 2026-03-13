import assert from "node:assert/strict";
import test from "node:test";
import {
  BookmarksApiResponseSchema,
  NormalizedBookmarkSchema,
  XOAuthTokenResponseSchema,
} from "./contracts";

test("XOAuthTokenResponseSchema rejects responses without refresh_token", () => {
  assert.throws(() =>
    XOAuthTokenResponseSchema.parse({
      token_type: "bearer",
      expires_in: 7200,
      access_token: "access-token",
    }),
  );
});

test("NormalizedBookmarkSchema enforces ISO timestamps", () => {
  assert.throws(() =>
    NormalizedBookmarkSchema.parse({
      id: "1",
      text: "hello",
      createdAt: "not-a-date",
      author: {
        id: "2",
        name: "Clay Curry",
        username: "claycurry__",
      },
      metrics: {
        likes: 1,
        retweets: 2,
        replies: 3,
        impressions: 4,
      },
      media: [],
    }),
  );
});

test("BookmarksApiResponseSchema accepts degraded stale responses", () => {
  const response = BookmarksApiResponseSchema.parse({
    bookmarks: [],
    folders: [],
    owner: {
      id: "123",
      username: "claycurry__",
      name: "Clay Curry",
    },
    status: "stale",
    isStale: true,
    lastSyncedAt: "2026-03-10T12:00:00.000Z",
    cachedAt: "2026-03-10T12:30:00.000Z",
    error: "token refresh failed",
  });

  assert.equal(response.status, "stale");
  assert.equal(response.isStale, true);
});
