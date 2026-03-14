import { Effect, Schema } from "effect";
import type { BookmarksRepository } from "./cache";
import {
  type XBookmarksClient,
  XBookmarksOwnerResolver,
  XIdentityVerifier,
} from "./client";
import {
  buildXLiveCredentialsErrorMessage,
  getMissingCanonicalXOAuthConfigKeys,
  type XLiveRuntimeConfig,
  type XRuntimeConfig,
} from "./config";
import {
  type BookmarkSourceOwner,
  type BookmarksApiResponse,
  BookmarksApiResponseSchema,
  type BookmarksApiStatus,
  type BookmarksSnapshotRecord,
  BookmarksSnapshotRecordSchema,
  BookmarksStatusApiResponseSchema,
  type BookmarksSyncStatusRecord,
  BookmarksSyncStatusRecordSchema,
  type IntegrationIssue,
  type NormalizedBookmark,
  type TokenHealthStatus,
  type XBookmarkFolder,
} from "./contracts";
import {
  errorCode,
  toIntegrationIssue,
  toXError,
  type XError,
  xError,
} from "./errors";
import { XTokenStore } from "./tokens";

function nowIsoString(): string {
  return new Date().toISOString();
}

function buildOwnerHint(config: XRuntimeConfig): BookmarkSourceOwner {
  return {
    id: config.ownerUserId,
    username: config.ownerUsername,
    name: null,
  };
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

  const minutesRemaining = expiresAt - Date.now();
  return minutesRemaining <= 5 * 60 * 1000 ? "expiring" : "valid";
}

function mapFailureToHttpStatus(status: BookmarksApiStatus): number {
  switch (status) {
    case "misconfigured":
      return 500;
    case "reauth_required":
      return 503;
    case "owner_mismatch":
      return 409;
    case "schema_invalid":
    case "upstream_error":
      return 502;
    default:
      return 500;
  }
}

function mapErrorCodeToStatus(error: XError): BookmarksApiStatus {
  const code = errorCode(error);
  switch (code) {
    case "misconfigured":
    case "reauth_required":
    case "owner_mismatch":
    case "schema_invalid":
    case "upstream_error":
      return code;
    case "cache_stale":
      return "stale";
    default:
      return "upstream_error";
  }
}

function buildCacheStaleIssue(issue: IntegrationIssue): IntegrationIssue {
  return {
    code: "cache_stale",
    message: `Serving stale snapshot because live sync failed: ${issue.message}`,
  };
}

interface SyncContext {
  authenticatedOwner: BookmarkSourceOwner | null;
  resolvedOwner: BookmarkSourceOwner | null;
  tokenExpiresAt: string | null;
  lastRefreshedAt: string | null;
  tokenStatus: TokenHealthStatus;
}

interface BookmarksSyncServiceOptions {
  config: XRuntimeConfig;
  repository: BookmarksRepository;
  client: XBookmarksClient;
  fetchImpl?: typeof fetch;
  fallbackResponse?: (folderId?: string) => BookmarksApiResponse;
}

interface GetBookmarksOptions {
  forceLive?: boolean;
}

export class BookmarksSyncService {
  private readonly ownerHint: BookmarkSourceOwner;

  constructor(private readonly options: BookmarksSyncServiceOptions) {
    this.ownerHint = buildOwnerHint(options.config);
  }

  getBookmarks(folderId?: string, options: GetBookmarksOptions = {}) {
    const opts = this.options;
    const self = this;

    return Effect.gen(function* () {
      const snapshot = yield* Effect.promise(() =>
        opts.repository.getSnapshot(self.ownerHint, folderId),
      );
      if (snapshot && self.isSnapshotFresh(snapshot) && !options.forceLive) {
        return {
          response: self.snapshotToApiResponse(snapshot, "fresh"),
          httpStatus: 200,
        };
      }

      const previousStatus =
        (yield* Effect.promise(() =>
          opts.repository.getStatus(opts.config.ownerUsername),
        )) ?? null;

      const ctx: SyncContext = {
        authenticatedOwner: previousStatus?.authenticatedOwner ?? null,
        resolvedOwner: previousStatus?.resolvedOwner ?? null,
        tokenExpiresAt: previousStatus?.tokenExpiresAt ?? null,
        lastRefreshedAt: previousStatus?.lastRefreshedAt ?? null,
        tokenStatus: previousStatus?.tokenStatus ?? "missing",
      };

      return yield* self
        .liveSync(folderId, previousStatus, ctx)
        .pipe(
          Effect.catchAll((error) =>
            self.recoverFromSyncFailure(
              toXError(error),
              folderId,
              snapshot,
              previousStatus,
              ctx,
            ),
          ),
        );
    });
  }

  getStatus() {
    const opts = this.options;
    const self = this;

    return Effect.gen(function* () {
      const [snapshot, statusRecord, tokenRecord] = yield* Effect.all(
        [
          Effect.promise(() => opts.repository.getSnapshot(self.ownerHint)),
          Effect.promise(() =>
            opts.repository.getStatus(opts.config.ownerUsername),
          ),
          Effect.promise(() =>
            opts.repository.getTokenRecord(opts.config.ownerUsername),
          ),
        ],
        { concurrency: 3 },
      );

      return Schema.decodeUnknownSync(BookmarksStatusApiResponseSchema)({
        owner: {
          configuredUsername: opts.config.ownerUsername,
          configuredUserId: opts.config.ownerUserId,
          resolvedOwner: statusRecord?.resolvedOwner ?? snapshot?.owner ?? null,
          authenticatedOwner:
            statusRecord?.authenticatedOwner ?? tokenRecord?.owner ?? null,
        },
        token: {
          status:
            statusRecord?.tokenStatus ??
            deriveTokenHealthFromRecord(tokenRecord?.expiresAt ?? null),
          expiresAt: tokenRecord
            ? new Date(tokenRecord.expiresAt).toISOString()
            : (statusRecord?.tokenExpiresAt ?? null),
          lastRefreshedAt:
            tokenRecord?.lastRefreshedAt ??
            statusRecord?.lastRefreshedAt ??
            null,
        },
        sync: {
          lastAttemptedSyncAt: statusRecord?.lastAttemptedSyncAt ?? null,
          lastSuccessfulSyncAt:
            statusRecord?.lastSuccessfulSyncAt ??
            snapshot?.lastSyncedAt ??
            null,
          cacheAgeSeconds: snapshot
            ? Math.max(
                0,
                Math.floor((Date.now() - Date.parse(snapshot.cachedAt)) / 1000),
              )
            : null,
          isSnapshotStale: snapshot ? !self.isSnapshotFresh(snapshot) : true,
          lastError: statusRecord?.lastError ?? null,
        },
      });
    });
  }

  private liveSync(
    folderId: string | undefined,
    previousStatus: BookmarksSyncStatusRecord | null,
    ctx: SyncContext,
  ) {
    const opts = this.options;
    const self = this;

    return Effect.gen(function* () {
      const liveConfig = yield* self.assertLiveConfig();
      const tokenStore = XTokenStore.fromRuntimeConfig(
        opts.repository,
        liveConfig,
        opts.fetchImpl ?? fetch,
      );
      const identityVerifier = new XIdentityVerifier(
        opts.client,
        liveConfig.ownerUsername,
      );
      const ownerResolver = new XBookmarksOwnerResolver(
        opts.client,
        liveConfig.ownerUsername,
        liveConfig.ownerUserId,
      );

      const tokenRecord = yield* tokenStore.getTokenForSync((accessToken) =>
        identityVerifier.verify(accessToken).pipe(
          Effect.tap((owner) =>
            Effect.sync(() => {
              ctx.authenticatedOwner = owner;
            }),
          ),
        ),
      );

      ctx.tokenExpiresAt = new Date(tokenRecord.expiresAt).toISOString();
      ctx.lastRefreshedAt = tokenRecord.lastRefreshedAt;
      ctx.tokenStatus = deriveTokenHealthFromRecord(tokenRecord.expiresAt);

      const authenticatedOwner = yield* identityVerifier.verify(
        tokenRecord.accessToken,
      );
      const resolvedOwner = yield* ownerResolver.resolve(
        tokenRecord.accessToken,
      );
      ctx.authenticatedOwner = authenticatedOwner;
      ctx.resolvedOwner = resolvedOwner;

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

      const liveOwnerId = resolvedOwner.id ?? authenticatedOwner.id ?? null;
      if (!liveOwnerId) {
        return yield* Effect.fail(
          xError(
            "schema_invalid",
            "Unable to determine the verified owner id for bookmark sync",
            { tokenStatus: "invalid" },
          ),
        );
      }

      const [bookmarks, folders] = yield* Effect.all(
        [
          folderId
            ? opts.client.fetchBookmarksByFolder(
                liveOwnerId,
                folderId,
                tokenRecord.accessToken,
              )
            : opts.client.fetchAllBookmarks(
                liveOwnerId,
                tokenRecord.accessToken,
              ),
          opts.client.fetchBookmarkFolders(
            liveOwnerId,
            tokenRecord.accessToken,
          ),
        ],
        { concurrency: 2 },
      );

      const freshSnapshot = self.buildLiveSnapshot(
        resolvedOwner,
        bookmarks,
        folders,
        folderId,
      );
      yield* Effect.promise(() =>
        opts.repository.setSnapshot(opts.config.ownerUsername, freshSnapshot),
      );

      const statusRecord = self.buildStatusRecord({
        previousStatus,
        authenticatedOwner,
        resolvedOwner,
        tokenStatus: ctx.tokenStatus,
        tokenExpiresAt: ctx.tokenExpiresAt,
        lastRefreshedAt: ctx.lastRefreshedAt,
        lastError: null,
        lastSuccessfulSyncAt: freshSnapshot.lastSyncedAt,
      });
      yield* Effect.promise(() =>
        opts.repository.setStatus(opts.config.ownerUsername, statusRecord),
      );

      return {
        response: self.snapshotToApiResponse(freshSnapshot, "fresh"),
        httpStatus: 200,
      };
    });
  }

  private recoverFromSyncFailure(
    error: XError,
    folderId: string | undefined,
    snapshot: BookmarksSnapshotRecord | null,
    previousStatus: BookmarksSyncStatusRecord | null,
    ctx: SyncContext,
  ) {
    const opts = this.options;
    const self = this;

    return Effect.gen(function* () {
      const issue = toIntegrationIssue(error);

      if (snapshot) {
        const staleStatus = self.buildStatusRecord({
          previousStatus,
          authenticatedOwner: ctx.authenticatedOwner,
          resolvedOwner: ctx.resolvedOwner ?? snapshot.owner,
          tokenStatus: error.tokenStatus ?? ctx.tokenStatus ?? "missing",
          tokenExpiresAt: ctx.tokenExpiresAt,
          lastRefreshedAt: ctx.lastRefreshedAt,
          lastError: buildCacheStaleIssue(issue),
          lastSuccessfulSyncAt:
            snapshot.lastSyncedAt ??
            previousStatus?.lastSuccessfulSyncAt ??
            null,
        });
        yield* Effect.promise(() =>
          opts.repository.setStatus(opts.config.ownerUsername, staleStatus),
        );

        return {
          response: self.snapshotToApiResponse(
            snapshot,
            "stale",
            issue.message,
          ),
          httpStatus: 200,
        };
      }

      const failureStatus = mapErrorCodeToStatus(error);
      const statusRecord = self.buildStatusRecord({
        previousStatus,
        authenticatedOwner: ctx.authenticatedOwner,
        resolvedOwner: ctx.resolvedOwner,
        tokenStatus: error.tokenStatus ?? ctx.tokenStatus ?? "missing",
        tokenExpiresAt: ctx.tokenExpiresAt,
        lastRefreshedAt: ctx.lastRefreshedAt,
        lastError: issue,
        lastSuccessfulSyncAt: previousStatus?.lastSuccessfulSyncAt ?? null,
      });
      yield* Effect.promise(() =>
        opts.repository.setStatus(opts.config.ownerUsername, statusRecord),
      );

      if (opts.fallbackResponse) {
        return {
          response: opts.fallbackResponse(folderId),
          httpStatus: 200,
        };
      }

      return {
        response: Schema.decodeUnknownSync(BookmarksApiResponseSchema)({
          bookmarks: [],
          folders: [],
          owner: ctx.resolvedOwner ?? self.ownerHint,
          status: failureStatus,
          isStale: false,
          lastSyncedAt: previousStatus?.lastSuccessfulSyncAt ?? null,
          cachedAt: nowIsoString(),
          error: error.message,
        }),
        httpStatus: mapFailureToHttpStatus(failureStatus),
      };
    });
  }

  private snapshotToApiResponse(
    snapshot: BookmarksSnapshotRecord,
    status: "fresh" | "stale",
    error?: string,
  ): BookmarksApiResponse {
    return Schema.decodeUnknownSync(BookmarksApiResponseSchema)({
      bookmarks: snapshot.bookmarks,
      folders: snapshot.folders,
      owner: snapshot.owner,
      status,
      isStale: status === "stale",
      lastSyncedAt: snapshot.lastSyncedAt,
      cachedAt: snapshot.cachedAt,
      error,
    });
  }

  private buildLiveSnapshot(
    owner: BookmarkSourceOwner,
    bookmarks: NormalizedBookmark[],
    folders: XBookmarkFolder[],
    folderId?: string,
  ): BookmarksSnapshotRecord {
    const timestamp = nowIsoString();
    return Schema.decodeUnknownSync(BookmarksSnapshotRecordSchema)({
      owner,
      folderId: folderId ?? null,
      bookmarks,
      folders,
      lastSyncedAt: timestamp,
      cachedAt: timestamp,
      source: "live",
    });
  }

  private buildStatusRecord(input: {
    previousStatus: BookmarksSyncStatusRecord | null;
    authenticatedOwner: BookmarkSourceOwner | null;
    resolvedOwner: BookmarkSourceOwner | null;
    tokenStatus: TokenHealthStatus;
    tokenExpiresAt: string | null;
    lastRefreshedAt: string | null;
    lastError: IntegrationIssue | null;
    lastSuccessfulSyncAt: string | null;
  }): BookmarksSyncStatusRecord {
    return Schema.decodeUnknownSync(BookmarksSyncStatusRecordSchema)({
      configuredOwnerUsername: this.options.config.ownerUsername,
      configuredOwnerUserId: this.options.config.ownerUserId,
      resolvedOwner:
        input.resolvedOwner ?? input.previousStatus?.resolvedOwner ?? null,
      authenticatedOwner:
        input.authenticatedOwner ??
        input.previousStatus?.authenticatedOwner ??
        null,
      tokenStatus: input.tokenStatus,
      tokenExpiresAt:
        input.tokenExpiresAt ?? input.previousStatus?.tokenExpiresAt ?? null,
      lastRefreshedAt:
        input.lastRefreshedAt ?? input.previousStatus?.lastRefreshedAt ?? null,
      lastSuccessfulSyncAt:
        input.lastSuccessfulSyncAt ??
        input.previousStatus?.lastSuccessfulSyncAt ??
        null,
      lastAttemptedSyncAt: nowIsoString(),
      lastError: input.lastError,
    });
  }

  private isSnapshotFresh(snapshot: BookmarksSnapshotRecord): boolean {
    if (!snapshot.lastSyncedAt) {
      return false;
    }

    return (
      Date.now() - Date.parse(snapshot.lastSyncedAt) <
      this.options.config.snapshotFreshnessMs
    );
  }

  private assertLiveConfig() {
    const { config } = this.options;
    const missingKeys = getMissingCanonicalXOAuthConfigKeys(config);

    if (missingKeys.length > 0) {
      return Effect.fail(
        xError("misconfigured", buildXLiveCredentialsErrorMessage(missingKeys)),
      );
    }
    return Effect.succeed(config as XLiveRuntimeConfig);
  }
}
