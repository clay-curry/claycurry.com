import { z } from "zod";

const XEnvironmentSchema = z.object({
  X_OWNER_USERNAME: z.string().trim().min(1).default("clay__curry"),
  X_OWNER_USER_ID: z.string().trim().min(1).optional(),
  X_CLIENT_ID: z.string().trim().min(1).optional(),
  X_CLIENT_SECRET: z.string().trim().min(1).optional(),
  X_OWNER_SECRET: z.string().trim().min(1).optional(),
});

export const BOOKMARKS_SNAPSHOT_FRESHNESS_MS = 30 * 60 * 1000;
export const TOKEN_REFRESH_WINDOW_MS = 5 * 60 * 1000;

export interface XRuntimeConfig {
  mode: "live";
  ownerUsername: string;
  ownerUserId: string | null;
  clientId: string | null;
  clientSecret: string | null;
  ownerSecret: string | null;
  snapshotFreshnessMs: number;
}

export interface XLiveRuntimeConfig extends XRuntimeConfig {
  clientId: string;
  clientSecret: string;
}

export function getXRuntimeConfig(): XRuntimeConfig {
  const env = XEnvironmentSchema.parse(process.env);

  return {
    mode: "live",
    ownerUsername: env.X_OWNER_USERNAME,
    ownerUserId: env.X_OWNER_USER_ID ?? null,
    clientId: env.X_CLIENT_ID ?? null,
    clientSecret: env.X_CLIENT_SECRET ?? null,
    ownerSecret: env.X_OWNER_SECRET ?? null,
    snapshotFreshnessMs: BOOKMARKS_SNAPSHOT_FRESHNESS_MS,
  };
}

export function assertLiveRuntimeConfig(
  config: XRuntimeConfig,
): asserts config is XLiveRuntimeConfig {
  if (config.mode !== "live" || !config.clientId || !config.clientSecret) {
    throw new Error("X live credentials are not configured");
  }
}

export function getXOwnerSecret(): string | null {
  return getXRuntimeConfig().ownerSecret;
}
