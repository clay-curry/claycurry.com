import { expect, test } from "vitest";
import {
  readXCredentialDiagnostics,
  validateXCredentials,
} from "./diagnostics";
import {
  createTokenRecord,
  makeTestBookmarksRepo,
  withEnv,
} from "./test-utils";

test("readXCredentialDiagnostics passes the canonical OAuth env check when X_OAUTH2_* vars are present", async () => {
  const { layer } = makeTestBookmarksRepo();
  const diagnostics = await withEnv(
    {
      X_CLIENT_ID: undefined,
      X_CLIENT_SECRET: undefined,
      X_OAUTH2_CLIENT_ID: "client-id",
      X_OAUTH2_CLIENT_SECRET: "client-secret",
      X_OWNER_SECRET: "owner-secret",
      X_OWNER_USER_ID: undefined,
      X_OWNER_USERNAME: "test_user",
    },
    () => readXCredentialDiagnostics({ repoLayer: layer }),
  );

  expect(diagnostics.env.missingCanonicalOauthKeys).toEqual([]);
  expect(
    diagnostics.checks.find((check) => check.id === "oauth-env")?.status,
  ).toBe("pass");
});

test("readXCredentialDiagnostics enumerates the exact missing canonical OAuth key", async () => {
  const { layer } = makeTestBookmarksRepo();
  const diagnostics = await withEnv(
    {
      X_CLIENT_ID: undefined,
      X_CLIENT_SECRET: undefined,
      X_OAUTH2_CLIENT_ID: "client-id",
      X_OAUTH2_CLIENT_SECRET: undefined,
      X_OWNER_SECRET: "owner-secret",
      X_OWNER_USER_ID: undefined,
      X_OWNER_USERNAME: "test_user",
    },
    () => readXCredentialDiagnostics({ repoLayer: layer }),
  );

  expect(diagnostics.env.missingCanonicalOauthKeys).toEqual([
    "X_OAUTH2_CLIENT_SECRET",
  ]);
  expect(diagnostics.env.liveSyncMessage).toContain("X_OAUTH2_CLIENT_SECRET");
  expect(diagnostics.env.liveSyncMessage).not.toContain(
    "X_OAUTH2_CLIENT_ID and",
  );
});

test("readXCredentialDiagnostics flags a missing owner secret separately from OAuth credentials", async () => {
  const { layer } = makeTestBookmarksRepo();
  const diagnostics = await withEnv(
    {
      X_CLIENT_ID: undefined,
      X_CLIENT_SECRET: undefined,
      X_OAUTH2_CLIENT_ID: "client-id",
      X_OAUTH2_CLIENT_SECRET: "client-secret",
      X_OWNER_SECRET: undefined,
      X_OWNER_USER_ID: undefined,
      X_OWNER_USERNAME: "test_user",
    },
    () => readXCredentialDiagnostics({ repoLayer: layer }),
  );

  expect(
    diagnostics.checks.find((check) => check.id === "owner-secret")?.status,
  ).toBe("fail");
  expect(
    diagnostics.checks.find((check) => check.id === "oauth-env")?.status,
  ).toBe("pass");
});

test("validateXCredentials returns reauth_required when no stored token exists", async () => {
  const { layer } = makeTestBookmarksRepo();
  const result = await withEnv(
    {
      X_CLIENT_ID: undefined,
      X_CLIENT_SECRET: undefined,
      X_OAUTH2_CLIENT_ID: "client-id",
      X_OAUTH2_CLIENT_SECRET: "client-secret",
      X_OWNER_SECRET: "owner-secret",
      X_OWNER_USER_ID: undefined,
      X_OWNER_USERNAME: "test_user",
    },
    () => validateXCredentials({ repoLayer: layer }),
  );

  expect(result.ok).toBe(false);
  expect(result.status).toBe("reauth_required");
  expect(result.message).toMatch(/oauth setup flow/i);
});

test("validateXCredentials returns owner_mismatch when the stored token resolves to another account", async () => {
  const { state, layer } = makeTestBookmarksRepo();
  state.tokenRecord = createTokenRecord(Date.now() + 60 * 60 * 1000);

  const fetchImpl: typeof fetch = async (input) => {
    const url = String(input);

    if (url.endsWith("/2/users/me")) {
      return new Response(
        JSON.stringify({
          data: {
            id: "owner-2",
            name: "Wrong Account",
            username: "wrong_account",
          },
        }),
        {
          headers: { "content-type": "application/json" },
          status: 200,
        },
      );
    }

    if (url.includes("/2/users/by/username/")) {
      return new Response(
        JSON.stringify({
          data: {
            id: "owner-1",
            name: "Test User",
            username: "test_user",
          },
        }),
        {
          headers: { "content-type": "application/json" },
          status: 200,
        },
      );
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const result = await withEnv(
    {
      X_CLIENT_ID: undefined,
      X_CLIENT_SECRET: undefined,
      X_OAUTH2_CLIENT_ID: "client-id",
      X_OAUTH2_CLIENT_SECRET: "client-secret",
      X_OWNER_SECRET: "owner-secret",
      X_OWNER_USER_ID: undefined,
      X_OWNER_USERNAME: "test_user",
    },
    () => validateXCredentials({ fetchImpl, repoLayer: layer }),
  );

  expect(result.ok).toBe(false);
  expect(result.status).toBe("owner_mismatch");
  expect(result.message).toMatch(/does not match required owner/i);
});
