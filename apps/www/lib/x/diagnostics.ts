import { Effect } from "effect";
import { type BookmarksRepository, BookmarksSnapshotRepository } from "./cache";
import {
  XBookmarksClient,
  XBookmarksOwnerResolver,
  XIdentityVerifier,
} from "./client";
import {
  buildXLiveCredentialsErrorMessage,
  getMissingCanonicalXOAuthConfigKeys,
  getPresentLegacyXOAuthEnvKeys,
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
import { XTokenStore } from "./tokens";

type XDebugEnv = Record<string, string | undefined>;

export type XCredentialCheckStatus = "pass" | "warn" | "fail";
export type XCredentialSummaryStatus = "ready" | "warning" | "action_required";
export type XCredentialValidationStatus = "valid" | IntegrationIssueCode;
export type XCredentialVariableSource =
  | "env"
  | "default"
  | "missing"
  | "unset"
  | "ignored_legacy";

export type XCredentialCheck = {
  id: string;
  label: string;
  message: string;
  status: XCredentialCheckStatus;
};

export type XCredentialVariable = {
  detail: string;
  isSecret: boolean;
  key: string;
  present: boolean;
  source: XCredentialVariableSource;
  value: string | null;
};

export type XCredentialDiagnostics = {
  checks: XCredentialCheck[];
  environment: {
    isProduction: boolean;
    nodeEnv: string | null;
    vercelEnv: string | null;
  };
  env: {
    ignoredLegacyOauthKeys: string[];
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

function isDiagnosticsAvailable(env: XDebugEnv = process.env): boolean {
  return env.VERCEL_ENV !== "production";
}

function buildEnvironmentVariables(
  config: XRuntimeConfig,
  env: XDebugEnv,
): XCredentialVariable[] {
  const ignoredLegacyOauthKeys = getPresentLegacyXOAuthEnvKeys(env);

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
      detail: hasConfiguredValue(env.X_OWNER_USERNAME)
        ? "Loaded from the environment."
        : "Using the built-in default owner username.",
      isSecret: false,
      key: "X_OWNER_USERNAME",
      present: true,
      source: hasConfiguredValue(env.X_OWNER_USERNAME) ? "env" : "default",
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
    {
      detail: ignoredLegacyOauthKeys.includes("X_CLIENT_ID")
        ? "Legacy name detected. Ignored by runtime."
        : "Legacy env name is not set.",
      isSecret: false,
      key: "X_CLIENT_ID",
      present: ignoredLegacyOauthKeys.includes("X_CLIENT_ID"),
      source: ignoredLegacyOauthKeys.includes("X_CLIENT_ID")
        ? "ignored_legacy"
        : "unset",
      value: null,
    },
    {
      detail: ignoredLegacyOauthKeys.includes("X_CLIENT_SECRET")
        ? "Legacy name detected. Ignored by runtime."
        : "Legacy env name is not set.",
      isSecret: true,
      key: "X_CLIENT_SECRET",
      present: ignoredLegacyOauthKeys.includes("X_CLIENT_SECRET"),
      source: ignoredLegacyOauthKeys.includes("X_CLIENT_SECRET")
        ? "ignored_legacy"
        : "unset",
      value: null,
    },
  ];
}

function buildEnvironmentSummary(config: XRuntimeConfig, env: XDebugEnv) {
  const missingCanonicalOauthKeys = getMissingCanonicalXOAuthConfigKeys(config);
  const ignoredLegacyOauthKeys = getPresentLegacyXOAuthEnvKeys(env);

  return {
    ignoredLegacyOauthKeys,
    liveSyncMessage:
      missingCanonicalOauthKeys.length > 0
        ? buildXLiveCredentialsErrorMessage(missingCanonicalOauthKeys, {
            hasLegacyOauthVars: ignoredLegacyOauthKeys.length > 0,
          })
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
  } else if (input.env.ignoredLegacyOauthKeys.length > 0) {
    checks.push({
      id: "oauth-env",
      label: "OAuth env",
      message:
        "Canonical OAuth env vars are loaded, but legacy X_CLIENT_ID/X_CLIENT_SECRET values are still present and ignored.",
      status: "warn",
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
    message: "Live X sync looks ready for local validation.",
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
      `Set ${formatEnvKeyList(input.env.missingCanonicalOauthKeys)} in your local env file.`,
    );
  }

  if (input.env.ignoredLegacyOauthKeys.length > 0) {
    nextSteps.add(
      "Rename X_CLIENT_ID/X_CLIENT_SECRET to X_OAUTH2_CLIENT_ID/X_OAUTH2_CLIENT_SECRET and restart the dev server.",
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
  } else if (input.env.ignoredLegacyOauthKeys.length > 0) {
    checks.push({
      id: "oauth-env",
      label: "OAuth env",
      message:
        "Canonical OAuth env vars are loaded, but legacy X_CLIENT_* values are still present and ignored.",
      status: "warn",
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
      `Set ${formatEnvKeyList(input.env.missingCanonicalOauthKeys)} in your local env file.`,
    );
  }

  if (input.env.ignoredLegacyOauthKeys.length > 0) {
    nextSteps.add(
      "Rename X_CLIENT_ID/X_CLIENT_SECRET to X_OAUTH2_CLIENT_ID/X_OAUTH2_CLIENT_SECRET and restart the dev server.",
    );
  }

  if (input.status === "reauth_required" || input.tokenStatus === "missing") {
    nextSteps.add(
      "Run the X OAuth setup flow to store a token before forcing live sync.",
    );
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
      "Request /api/x/bookmarks?source=live to confirm the live sync path and refresh the snapshot.",
    );
  }

  return Array.from(nextSteps);
}

export async function readXCredentialDiagnostics(
  options: { env?: XDebugEnv; repository?: BookmarksRepository } = {},
): Promise<XCredentialDiagnostics> {
  const env = options.env ?? process.env;
  const repository = options.repository ?? new BookmarksSnapshotRepository();
  const config = getXRuntimeConfig();
  const ownerHint = buildOwnerHint(config);

  const [tokenRecord, statusRecord, snapshot] = await Promise.all([
    repository.getTokenRecord(config.ownerUsername),
    repository.getStatus(config.ownerUsername),
    repository.getSnapshot(ownerHint),
  ]);

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
      isProduction: !isDiagnosticsAvailable(env),
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

export async function validateXCredentials(
  options: {
    env?: XDebugEnv;
    fetchImpl?: typeof fetch;
    repository?: BookmarksRepository;
  } = {},
): Promise<XCredentialValidationResult> {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;
  const repository = options.repository ?? new BookmarksSnapshotRepository();
  const config = getXRuntimeConfig();
  const envSummary = buildEnvironmentSummary(config, env);
  const missingCanonicalOauthKeys = getMissingCanonicalXOAuthConfigKeys(config);

  if (missingCanonicalOauthKeys.length > 0) {
    const message = buildXLiveCredentialsErrorMessage(
      missingCanonicalOauthKeys,
      {
        hasLegacyOauthVars: envSummary.ignoredLegacyOauthKeys.length > 0,
      },
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
  const tokenStore = XTokenStore.fromRuntimeConfig(
    repository,
    liveConfig,
    fetchImpl,
  );

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
      }),
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
