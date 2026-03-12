import assert from "node:assert/strict";
import test from "node:test";
import { getXRuntimeConfig } from "./config";

function withEnv<T>(
  overrides: Record<string, string | undefined>,
  run: () => T,
): T {
  const previous = new Map<string, string | undefined>();

  for (const [key, value] of Object.entries(overrides)) {
    previous.set(key, process.env[key]);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    return run();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

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

  assert.equal(config.ownerUsername, "claycurry__");
  assert.equal(config.mode, "live");
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

  assert.equal(config.mode, "live");
  assert.equal(config.ownerUsername, "claycurry__");
  assert.equal(config.ownerUserId, "owner-1");
});
