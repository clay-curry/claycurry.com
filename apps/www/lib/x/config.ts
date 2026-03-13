import { Schema } from "effect";

const TrimmedNonEmpty = Schema.Trim.pipe(Schema.minLength(1));
const CANONICAL_X_OAUTH_ENV_KEYS = [
  "X_OAUTH2_CLIENT_ID",
  "X_OAUTH2_CLIENT_SECRET",
] as const;
const LEGACY_X_OAUTH_ENV_KEYS = ["X_CLIENT_ID", "X_CLIENT_SECRET"] as const;

const XEnvironmentSchema = Schema.Struct({
  X_OWNER_USERNAME: Schema.optionalWith(TrimmedNonEmpty, {
    default: () => "claycurry__",
  }),
  X_OWNER_USER_ID: Schema.optional(TrimmedNonEmpty),
  X_OAUTH2_CLIENT_ID: Schema.optional(TrimmedNonEmpty),
  X_OAUTH2_CLIENT_SECRET: Schema.optional(TrimmedNonEmpty),
  X_OWNER_SECRET: Schema.optional(TrimmedNonEmpty),
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

export function getMissingCanonicalXOAuthEnvKeys(
  env: Record<string, string | undefined> = process.env,
): string[] {
  return CANONICAL_X_OAUTH_ENV_KEYS.filter(
    (key) => !hasConfiguredValue(env[key]),
  );
}

export function getPresentLegacyXOAuthEnvKeys(
  env: Record<string, string | undefined> = process.env,
): string[] {
  return LEGACY_X_OAUTH_ENV_KEYS.filter((key) => hasConfiguredValue(env[key]));
}

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

export function buildXLiveCredentialsErrorMessage(
  missingKeys: string[],
  options: {
    hasLegacyOauthVars?: boolean;
  } = {},
): string {
  const missingDescription = formatEnvKeyList(missingKeys);
  const legacySuffix = options.hasLegacyOauthVars
    ? " Legacy X_CLIENT_ID/X_CLIENT_SECRET variables are ignored. Rename them to X_OAUTH2_CLIENT_ID/X_OAUTH2_CLIENT_SECRET and restart the dev server."
    : " Add the missing variable values and restart the dev server.";

  return `Live X sync could not start. source=live disables mock fallback, but the server is missing ${missingDescription}.${legacySuffix}`;
}

export function getXLiveCredentialsErrorMessageForEnv(
  env: Record<string, string | undefined> = process.env,
): string | null {
  const missingKeys = getMissingCanonicalXOAuthEnvKeys(env);

  if (missingKeys.length === 0) {
    return null;
  }

  return buildXLiveCredentialsErrorMessage(missingKeys, {
    hasLegacyOauthVars: getPresentLegacyXOAuthEnvKeys(env).length > 0,
  });
}

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

export function assertLiveRuntimeConfig(
  config: XRuntimeConfig,
): asserts config is XLiveRuntimeConfig {
  const missingKeys = getMissingCanonicalXOAuthConfigKeys(config);

  if (config.mode !== "live" || missingKeys.length > 0) {
    throw new Error(
      buildXLiveCredentialsErrorMessage(missingKeys, {
        hasLegacyOauthVars:
          getPresentLegacyXOAuthEnvKeys(process.env).length > 0,
      }),
    );
  }
}

export function getXOwnerSecret(): string | null {
  return getXRuntimeConfig().ownerSecret;
}
