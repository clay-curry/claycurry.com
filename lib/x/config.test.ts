import { expect, test } from "vitest";
import { profileData } from "@/lib/portfolio-data";
import { getXRuntimeConfig } from "./config";
import { withEnv } from "./test-utils";

test("getXRuntimeConfig defaults to the site data username when X_OWNER_USERNAME is unset", () => {
  const config = withEnv(
    {
      X_OWNER_USERNAME: undefined,
      X_OAUTH2_CLIENT_ID: undefined,
      X_OAUTH2_CLIENT_SECRET: undefined,
      X_OWNER_USER_ID: undefined,
      X_OWNER_SECRET: undefined,
    },
    () => getXRuntimeConfig(),
  );

  expect(config.ownerUsername).toBe(profileData.xUsername);
  expect(config.mode).toBe("live");
});

test("getXRuntimeConfig enters live mode only when both OAuth credentials are set", () => {
  const config = withEnv(
    {
      X_OWNER_USERNAME: "test_user",
      X_OAUTH2_CLIENT_ID: "client-id",
      X_OAUTH2_CLIENT_SECRET: "client-secret",
      X_OWNER_USER_ID: "owner-1",
      X_OWNER_SECRET: "owner-secret",
    },
    () => getXRuntimeConfig(),
  );

  expect(config.mode).toBe("live");
  expect(config.ownerUsername).toBe("test_user");
  expect(config.ownerUserId).toBe("owner-1");
});
