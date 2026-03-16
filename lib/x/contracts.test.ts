import { Schema } from "effect";
import { expect, test } from "vitest";
import {
  BookmarksApiResponseSchema,
  NormalizedBookmarkSchema,
  XOAuthTokenResponseSchema,
} from "./contracts";

test("XOAuthTokenResponseSchema rejects responses without refresh_token", () => {
  expect(() =>
    Schema.decodeUnknownSync(XOAuthTokenResponseSchema)({
      token_type: "bearer",
      expires_in: 7200,
      access_token: "access-token",
    }),
  ).toThrow();
});

test("NormalizedBookmarkSchema enforces ISO timestamps", () => {
  expect(() =>
    Schema.decodeUnknownSync(NormalizedBookmarkSchema)({
      id: "1",
      text: "hello",
      createdAt: "not-a-date",
      author: {
        id: "2",
        name: "Test User",
        username: "test_user",
      },
      metrics: {
        likes: 1,
        retweets: 2,
        replies: 3,
        impressions: 4,
      },
      media: [],
    }),
  ).toThrow();
});

test("BookmarksApiResponseSchema accepts degraded stale responses", () => {
  const response = Schema.decodeUnknownSync(BookmarksApiResponseSchema)({
    bookmarks: [],
    folders: [],
    owner: {
      id: "123",
      username: "test_user",
      name: "Test User",
    },
    status: "stale",
    isStale: true,
    lastSyncedAt: "2026-03-10T12:00:00.000Z",
    cachedAt: "2026-03-10T12:30:00.000Z",
    error: "token refresh failed",
  });

  expect(response.status).toBe("stale");
  expect(response.isStale).toBe(true);
});
