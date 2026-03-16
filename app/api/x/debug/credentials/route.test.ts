import { expect, test } from "vitest";
import { withEnv } from "@/lib/x/test-utils";
import { GET } from "./route";

test("GET /api/x/debug/credentials never returns raw secret values", async () => {
  const response = await withEnv(
    {
      VERCEL_ENV: "preview",
      X_CLIENT_ID: undefined,
      X_CLIENT_SECRET: undefined,
      X_OAUTH2_CLIENT_ID: "raw-client-id-value",
      X_OAUTH2_CLIENT_SECRET: "raw-client-secret-value",
      X_OWNER_SECRET: "raw-owner-secret-value",
      X_OWNER_USERNAME: "test_user",
    },
    () => GET(),
  );

  const json = JSON.stringify(await response.json());

  expect(response.status).toBe(200);
  expect(json).not.toContain("raw-client-secret-value");
  expect(json).not.toContain("raw-owner-secret-value");
  expect(json).not.toContain("raw-client-id-value");
});

test("GET /api/x/debug/credentials works in production", async () => {
  const response = await withEnv(
    {
      VERCEL_ENV: "production",
      X_OAUTH2_CLIENT_ID: "client-id",
      X_OAUTH2_CLIENT_SECRET: "client-secret",
      X_OWNER_SECRET: "owner-secret",
      X_OWNER_USERNAME: "test_user",
    },
    () => GET(),
  );

  expect(response.status).toBe(200);
  const json = await response.json();
  expect(json.environment.isProduction).toBe(true);
});
