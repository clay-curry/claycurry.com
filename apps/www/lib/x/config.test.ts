import { expect, test } from "vitest";
import { getXRuntimeConfig } from "./config";
import { withEnv } from "./test-utils";

test("getXRuntimeConfig defaults the canonical owner username to claycurry__", () => {
  const config = withEnv(
    {
      X_OWNER_USERNAME: undefined,
      X_CLIENT_ID: undefined,
      X_CLIENT_SECRET: undefined,
      X_OWNER_USER_ID: undefined,
      X_OWNER_SECRET: undefined,
    },
    () => getXRuntimeConfig(),
  );

  expect(config.ownerUsername).toBe("claycurry__");
  expect(config.mode).toBe("live");
});

test("getXRuntimeConfig enters live mode only when both OAuth credentials are set", () => {
  const config = withEnv(
    {
      X_OWNER_USERNAME: "claycurry__",
      X_CLIENT_ID: "client-id",
      X_CLIENT_SECRET: "client-secret",
      X_OWNER_USER_ID: "owner-1",
      X_OWNER_SECRET: "owner-secret",
    },
    () => getXRuntimeConfig(),
  );

  expect(config.mode).toBe("live");
  expect(config.ownerUsername).toBe("claycurry__");
  expect(config.ownerUserId).toBe("owner-1");
});
