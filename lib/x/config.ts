/**
 * X OAuth2 runtime configuration loaded from environment variables.
 *
 * Manages the mapping between environment variable names and the typed
 * `XRuntimeConfig` structure consumed by the rest of the X integration.
 *
 * The two freshness constants control how aggressively the system re-syncs:
 * - `BOOKMARKS_SNAPSHOT_FRESHNESS_MS` (30 min) — how long a cached snapshot is
 *   considered "fresh" before a live re-fetch is attempted.
 * - `TOKEN_REFRESH_WINDOW_MS` (5 min) — how close to expiry a token must be
 *   before a proactive refresh is triggered.
 *
 * @see https://developer.x.com/en/docs/authentication/oauth-2-0/authorization-code
 * @module
 */
import { Schema } from "effect";
import { profileData } from "@/lib/portfolio-data";

const TrimmedNonEmpty = Schema.Trim.pipe(Schema.minLength(1));
const CANONICAL_X_OAUTH_ENV_KEYS = [
  "X_OAUTH2_CLIENT_ID",
  "X_OAUTH2_CLIENT_SECRET",
] as const;

const XEnvironmentSchema = Schema.Struct({
  X_OWNER_USERNAME: Schema.optionalWith(TrimmedNonEmpty, {
    default: () => profileData.xUsername,
  }),
  X_OWNER_USER_ID: Schema.optional(TrimmedNonEmpty),
  X_OAUTH2_CLIENT_ID: Schema.optional(TrimmedNonEmpty),
  X_OAUTH2_CLIENT_SECRET: Schema.optional(TrimmedNonEmpty),
  X_OWNER_SECRET: Schema.optional(TrimmedNonEmpty),
});

/** How long (ms) a cached bookmarks snapshot is considered fresh before live re-fetch (30 minutes). */
export const BOOKMARKS_SNAPSHOT_FRESHNESS_MS = 30 * 60 * 1000;
/** How close to expiry (ms) a token must be before proactive refresh is triggered (5 minutes). */
export const TOKEN_REFRESH_WINDOW_MS = 5 * 60 * 1000;

/**
 * Typed configuration for the X integration, derived from environment
 * variables via `getXRuntimeConfig()`. Nullable fields indicate optional
 * or missing env vars — the system can still run in mock mode without them.
 */
export interface XRuntimeConfig {
  mode: "live";
  ownerUsername: string;
  ownerUserId: string | null;
  clientId: string | null;
  clientSecret: string | null;
  ownerSecret: string | null;
  snapshotFreshnessMs: number;
}

/**
 * Narrowed config guaranteed to have non-null OAuth credentials.
 * Produced by `assertLiveRuntimeConfig()` — required before any live
 * X API calls can be made.
 */
export interface XLiveRuntimeConfig extends XRuntimeConfig {
  clientId: string;
  clientSecret: string;
}

function hasConfiguredValue(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function formatEnvKeyList(keys: string[]): string {
  if (keys.length === 0) {
    return "";
  }

  if (keys.length === 1) {
    return keys[0] ?? "";
  }

  if (keys.length === 2) {
    return `${keys[0]} and ${keys[1]}`;
  }

  return `${keys.slice(0, -1).join(", ")}, and ${keys.at(-1)}`;
}

/**
 * Returns the list of canonical OAuth env var names (`X_OAUTH2_CLIENT_ID`,
 * `X_OAUTH2_CLIENT_SECRET`) that are missing or empty in the given env.
 * @param env - Environment record to check (defaults to `process.env`).
 */
export function getMissingCanonicalXOAuthEnvKeys(
  env: Record<string, string | undefined> = process.env,
): string[] {
  return CANONICAL_X_OAUTH_ENV_KEYS.filter(
    (key) => !hasConfiguredValue(env[key]),
  );
}

/**
 * Like `getMissingCanonicalXOAuthEnvKeys` but checks the already-parsed
 * `XRuntimeConfig` object rather than raw env vars.
 */
export function getMissingCanonicalXOAuthConfigKeys(
  config: Pick<XRuntimeConfig, "clientId" | "clientSecret">,
): string[] {
  const missingKeys: string[] = [];

  if (!hasConfiguredValue(config.clientId)) {
    missingKeys.push("X_OAUTH2_CLIENT_ID");
  }

  if (!hasConfiguredValue(config.clientSecret)) {
    missingKeys.push("X_OAUTH2_CLIENT_SECRET");
  }

  return missingKeys;
}

/**
 * Builds a human-readable error message listing which OAuth env vars are
 * missing.
 * @param missingKeys - Canonical env var names that are not set.
 */
export function buildXLiveCredentialsErrorMessage(
  missingKeys: string[],
): string {
  const missingDescription = formatEnvKeyList(missingKeys);
  return `Live X sync could not start. source=live disables mock fallback, but the server is missing ${missingDescription}. Add the missing variable values and restart the dev server.`;
}

/**
 * Convenience wrapper: checks env vars and returns a credentials error
 * message if any canonical OAuth vars are missing, or `null` if all present.
 */
export function getXLiveCredentialsErrorMessageForEnv(
  env: Record<string, string | undefined> = process.env,
): string | null {
  const missingKeys = getMissingCanonicalXOAuthEnvKeys(env);

  if (missingKeys.length === 0) {
    return null;
  }

  return buildXLiveCredentialsErrorMessage(missingKeys);
}

/**
 * Reads and validates X-related environment variables into a typed
 * `XRuntimeConfig`. Uses Effect `Schema.decodeUnknownSync` for validation.
 * Safe to call in any environment — missing OAuth vars result in `null`
 * fields rather than thrown errors.
 */
export function getXRuntimeConfig(): XRuntimeConfig {
  const env = Schema.decodeUnknownSync(XEnvironmentSchema)(process.env);

  return {
    mode: "live",
    ownerUsername: env.X_OWNER_USERNAME,
    ownerUserId: env.X_OWNER_USER_ID ?? null,
    clientId: env.X_OAUTH2_CLIENT_ID ?? null,
    clientSecret: env.X_OAUTH2_CLIENT_SECRET ?? null,
    ownerSecret: env.X_OWNER_SECRET ?? null,
    snapshotFreshnessMs: BOOKMARKS_SNAPSHOT_FRESHNESS_MS,
  };
}

/**
 * Type-narrowing assertion that throws if the config is missing required
 * OAuth credentials. After this call, `config` is guaranteed to be
 * `XLiveRuntimeConfig` with non-null `clientId` and `clientSecret`.
 * @throws {Error} If canonical OAuth env vars are missing.
 */
export function assertLiveRuntimeConfig(
  config: XRuntimeConfig,
): asserts config is XLiveRuntimeConfig {
  const missingKeys = getMissingCanonicalXOAuthConfigKeys(config);

  if (config.mode !== "live" || missingKeys.length > 0) {
    throw new Error(buildXLiveCredentialsErrorMessage(missingKeys));
  }
}

/**
 * Shortcut to retrieve the `X_OWNER_SECRET` value from the runtime config.
 * Returns `null` if the secret is not configured.
 */
export function getXOwnerSecret(): string | null {
  return getXRuntimeConfig().ownerSecret;
}
