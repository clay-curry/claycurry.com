import { expect, test } from "vitest";
import { withEnv } from "@/lib/x/test-utils";
import { POST } from "./route";

test("POST /api/x/debug/credentials/validate returns a structured misconfigured error when canonical vars are missing", async () => {
  const response = await withEnv(
    {
      VERCEL_ENV: "preview",
      X_CLIENT_ID: "legacy-client-id",
      X_CLIENT_SECRET: "legacy-client-secret",
      X_OAUTH2_CLIENT_ID: undefined,
      X_OAUTH2_CLIENT_SECRET: undefined,
      X_OWNER_SECRET: "raw-owner-secret-value",
      X_OWNER_USERNAME: "test_user",
    },
    () => POST(),
  );

  const json = await response.json();
  const body = JSON.stringify(json);

  expect(response.status).toBe(500);
  expect(json.status).toBe("misconfigured");
  expect(json.message).toContain("X_OAUTH2_CLIENT_ID");
  expect(json.message).toContain("X_OAUTH2_CLIENT_SECRET");
  expect(body).not.toContain("legacy-client-secret");
  expect(body).not.toContain("raw-owner-secret-value");
});

test("POST /api/x/debug/credentials/validate works in production", async () => {
  const response = await withEnv(
    {
      VERCEL_ENV: "production",
      X_OAUTH2_CLIENT_ID: undefined,
      X_OAUTH2_CLIENT_SECRET: undefined,
      X_OWNER_USERNAME: "test_user",
    },
    () => POST(),
  );

  expect(response.status).toBe(500);
  const json = await response.json();
  expect(json.status).toBe("misconfigured");
});
