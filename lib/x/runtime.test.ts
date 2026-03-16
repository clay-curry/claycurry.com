import { expect, test } from "vitest";
import { createBookmarksSyncService } from "./runtime";
import { withEnv } from "./test-utils";

test("createBookmarksSyncService returns a live service wrapper when preferMockFallback is false", () => {
  const service = withEnv(
    {
      VERCEL_ENV: "preview",
      X_OWNER_USERNAME: "test_user",
      X_OAUTH2_CLIENT_ID: undefined,
      X_OAUTH2_CLIENT_SECRET: undefined,
    },
    () => createBookmarksSyncService(fetch, { preferMockFallback: false }),
  );

  expect(service).toHaveProperty("getBookmarks");
  expect(service).toHaveProperty("getStatus");
});
