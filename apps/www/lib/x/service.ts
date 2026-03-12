import type { BookmarksRepository } from "./cache";
import {
  type NormalizedBookmark,
  type XBookmarkFolder,
  type XBookmarksClient,
  XBookmarksOwnerResolver,
  XIdentityVerifier,
} from "./client";
import type { XLiveRuntimeConfig, XRuntimeConfig } from "./config";
import {
  type BookmarkSourceOwner,
  type BookmarksApiResponse,
  BookmarksApiResponseSchema,
  type BookmarksApiStatus,
  type BookmarksSnapshotRecord,
  BookmarksSnapshotRecordSchema,
  type BookmarksStatusApiResponse,
  BookmarksStatusApiResponseSchema,
  type BookmarksSyncStatusRecord,
  BookmarksSyncStatusRecordSchema,
  type IntegrationIssue,
  type TokenHealthStatus,
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

interface BookmarksSyncServiceOptions {
  config: XRuntimeConfig;
  repository: BookmarksRepository;
  client: XBookmarksClient;
  fetchImpl?: typeof fetch;
}

export class BookmarksSyncService {
  private readonly ownerHint: BookmarkSourceOwner;

  constructor(private readonly options: BookmarksSyncServiceOptions) {
    this.ownerHint = buildOwnerHint(options.config);
  }

  async getBookmarks(folderId?: string): Promise<{
    response: BookmarksApiResponse;
    httpStatus: number;
  }> {
    const snapshot = await this.options.repository.getSnapshot(
      this.ownerHint,
      folderId,
    );
    if (snapshot && this.isSnapshotFresh(snapshot)) {
      return {
        response: this.snapshotToApiResponse(snapshot, "fresh"),
        httpStatus: 200,
      };
    }

    const previousStatus =
      (await this.options.repository.getStatus(
        this.options.config.ownerUsername,
      )) ?? null;
    const context: {
      authenticatedOwner: BookmarkSourceOwner | null;
      resolvedOwner: BookmarkSourceOwner | null;
      tokenExpiresAt: string | null;
      lastRefreshedAt: string | null;
      tokenStatus: TokenHealthStatus;
    } = {
      authenticatedOwner: previousStatus?.authenticatedOwner ?? null,
      resolvedOwner: previousStatus?.resolvedOwner ?? null,
      tokenExpiresAt: previousStatus?.tokenExpiresAt ?? null,
      lastRefreshedAt: previousStatus?.lastRefreshedAt ?? null,
      tokenStatus: previousStatus?.tokenStatus ?? "missing",
    };

    try {
      const liveConfig = this.assertLiveConfig();
      const tokenStore = XTokenStore.fromRuntimeConfig(
        this.options.repository,
        liveConfig,
        this.options.fetchImpl ?? fetch,
      );
      const identityVerifier = new XIdentityVerifier(
        this.options.client,
        liveConfig.ownerUsername,
      );
      const ownerResolver = new XBookmarksOwnerResolver(
        this.options.client,
        liveConfig.ownerUsername,
        liveConfig.ownerUserId,
      );

      const tokenRecord = await tokenStore.getTokenForSync(
        async (accessToken) => {
          const owner = await identityVerifier.verify(accessToken);
          context.authenticatedOwner = owner;
          return owner;
        },
      );

      context.tokenExpiresAt = new Date(tokenRecord.expiresAt).toISOString();
      context.lastRefreshedAt = tokenRecord.lastRefreshedAt;
      context.tokenStatus = deriveTokenHealthFromRecord(tokenRecord.expiresAt);

      const authenticatedOwner = await identityVerifier.verify(
        tokenRecord.accessToken,
      );
      const resolvedOwner = await ownerResolver.resolve(
        tokenRecord.accessToken,
      );
      context.authenticatedOwner = authenticatedOwner;
      context.resolvedOwner = resolvedOwner;

      if (
        resolvedOwner.id &&
        authenticatedOwner.id &&
        resolvedOwner.id !== authenticatedOwner.id
      ) {
        throw xError(
          "owner_mismatch",
          `Resolved owner @${resolvedOwner.username} does not match authenticated owner @${authenticatedOwner.username}`,
          { tokenStatus: "owner_mismatch" },
        );
      }

      const liveOwnerId = resolvedOwner.id ?? authenticatedOwner.id ?? null;
      if (!liveOwnerId) {
        throw xError(
          "schema_invalid",
          "Unable to determine the verified owner id for bookmark sync",
          { tokenStatus: "invalid" },
        );
      }

      const [bookmarks, folders] = await Promise.all([
        folderId
          ? this.options.client.fetchBookmarksByFolder(
              liveOwnerId,
              folderId,
              tokenRecord.accessToken,
            )
          : this.options.client.fetchAllBookmarks(
              liveOwnerId,
              tokenRecord.accessToken,
            ),
        this.options.client.fetchBookmarkFolders(
          liveOwnerId,
          tokenRecord.accessToken,
        ),
      ]);

      const freshSnapshot = this.buildLiveSnapshot(
        resolvedOwner,
        bookmarks,
        folders,
        folderId,
      );
      await this.options.repository.setSnapshot(
        this.options.config.ownerUsername,
        freshSnapshot,
      );

      const statusRecord = this.buildStatusRecord({
        previousStatus,
        authenticatedOwner,
        resolvedOwner,
        tokenStatus: context.tokenStatus,
        tokenExpiresAt: context.tokenExpiresAt,
        lastRefreshedAt: context.lastRefreshedAt,
        lastError: null,
        lastSuccessfulSyncAt: freshSnapshot.lastSyncedAt,
      });
      await this.options.repository.setStatus(
        this.options.config.ownerUsername,
        statusRecord,
      );

      return {
        response: this.snapshotToApiResponse(freshSnapshot, "fresh"),
        httpStatus: 200,
      };
    } catch (error) {
      const normalizedError = toXError(error);
      const issue = toIntegrationIssue(normalizedError);

      if (snapshot) {
        const staleStatus = this.buildStatusRecord({
          previousStatus,
          authenticatedOwner: context.authenticatedOwner,
          resolvedOwner: context.resolvedOwner ?? snapshot.owner,
          tokenStatus:
            normalizedError.tokenStatus ?? context.tokenStatus ?? "missing",
          tokenExpiresAt: context.tokenExpiresAt,
          lastRefreshedAt: context.lastRefreshedAt,
          lastError: buildCacheStaleIssue(issue),
          lastSuccessfulSyncAt:
            snapshot.lastSyncedAt ??
            previousStatus?.lastSuccessfulSyncAt ??
            null,
        });
        await this.options.repository.setStatus(
          this.options.config.ownerUsername,
          staleStatus,
        );

        return {
          response: this.snapshotToApiResponse(
            snapshot,
            "stale",
            issue.message,
          ),
          httpStatus: 200,
        };
      }

      const failureStatus = mapErrorCodeToStatus(normalizedError);
      const statusRecord = this.buildStatusRecord({
        previousStatus,
        authenticatedOwner: context.authenticatedOwner,
        resolvedOwner: context.resolvedOwner,
        tokenStatus:
          normalizedError.tokenStatus ?? context.tokenStatus ?? "missing",
        tokenExpiresAt: context.tokenExpiresAt,
        lastRefreshedAt: context.lastRefreshedAt,
        lastError: issue,
        lastSuccessfulSyncAt: previousStatus?.lastSuccessfulSyncAt ?? null,
      });
      await this.options.repository.setStatus(
        this.options.config.ownerUsername,
        statusRecord,
      );

      return {
        response: BookmarksApiResponseSchema.parse({
          bookmarks: [],
          folders: [],
          owner: context.resolvedOwner ?? this.ownerHint,
          status: failureStatus,
          isStale: false,
          lastSyncedAt: previousStatus?.lastSuccessfulSyncAt ?? null,
          cachedAt: nowIsoString(),
          error: normalizedError.message,
        }),
        httpStatus: mapFailureToHttpStatus(failureStatus),
      };
    }
  }

  async getStatus(): Promise<BookmarksStatusApiResponse> {
    const [snapshot, statusRecord, tokenRecord] = await Promise.all([
      this.options.repository.getSnapshot(this.ownerHint),
      this.options.repository.getStatus(this.options.config.ownerUsername),
      this.options.repository.getTokenRecord(this.options.config.ownerUsername),
    ]);

    return BookmarksStatusApiResponseSchema.parse({
      owner: {
        configuredUsername: this.options.config.ownerUsername,
        configuredUserId: this.options.config.ownerUserId,
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
          tokenRecord?.lastRefreshedAt ?? statusRecord?.lastRefreshedAt ?? null,
      },
      sync: {
        lastAttemptedSyncAt: statusRecord?.lastAttemptedSyncAt ?? null,
        lastSuccessfulSyncAt:
          statusRecord?.lastSuccessfulSyncAt ?? snapshot?.lastSyncedAt ?? null,
        cacheAgeSeconds: snapshot
          ? Math.max(
              0,
              Math.floor((Date.now() - Date.parse(snapshot.cachedAt)) / 1000),
            )
          : null,
        isSnapshotStale: snapshot ? !this.isSnapshotFresh(snapshot) : true,
        lastError: statusRecord?.lastError ?? null,
      },
    });
  }

  private snapshotToApiResponse(
    snapshot: BookmarksSnapshotRecord,
    status: "fresh" | "stale",
    error?: string,
  ): BookmarksApiResponse {
    return BookmarksApiResponseSchema.parse({
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
    return BookmarksSnapshotRecordSchema.parse({
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
    return BookmarksSyncStatusRecordSchema.parse({
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

  private assertLiveConfig(): XLiveRuntimeConfig {
    const { config } = this.options;
    if (!config.clientId || !config.clientSecret) {
      throw xError("upstream_error", "X live credentials are not configured");
    }

    return config as XLiveRuntimeConfig;
  }
}
