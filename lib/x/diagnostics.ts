/**
 * Credential diagnostics and live validation for the X integration.
 *
 * Provides two main entry points:
 * - `readXCredentialDiagnostics()` — passive read of env vars, stored tokens,
 *   snapshots, and status records to produce a checklist of credential health.
 * - `validateXCredentials()` — active validation that actually retrieves and
 *   refreshes tokens, hits the X API to verify owner identity, and reports
 *   detailed results.
 *
 * Both functions power the `/api/x/debug/credentials` endpoints and are
 * safe for production use — secret values are never included in the output.
 *
 * @module
 */
import { Effect, type Layer } from "effect";
import { BookmarksRepo } from "./cache";
import {
  XBookmarksClient,
  XBookmarksOwnerResolver,
  XIdentityVerifier,
} from "./client";
import {
  buildXLiveCredentialsErrorMessage,
  getMissingCanonicalXOAuthConfigKeys,
  getXRuntimeConfig,
  type XLiveRuntimeConfig,
  type XRuntimeConfig,
} from "./config";
import type {
  BookmarkSourceOwner,
  BookmarksSnapshotRecord,
  BookmarksSyncStatusRecord,
  IntegrationIssue,
  IntegrationIssueCode,
  TokenHealthStatus,
  XTokenRecord,
} from "./contracts";
import { errorCode, toXError, xError } from "./errors";
import { BookmarksRepoLayer } from "./runtime";
import { XTokenStore } from "./tokens";

type XDebugEnv = Record<string, string | undefined>;

/** Result status of a single credential check (e.g. "OAuth env", "Stored token"). */
export type XCredentialCheckStatus = "pass" | "warn" | "fail";
/** Overall summary status across all passive diagnostics checks. */
export type XCredentialSummaryStatus = "ready" | "warning" | "action_required";
/** Result of an active validation attempt — either `"valid"` or a specific issue code. */
export type XCredentialValidationStatus = "valid" | IntegrationIssueCode;
export type XCredentialVariableSource = "env" | "missing" | "unset";

/** A single pass/warn/fail check in the diagnostics checklist. */
export type XCredentialCheck = {
  id: string;
  label: string;
  message: string;
  status: XCredentialCheckStatus;
};

/** Describes an environment variable's presence, source, and detail. */
export type XCredentialVariable = {
  detail: string;
  isSecret: boolean;
  key: string;
  present: boolean;
  source: XCredentialVariableSource;
  value: string | null;
};

/** Full passive diagnostics report — env vars, runtime state, checks, and next steps. */
export type XCredentialDiagnostics = {
  checks: XCredentialCheck[];
  environment: {
    isProduction: boolean;
    nodeEnv: string | null;
    vercelEnv: string | null;
  };
  env: {
    liveSyncMessage: string | null;
    missingCanonicalOauthKeys: string[];
    variables: XCredentialVariable[];
  };
  generatedAt: string;
  nextSteps: string[];
  runtime: {
    authenticatedOwner: BookmarkSourceOwner | null;
    cacheAgeSeconds: number | null;
    configuredUserId: string | null;
    configuredUsername: string;
    lastAttemptedSyncAt: string | null;
    lastError: IntegrationIssue | null;
    lastRefreshedAt: string | null;
    lastSuccessfulSyncAt: string | null;
    resolvedOwner: BookmarkSourceOwner | null;
    snapshotCachedAt: string | null;
    snapshotFresh: boolean | null;
    snapshotLastSyncedAt: string | null;
    snapshotPresent: boolean;
    snapshotSource: BookmarksSnapshotRecord["source"] | null;
    statusRecordPresent: boolean;
    tokenExpiresAt: string | null;
    tokenRecordPresent: boolean;
    tokenStatus: TokenHealthStatus;
  };
  summary: {
    message: string;
    status: XCredentialSummaryStatus;
  };
};

/** Result of an active live validation of X credentials against the API. */
export type XCredentialValidationResult = {
  checkedAt: string;
  checks: XCredentialCheck[];
  message: string;
  nextSteps: string[];
  ok: boolean;
  owner: {
    authenticatedOwner: BookmarkSourceOwner | null;
    configuredUserId: string | null;
    configuredUsername: string;
    resolvedOwner: BookmarkSourceOwner | null;
  };
  status: XCredentialValidationStatus;
  token: {
    expiresAt: string | null;
    lastRefreshedAt: string | null;
    present: boolean;
    status: TokenHealthStatus;
  };
};

function hasConfiguredValue(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function nowIsoString(): string {
  return new Date().toISOString();
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

function isSnapshotFresh(
  snapshot: BookmarksSnapshotRecord | null,
  config: XRuntimeConfig,
): boolean | null {
  if (!snapshot) {
    return null;
  }

  if (!snapshot.lastSyncedAt) {
    return false;
  }

  return (
    Date.now() - Date.parse(snapshot.lastSyncedAt) < config.snapshotFreshnessMs
  );
}

function deriveTokenHealthFromRecord(
  expiresAt: number | null,
): TokenHealthStatus {
  if (!expiresAt) {
    return "missing";
  }

  if (expiresAt <= Date.now()) {
    return "expiring";
  }

  return expiresAt - Date.now() <= 5 * 60 * 1000 ? "expiring" : "valid";
}

function buildOwnerHint(config: XRuntimeConfig): BookmarkSourceOwner {
  return {
    id: config.ownerUserId,
    username: config.ownerUsername,
    name: null,
  };
}

function isProductionEnvironment(env: XDebugEnv = process.env): boolean {
  return env.VERCEL_ENV === "production";
}

function buildEnvironmentVariables(
  config: XRuntimeConfig,
  env: XDebugEnv,
): XCredentialVariable[] {
  return [
    {
      detail: hasConfiguredValue(env.X_OAUTH2_CLIENT_ID)
        ? "Loaded from the canonical OAuth env name."
        : "Required for live OAuth token exchange and refresh.",
      isSecret: false,
      key: "X_OAUTH2_CLIENT_ID",
      present: hasConfiguredValue(env.X_OAUTH2_CLIENT_ID),
      source: hasConfiguredValue(env.X_OAUTH2_CLIENT_ID) ? "env" : "missing",
      value: null,
    },
    {
      detail: hasConfiguredValue(env.X_OAUTH2_CLIENT_SECRET)
        ? "Loaded from the canonical OAuth env name."
        : "Required for live OAuth token exchange and refresh.",
      isSecret: true,
      key: "X_OAUTH2_CLIENT_SECRET",
      present: hasConfiguredValue(env.X_OAUTH2_CLIENT_SECRET),
      source: hasConfiguredValue(env.X_OAUTH2_CLIENT_SECRET)
        ? "env"
        : "missing",
      value: null,
    },
    {
      detail: hasConfiguredValue(env.X_OWNER_SECRET)
        ? "Loaded and ready for owner-only debug routes."
        : "Required for /api/x/auth and /api/x/bookmarks/status.",
      isSecret: true,
      key: "X_OWNER_SECRET",
      present: hasConfiguredValue(env.X_OWNER_SECRET),
      source: hasConfiguredValue(env.X_OWNER_SECRET) ? "env" : "missing",
      value: null,
    },
    {
      detail: "Required. The X username whose bookmarks are synced.",
      isSecret: false,
      key: "X_OWNER_USERNAME",
      present: hasConfiguredValue(env.X_OWNER_USERNAME),
      source: hasConfiguredValue(env.X_OWNER_USERNAME) ? "env" : "missing",
      value: config.ownerUsername,
    },
    {
      detail: hasConfiguredValue(env.X_OWNER_USER_ID)
        ? "Optional compatibility value used to double-check the resolved owner."
        : "Optional compatibility value. Safe to leave unset.",
      isSecret: false,
      key: "X_OWNER_USER_ID",
      present: hasConfiguredValue(env.X_OWNER_USER_ID),
      source: hasConfiguredValue(env.X_OWNER_USER_ID) ? "env" : "unset",
      value: config.ownerUserId,
    },
  ];
}

function buildEnvironmentSummary(config: XRuntimeConfig, env: XDebugEnv) {
  const missingCanonicalOauthKeys = getMissingCanonicalXOAuthConfigKeys(config);

  return {
    liveSyncMessage:
      missingCanonicalOauthKeys.length > 0
        ? buildXLiveCredentialsErrorMessage(missingCanonicalOauthKeys)
        : null,
    missingCanonicalOauthKeys,
    variables: buildEnvironmentVariables(config, env),
  };
}

function buildRuntimeSummary(
  config: XRuntimeConfig,
  snapshot: BookmarksSnapshotRecord | null,
  statusRecord: BookmarksSyncStatusRecord | null,
  tokenRecord: XTokenRecord | null,
) {
  return {
    authenticatedOwner:
      statusRecord?.authenticatedOwner ?? tokenRecord?.owner ?? null,
    cacheAgeSeconds: snapshot
      ? Math.max(
          0,
          Math.floor((Date.now() - Date.parse(snapshot.cachedAt)) / 1000),
        )
      : null,
    configuredUserId: config.ownerUserId,
    configuredUsername: config.ownerUsername,
    lastAttemptedSyncAt: statusRecord?.lastAttemptedSyncAt ?? null,
    lastError: statusRecord?.lastError ?? null,
    lastRefreshedAt:
      tokenRecord?.lastRefreshedAt ?? statusRecord?.lastRefreshedAt ?? null,
    lastSuccessfulSyncAt:
      statusRecord?.lastSuccessfulSyncAt ?? snapshot?.lastSyncedAt ?? null,
    resolvedOwner: statusRecord?.resolvedOwner ?? snapshot?.owner ?? null,
    snapshotCachedAt: snapshot?.cachedAt ?? null,
    snapshotFresh: isSnapshotFresh(snapshot, config),
    snapshotLastSyncedAt: snapshot?.lastSyncedAt ?? null,
    snapshotPresent: snapshot !== null,
    snapshotSource: snapshot?.source ?? null,
    statusRecordPresent: statusRecord !== null,
    tokenExpiresAt: tokenRecord
      ? new Date(tokenRecord.expiresAt).toISOString()
      : (statusRecord?.tokenExpiresAt ?? null),
    tokenRecordPresent: tokenRecord !== null,
    tokenStatus:
      statusRecord?.tokenStatus ??
      deriveTokenHealthFromRecord(tokenRecord?.expiresAt ?? null),
  };
}

function buildPassiveChecks(input: {
  config: XRuntimeConfig;
  env: ReturnType<typeof buildEnvironmentSummary>;
  runtime: ReturnType<typeof buildRuntimeSummary>;
}): XCredentialCheck[] {
  const checks: XCredentialCheck[] = [];

  if (input.env.missingCanonicalOauthKeys.length > 0) {
    checks.push({
      id: "oauth-env",
      label: "OAuth env",
      message:
        input.env.liveSyncMessage ??
        "Live X sync is missing canonical OAuth env vars.",
      status: "fail",
    });
  } else {
    checks.push({
      id: "oauth-env",
      label: "OAuth env",
      message: "Canonical OAuth env vars are loaded for live X sync.",
      status: "pass",
    });
  }

  const ownerSecret = input.env.variables.find(
    (variable) => variable.key === "X_OWNER_SECRET",
  );

  checks.push(
    ownerSecret?.present
      ? {
          id: "owner-secret",
          label: "Owner secret",
          message: "X_OWNER_SECRET is configured for owner-only debug routes.",
          status: "pass",
        }
      : {
          id: "owner-secret",
          label: "Owner secret",
          message:
            "X_OWNER_SECRET is missing. /api/x/auth and /api/x/bookmarks/status remain unavailable until it is set.",
          status: "fail",
        },
  );

  switch (input.runtime.tokenStatus) {
    case "valid":
      checks.push({
        id: "stored-token",
        label: "Stored token",
        message: "A stored X token is available for live validation.",
        status: "pass",
      });
      break;
    case "expiring":
      checks.push({
        id: "stored-token",
        label: "Stored token",
        message:
          "A stored X token exists but is expired or close to expiry. Live validation may trigger a refresh.",
        status: "warn",
      });
      break;
    case "missing":
      checks.push({
        id: "stored-token",
        label: "Stored token",
        message:
          "No X token is stored yet. Run the OAuth setup flow after env vars are configured.",
        status: "fail",
      });
      break;
    case "refresh_failed":
    case "invalid":
    case "owner_mismatch":
      checks.push({
        id: "stored-token",
        label: "Stored token",
        message:
          input.runtime.lastError?.message ??
          "Stored X auth is not healthy enough for live sync.",
        status: "fail",
      });
      break;
  }

  if (
    input.runtime.lastError?.code === "owner_mismatch" ||
    input.runtime.tokenStatus === "owner_mismatch"
  ) {
    checks.push({
      id: "owner-identity",
      label: "Owner identity",
      message:
        input.runtime.lastError?.message ?? "Stored token owner mismatch.",
      status: "fail",
    });
  } else if (
    input.runtime.authenticatedOwner &&
    input.runtime.resolvedOwner &&
    (!input.runtime.authenticatedOwner.id ||
      !input.runtime.resolvedOwner.id ||
      input.runtime.authenticatedOwner.id === input.runtime.resolvedOwner.id)
  ) {
    checks.push({
      id: "owner-identity",
      label: "Owner identity",
      message: `Configured owner @${input.config.ownerUsername} matches the latest resolved/authenticated owner state.`,
      status: "pass",
    });
  } else {
    checks.push({
      id: "owner-identity",
      label: "Owner identity",
      message:
        "Owner identity has not been verified in the current runtime yet.",
      status: "warn",
    });
  }

  if (input.runtime.snapshotPresent && input.runtime.snapshotFresh === true) {
    checks.push({
      id: "snapshot",
      label: "Snapshot cache",
      message:
        "A fresh bookmarks snapshot is available for fallback rendering.",
      status: "pass",
    });
  } else if (input.runtime.snapshotPresent) {
    checks.push({
      id: "snapshot",
      label: "Snapshot cache",
      message:
        "A bookmarks snapshot exists, but it is stale or has never been fully synced.",
      status: "warn",
    });
  } else {
    checks.push({
      id: "snapshot",
      label: "Snapshot cache",
      message:
        "No bookmarks snapshot is stored yet. The first successful live sync will create one.",
      status: "warn",
    });
  }

  return checks;
}

function buildSummary(
  checks: XCredentialCheck[],
): XCredentialDiagnostics["summary"] {
  const failedCheck = checks.find((check) => check.status === "fail");
  if (failedCheck) {
    return {
      message: failedCheck.message,
      status: "action_required",
    };
  }

  const warningCheck = checks.find((check) => check.status === "warn");
  if (warningCheck) {
    return {
      message: warningCheck.message,
      status: "warning",
    };
  }

  return {
    message: "Live X sync looks ready for validation.",
    status: "ready",
  };
}

function buildPassiveNextSteps(input: {
  config: XRuntimeConfig;
  env: ReturnType<typeof buildEnvironmentSummary>;
  runtime: ReturnType<typeof buildRuntimeSummary>;
}): string[] {
  const nextSteps = new Set<string>();

  if (input.env.missingCanonicalOauthKeys.length > 0) {
    nextSteps.add(
      `Set ${formatEnvKeyList(input.env.missingCanonicalOauthKeys)} in the environment.`,
    );
  }

  const ownerSecret = input.env.variables.find(
    (variable) => variable.key === "X_OWNER_SECRET",
  );
  if (!ownerSecret?.present) {
    nextSteps.add(
      "Set X_OWNER_SECRET to unlock the OAuth bootstrap and owner-only status routes.",
    );
  }

  if (input.runtime.tokenStatus === "missing") {
    nextSteps.add(
      "Run the X OAuth setup flow to store a token for the configured owner.",
    );
  }

  if (
    input.runtime.tokenStatus === "refresh_failed" ||
    input.runtime.tokenStatus === "invalid" ||
    input.runtime.lastError?.code === "reauth_required"
  ) {
    nextSteps.add(
      "Re-run the X OAuth setup flow to replace the current token.",
    );
  }

  if (
    input.runtime.tokenStatus === "owner_mismatch" ||
    input.runtime.lastError?.code === "owner_mismatch"
  ) {
    nextSteps.add(
      `Repeat OAuth while signed in as @${input.config.ownerUsername} so the stored token matches the configured owner.`,
    );
  }

  if (
    input.runtime.tokenStatus === "valid" &&
    !input.runtime.snapshotPresent &&
    input.env.missingCanonicalOauthKeys.length === 0
  ) {
    nextSteps.add(
      "After validation passes, request /api/x/bookmarks?source=live once to create the first live snapshot.",
    );
  }

  return Array.from(nextSteps);
}

function buildValidationChecks(input: {
  config: XRuntimeConfig;
  env: ReturnType<typeof buildEnvironmentSummary>;
  errorCode?: IntegrationIssueCode;
  message: string;
  status: XCredentialValidationStatus;
  tokenStatus: TokenHealthStatus;
  authenticatedOwner: BookmarkSourceOwner | null;
  resolvedOwner: BookmarkSourceOwner | null;
}): XCredentialCheck[] {
  const checks: XCredentialCheck[] = [];

  if (input.env.missingCanonicalOauthKeys.length > 0) {
    checks.push({
      id: "oauth-env",
      label: "OAuth env",
      message:
        input.env.liveSyncMessage ??
        "Canonical OAuth env vars are missing for live validation.",
      status: "fail",
    });
  } else {
    checks.push({
      id: "oauth-env",
      label: "OAuth env",
      message: "Canonical OAuth env vars are loaded for live validation.",
      status: "pass",
    });
  }

  const ownerSecret = input.env.variables.find(
    (variable) => variable.key === "X_OWNER_SECRET",
  );
  checks.push(
    ownerSecret?.present
      ? {
          id: "owner-secret",
          label: "Owner secret",
          message: "X_OWNER_SECRET is configured.",
          status: "pass",
        }
      : {
          id: "owner-secret",
          label: "Owner secret",
          message:
            "X_OWNER_SECRET is still missing. Validation can run, but the OAuth bootstrap route remains blocked.",
          status: "warn",
        },
  );

  if (input.status === "valid") {
    checks.push({
      id: "stored-token",
      label: "Stored token",
      message: "Stored token loaded successfully for live validation.",
      status: "pass",
    });
    checks.push({
      id: "owner-identity",
      label: "Owner identity",
      message: `Authenticated owner matches configured owner @${input.config.ownerUsername}.`,
      status: "pass",
    });
    return checks;
  }

  if (input.status === "misconfigured") {
    checks.push({
      id: "stored-token",
      label: "Stored token",
      message:
        "Validation stopped before token lookup because canonical OAuth env vars are missing.",
      status: "warn",
    });
    checks.push({
      id: "owner-identity",
      label: "Owner identity",
      message: "Owner identity validation did not run.",
      status: "warn",
    });
    return checks;
  }

  if (input.errorCode === "owner_mismatch") {
    checks.push({
      id: "stored-token",
      label: "Stored token",
      message: "Stored token loaded, but owner identity verification failed.",
      status: "pass",
    });
    checks.push({
      id: "owner-identity",
      label: "Owner identity",
      message: input.message,
      status: "fail",
    });
    return checks;
  }

  checks.push({
    id: "stored-token",
    label: "Stored token",
    message: input.message,
    status:
      input.tokenStatus === "expiring" && input.errorCode !== "reauth_required"
        ? "warn"
        : "fail",
  });
  checks.push({
    id: "owner-identity",
    label: "Owner identity",
    message:
      input.authenticatedOwner || input.resolvedOwner
        ? "Owner verification did not complete."
        : "Owner identity validation did not run.",
    status: "warn",
  });

  return checks;
}

function buildValidationNextSteps(input: {
  config: XRuntimeConfig;
  env: ReturnType<typeof buildEnvironmentSummary>;
  status: XCredentialValidationStatus;
  tokenStatus: TokenHealthStatus;
}): string[] {
  const nextSteps = new Set<string>();

  if (input.env.missingCanonicalOauthKeys.length > 0) {
    nextSteps.add(
      `Set ${formatEnvKeyList(input.env.missingCanonicalOauthKeys)} in the environment.`,
    );
  }

  if (input.status === "reauth_required" || input.tokenStatus === "missing") {
    nextSteps.add("Run the X OAuth setup flow to store a token.");
  }

  if (
    input.status === "owner_mismatch" ||
    input.tokenStatus === "owner_mismatch"
  ) {
    nextSteps.add(
      `Repeat OAuth while signed in as @${input.config.ownerUsername} so the stored token matches the configured owner.`,
    );
  }

  if (input.status === "valid") {
    nextSteps.add(
      "Request /api/x/bookmarks to confirm the sync path and refresh the snapshot.",
    );
  }

  return Array.from(nextSteps);
}

/**
 * Passive diagnostics: reads env vars, Redis state (tokens, snapshots,
 * status), and produces a structured report with checks, summaries, and
 * actionable next steps. Does not make any X API calls.
 *
 * @param options.env - Environment record override (defaults to `process.env`).
 * @param options.repoLayer - Layer override for testing (defaults to `BookmarksRepoLayer`).
 */
export async function readXCredentialDiagnostics(
  options: { env?: XDebugEnv; repoLayer?: Layer.Layer<BookmarksRepo> } = {},
): Promise<XCredentialDiagnostics> {
  const env = options.env ?? process.env;
  const layer = options.repoLayer ?? BookmarksRepoLayer;
  const config = getXRuntimeConfig();
  const ownerHint = buildOwnerHint(config);

  const [tokenRecord, statusRecord, snapshot] = await Effect.runPromise(
    Effect.gen(function* () {
      const repo = yield* BookmarksRepo;
      return yield* Effect.all(
        [
          repo.getTokenRecord(config.ownerUsername),
          repo.getStatus(config.ownerUsername),
          repo.getSnapshot(ownerHint),
        ],
        { concurrency: 3 },
      );
    }).pipe(Effect.provide(layer)),
  );

  const envSummary = buildEnvironmentSummary(config, env);
  const runtime = buildRuntimeSummary(
    config,
    snapshot,
    statusRecord,
    tokenRecord,
  );
  const checks = buildPassiveChecks({
    config,
    env: envSummary,
    runtime,
  });

  return {
    checks,
    environment: {
      isProduction: isProductionEnvironment(env),
      nodeEnv: env.NODE_ENV ?? null,
      vercelEnv: env.VERCEL_ENV ?? null,
    },
    env: envSummary,
    generatedAt: nowIsoString(),
    nextSteps: buildPassiveNextSteps({
      config,
      env: envSummary,
      runtime,
    }),
    runtime,
    summary: buildSummary(checks),
  };
}

/**
 * Active validation: actually retrieves/refreshes the stored token, calls
 * the X API to verify owner identity, and returns a structured result with
 * pass/fail checks and next steps. This makes real API calls and may
 * trigger token refresh side effects.
 *
 * @param options.env - Environment record override (defaults to `process.env`).
 * @param options.fetchImpl - Custom fetch for testing.
 * @param options.repoLayer - Layer override for testing (defaults to `BookmarksRepoLayer`).
 */
export async function validateXCredentials(
  options: {
    env?: XDebugEnv;
    fetchImpl?: typeof fetch;
    repoLayer?: Layer.Layer<BookmarksRepo>;
  } = {},
): Promise<XCredentialValidationResult> {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;
  const layer = options.repoLayer ?? BookmarksRepoLayer;
  const config = getXRuntimeConfig();
  const envSummary = buildEnvironmentSummary(config, env);
  const missingCanonicalOauthKeys = getMissingCanonicalXOAuthConfigKeys(config);

  if (missingCanonicalOauthKeys.length > 0) {
    const message = buildXLiveCredentialsErrorMessage(
      missingCanonicalOauthKeys,
    );

    return {
      checkedAt: nowIsoString(),
      checks: buildValidationChecks({
        authenticatedOwner: null,
        config,
        env: envSummary,
        message,
        resolvedOwner: null,
        status: "misconfigured",
        tokenStatus: "missing",
      }),
      message,
      nextSteps: buildValidationNextSteps({
        config,
        env: envSummary,
        status: "misconfigured",
        tokenStatus: "missing",
      }),
      ok: false,
      owner: {
        authenticatedOwner: null,
        configuredUserId: config.ownerUserId,
        configuredUsername: config.ownerUsername,
        resolvedOwner: null,
      },
      status: "misconfigured",
      token: {
        expiresAt: null,
        lastRefreshedAt: null,
        present: false,
        status: "missing",
      },
    };
  }

  const liveConfig = config as XLiveRuntimeConfig;
  const client = new XBookmarksClient(fetchImpl);
  const identityVerifier = new XIdentityVerifier(
    client,
    liveConfig.ownerUsername,
  );
  const ownerResolver = new XBookmarksOwnerResolver(
    client,
    liveConfig.ownerUsername,
    liveConfig.ownerUserId,
  );
  const tokenStore = XTokenStore.fromRuntimeConfig(liveConfig, fetchImpl);

  let tokenRecord: XTokenRecord | null = null;
  let authenticatedOwner: BookmarkSourceOwner | null = null;
  let resolvedOwner: BookmarkSourceOwner | null = null;

  const validation = await Effect.runPromise(
    Effect.either(
      Effect.gen(function* () {
        tokenRecord = yield* tokenStore.getTokenForSync((accessToken) =>
          identityVerifier.verify(accessToken).pipe(
            Effect.tap((owner) =>
              Effect.sync(() => {
                authenticatedOwner = owner;
              }),
            ),
          ),
        );

        authenticatedOwner = yield* identityVerifier.verify(
          tokenRecord.accessToken,
        );
        resolvedOwner = yield* ownerResolver.resolve(tokenRecord.accessToken);

        if (
          resolvedOwner.id &&
          authenticatedOwner.id &&
          resolvedOwner.id !== authenticatedOwner.id
        ) {
          return yield* Effect.fail(
            xError(
              "owner_mismatch",
              `Resolved owner @${resolvedOwner.username} does not match authenticated owner @${authenticatedOwner.username}`,
              { tokenStatus: "owner_mismatch" },
            ),
          );
        }

        return tokenRecord;
      }).pipe(Effect.provide(layer)),
    ),
  );

  if (validation._tag === "Right") {
    const validatedTokenRecord = validation.right as XTokenRecord;
    tokenRecord = validatedTokenRecord;

    const checks = buildValidationChecks({
      authenticatedOwner,
      config,
      env: envSummary,
      message:
        "Validated canonical OAuth env vars, stored token, and owner identity against X.",
      resolvedOwner,
      status: "valid",
      tokenStatus: deriveTokenHealthFromRecord(validatedTokenRecord.expiresAt),
    });

    return {
      checkedAt: nowIsoString(),
      checks,
      message:
        "Validated canonical OAuth env vars, stored token, and owner identity against X.",
      nextSteps: buildValidationNextSteps({
        config,
        env: envSummary,
        status: "valid",
        tokenStatus: deriveTokenHealthFromRecord(
          validatedTokenRecord.expiresAt,
        ),
      }),
      ok: true,
      owner: {
        authenticatedOwner,
        configuredUserId: config.ownerUserId,
        configuredUsername: config.ownerUsername,
        resolvedOwner,
      },
      status: "valid",
      token: {
        expiresAt: new Date(validatedTokenRecord.expiresAt).toISOString(),
        lastRefreshedAt: validatedTokenRecord.lastRefreshedAt,
        present: true,
        status: deriveTokenHealthFromRecord(validatedTokenRecord.expiresAt),
      },
    };
  }

  const normalized = toXError(validation.left);
  const recordedToken = tokenRecord as XTokenRecord | null;
  const tokenStatus =
    normalized.tokenStatus ??
    deriveTokenHealthFromRecord(recordedToken ? recordedToken.expiresAt : null);
  const status = errorCode(normalized);
  const checks = buildValidationChecks({
    authenticatedOwner,
    config,
    env: envSummary,
    errorCode: status,
    message: normalized.message,
    resolvedOwner,
    status,
    tokenStatus,
  });

  return {
    checkedAt: nowIsoString(),
    checks,
    message: normalized.message,
    nextSteps: buildValidationNextSteps({
      config,
      env: envSummary,
      status,
      tokenStatus,
    }),
    ok: false,
    owner: {
      authenticatedOwner,
      configuredUserId: config.ownerUserId,
      configuredUsername: config.ownerUsername,
      resolvedOwner,
    },
    status,
    token: {
      expiresAt: recordedToken
        ? new Date(recordedToken.expiresAt).toISOString()
        : null,
      lastRefreshedAt: recordedToken?.lastRefreshedAt ?? null,
      present: recordedToken !== null,
      status: tokenStatus,
    },
  };
}

/** Maps a validation result status to an appropriate HTTP status code. */
export function getValidationHttpStatus(
  result: XCredentialValidationResult,
): number {
  switch (result.status) {
    case "valid":
      return 200;
    case "misconfigured":
      return 500;
    case "reauth_required":
      return 503;
    case "owner_mismatch":
      return 409;
    case "schema_invalid":
    case "upstream_error":
      return 502;
    case "cache_stale":
      return 500;
  }
}
