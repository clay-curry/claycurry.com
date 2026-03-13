import { expect, test } from "vitest";
import { createBookmarksSyncService } from "./runtime";
import { BookmarksSyncService } from "./service";
import { withEnv } from "./test-utils";

test("createBookmarksSyncService can bypass the mock fallback for live debug requests", () => {
  const service = withEnv(
    {
      VERCEL_ENV: "preview",
      X_OAUTH2_CLIENT_ID: undefined,
      X_OAUTH2_CLIENT_SECRET: undefined,
    },
    () => createBookmarksSyncService(fetch, { preferMockFallback: false }),
  );

  expect(service).toBeInstanceOf(BookmarksSyncService);
});
