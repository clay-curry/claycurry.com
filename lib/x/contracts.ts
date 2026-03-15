/**
 * Effect Schema definitions for the X API v2 response shapes and internal
 * normalized domain types used throughout the bookmarks integration.
 *
 * Schemas fall into two categories:
 *
 * 1. **X API wire schemas** — mirror the JSON shapes returned by X API v2
 *    endpoints (e.g. `XBookmarksResponseSchema` for
 *    `GET /2/users/:id/bookmarks`). These use snake_case field names to match
 *    the upstream contract.
 *
 * 2. **Normalized domain schemas** — internal camelCase representations
 *    (e.g. `NormalizedBookmarkSchema`) that the rest of the app consumes after
 *    the client layer transforms raw API data.
 *
 * All schemas are built with Effect's `Schema` module for runtime validation
 * and type-safe decoding.
 *
 * @see https://developer.x.com/en/docs/twitter-api/tweets/bookmarks/api-reference
 * @see https://developer.x.com/en/docs/twitter-api/users/lookup/api-reference
 * @see https://effect.website/docs/schema/introduction
 * @module
 */
import { Schema } from "effect";

const IsoDateTimeString = Schema.String.pipe(
  Schema.minLength(1),
  Schema.filter((s) => !Number.isNaN(Date.parse(s)), {
    message: () => "Expected an ISO datetime string",
  }),
);

const NullableIsoDateTimeString = Schema.NullOr(IsoDateTimeString);

/**
 * The identity of the X account whose bookmarks are being synced.
 * Populated during OAuth verification and stored alongside cached snapshots.
 */
export const BookmarkSourceOwnerSchema = Schema.Struct({
  id: Schema.NullOr(Schema.String),
  username: Schema.String.pipe(Schema.minLength(1)),
  name: Schema.NullOr(Schema.String),
});

export type BookmarkSourceOwner = typeof BookmarkSourceOwnerSchema.Type;

/** A media attachment (photo, video, or animated GIF) on a bookmarked tweet. */
export const BookmarkMediaSchema = Schema.Struct({
  type: Schema.Literal("photo", "video", "animated_gif"),
  url: Schema.String,
  width: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())),
  height: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())),
});

/**
 * A bookmark in the app's internal normalized format (camelCase, flattened
 * author/metrics/media). Produced by `XBookmarksClient` after transforming
 * the raw X API v2 tweet + includes expansion.
 */
export const NormalizedBookmarkSchema = Schema.Struct({
  id: Schema.String,
  text: Schema.String,
  createdAt: IsoDateTimeString,
  author: Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    username: Schema.String,
    profileImageUrl: Schema.optional(Schema.String),
    verified: Schema.optional(Schema.Boolean),
  }),
  metrics: Schema.Struct({
    likes: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
    retweets: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
    replies: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
    impressions: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
  }),
  media: Schema.mutable(Schema.Array(BookmarkMediaSchema)),
});

export type NormalizedBookmark = typeof NormalizedBookmarkSchema.Type;

/** A bookmark folder as returned by `GET /2/users/:id/bookmarks/folders`. */
export const XBookmarkFolderSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
});

export type XBookmarkFolder = typeof XBookmarkFolderSchema.Type;

/**
 * Public engagement metrics on a tweet, as returned by the X API v2
 * `tweet.fields=public_metrics` expansion.
 */
export const XPublicMetricsSchema = Schema.Struct({
  like_count: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
  retweet_count: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
  reply_count: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
  impression_count: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
});

/**
 * A media object from the X API v2 `includes.media` expansion,
 * keyed by `media_key` for joining with tweet attachments.
 */
export const XMediaSchema = Schema.Struct({
  media_key: Schema.String,
  type: Schema.Literal("photo", "video", "animated_gif"),
  url: Schema.optional(Schema.String),
  preview_image_url: Schema.optional(Schema.String),
  width: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())),
  height: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())),
});

export type XMedia = typeof XMediaSchema.Type;

/**
 * An X user profile from the `includes.users` expansion or
 * `GET /2/users/me` / `GET /2/users/by/username/:username`.
 *
 * @see https://developer.x.com/en/docs/twitter-api/users/lookup/api-reference
 */
export const XUserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.optional(Schema.String),
  username: Schema.String,
  profile_image_url: Schema.optional(Schema.String),
  verified: Schema.optional(Schema.Boolean),
});

export type XUser = typeof XUserSchema.Type;

/**
 * A single tweet object from the X API v2 `data` array, before
 * normalization. Includes optional `public_metrics` and `attachments`
 * when the corresponding `tweet.fields` / `expansions` are requested.
 */
export const XTweetSchema = Schema.Struct({
  id: Schema.String,
  text: Schema.String,
  created_at: IsoDateTimeString,
  author_id: Schema.String,
  public_metrics: Schema.optional(XPublicMetricsSchema),
  attachments: Schema.optional(
    Schema.Struct({
      media_keys: Schema.optional(Schema.mutable(Schema.Array(Schema.String))),
    }),
  ),
});

export type XTweet = typeof XTweetSchema.Type;

/**
 * Wire schema for `GET /2/users/:id/bookmarks` responses.
 * Contains the `data` array of tweets, `includes` expansions (users, media),
 * and `meta` with pagination info.
 *
 * @see https://developer.x.com/en/docs/twitter-api/tweets/bookmarks/api-reference
 */
export const XBookmarksResponseSchema = Schema.Struct({
  data: Schema.optional(Schema.mutable(Schema.Array(XTweetSchema))),
  includes: Schema.optional(
    Schema.Struct({
      users: Schema.optional(Schema.mutable(Schema.Array(XUserSchema))),
      media: Schema.optional(Schema.mutable(Schema.Array(XMediaSchema))),
    }),
  ),
  meta: Schema.optional(
    Schema.Struct({
      next_token: Schema.optional(Schema.String),
      result_count: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
    }),
  ),
});

/** Wire schema for `GET /2/users/:id/bookmarks/folders` responses. */
export const XBookmarkFoldersResponseSchema = Schema.Struct({
  data: Schema.optional(Schema.mutable(Schema.Array(XBookmarkFolderSchema))),
});

/** Envelope for single-user responses (`GET /2/users/me`, `GET /2/users/by/username/:username`). */
export const XUserEnvelopeSchema = Schema.Struct({
  data: XUserSchema,
});

/**
 * Wire schema for `POST /2/oauth2/token` responses (both authorization code
 * exchange and refresh token grant).
 *
 * @see https://developer.x.com/en/docs/authentication/oauth-2-0/authorization-code
 */
export const XOAuthTokenResponseSchema = Schema.Struct({
  token_type: Schema.String,
  expires_in: Schema.Number.pipe(Schema.int(), Schema.positive()),
  access_token: Schema.String.pipe(Schema.minLength(1)),
  scope: Schema.optional(Schema.String),
  refresh_token: Schema.String.pipe(Schema.minLength(1)),
});

export type XOAuthTokenResponse = typeof XOAuthTokenResponseSchema.Type;

/**
 * The canonical token record persisted in Redis under the v2 keyspace.
 * Includes the access/refresh token pair, expiry, verified owner identity,
 * and audit timestamps.
 */
export const XTokenRecordSchema = Schema.Struct({
  accessToken: Schema.String.pipe(Schema.minLength(1)),
  refreshToken: Schema.String.pipe(Schema.minLength(1)),
  expiresAt: Schema.Number.pipe(Schema.int(), Schema.positive()),
  owner: BookmarkSourceOwnerSchema,
  createdAt: IsoDateTimeString,
  updatedAt: IsoDateTimeString,
  lastRefreshedAt: NullableIsoDateTimeString,
});

export type XTokenRecord = typeof XTokenRecordSchema.Type;

/**
 * Discriminant codes for integration issues. Each code maps 1:1 to a
 * tagged error class in `errors.ts` and drives both API response status
 * fields and the diagnostics UI.
 */
export const IntegrationIssueCodeSchema = Schema.Literal(
  "misconfigured",
  "reauth_required",
  "owner_mismatch",
  "schema_invalid",
  "upstream_error",
  "cache_stale",
);

export type IntegrationIssueCode = typeof IntegrationIssueCodeSchema.Type;

/** A code + human-readable message pair describing a sync problem. */
export const IntegrationIssueSchema = Schema.Struct({
  code: IntegrationIssueCodeSchema,
  message: Schema.String,
});

export type IntegrationIssue = typeof IntegrationIssueSchema.Type;

/** Overall status of a bookmarks API response — drives client-side UI treatment. */
export const BookmarksApiStatusSchema = Schema.Literal(
  "fresh",
  "stale",
  "misconfigured",
  "reauth_required",
  "owner_mismatch",
  "schema_invalid",
  "upstream_error",
);

export type BookmarksApiStatus = typeof BookmarksApiStatusSchema.Type;

/** Health state of the stored OAuth token, used by diagnostics and the status API. */
export const TokenHealthStatusSchema = Schema.Literal(
  "missing",
  "valid",
  "expiring",
  "refresh_failed",
  "owner_mismatch",
  "invalid",
);

export type TokenHealthStatus = typeof TokenHealthStatusSchema.Type;

/**
 * A point-in-time snapshot of bookmarks persisted in Redis. Contains the
 * normalized bookmarks array, folder list, owner identity, and cache
 * metadata. The `source` field distinguishes snapshots created by live
 * sync (`"live"`) from those migrated from the legacy keyspace (`"legacy"`).
 */
export const BookmarksSnapshotRecordSchema = Schema.Struct({
  owner: BookmarkSourceOwnerSchema,
  folderId: Schema.NullOr(Schema.String),
  bookmarks: Schema.mutable(Schema.Array(NormalizedBookmarkSchema)),
  folders: Schema.mutable(Schema.Array(XBookmarkFolderSchema)),
  lastSyncedAt: NullableIsoDateTimeString,
  cachedAt: IsoDateTimeString,
  source: Schema.Literal("live", "legacy"),
});

export type BookmarksSnapshotRecord = typeof BookmarksSnapshotRecordSchema.Type;

/**
 * Persistent sync status record stored alongside the snapshot. Tracks the
 * configured vs. resolved owner, token health, last sync timestamps, and
 * the most recent integration error (if any). Updated on every sync attempt.
 */
export const BookmarksSyncStatusRecordSchema = Schema.Struct({
  configuredOwnerUsername: Schema.String,
  configuredOwnerUserId: Schema.NullOr(Schema.String),
  resolvedOwner: Schema.NullOr(BookmarkSourceOwnerSchema),
  authenticatedOwner: Schema.NullOr(BookmarkSourceOwnerSchema),
  tokenStatus: TokenHealthStatusSchema,
  tokenExpiresAt: NullableIsoDateTimeString,
  lastRefreshedAt: NullableIsoDateTimeString,
  lastSuccessfulSyncAt: NullableIsoDateTimeString,
  lastAttemptedSyncAt: NullableIsoDateTimeString,
  lastError: Schema.NullOr(IntegrationIssueSchema),
});

export type BookmarksSyncStatusRecord =
  typeof BookmarksSyncStatusRecordSchema.Type;

/**
 * The JSON shape returned by `GET /api/x/bookmarks`. This is the public
 * API contract consumed by the frontend — it wraps normalized bookmarks
 * with status, staleness, and error metadata.
 */
export const BookmarksApiResponseSchema = Schema.Struct({
  bookmarks: Schema.mutable(Schema.Array(NormalizedBookmarkSchema)),
  folders: Schema.mutable(Schema.Array(XBookmarkFolderSchema)),
  owner: BookmarkSourceOwnerSchema,
  status: BookmarksApiStatusSchema,
  isStale: Schema.Boolean,
  lastSyncedAt: NullableIsoDateTimeString,
  cachedAt: IsoDateTimeString,
  error: Schema.optional(Schema.String),
});

export type BookmarksApiResponse = typeof BookmarksApiResponseSchema.Type;

/**
 * The JSON shape returned by `GET /api/x/bookmarks/status`. Provides a
 * detailed view of owner identity, token health, and sync state for the
 * debug/diagnostics UI. Requires `X_OWNER_SECRET` authentication.
 */
export const BookmarksStatusApiResponseSchema = Schema.Struct({
  owner: Schema.Struct({
    configuredUsername: Schema.String,
    configuredUserId: Schema.NullOr(Schema.String),
    resolvedOwner: Schema.NullOr(BookmarkSourceOwnerSchema),
    authenticatedOwner: Schema.NullOr(BookmarkSourceOwnerSchema),
  }),
  token: Schema.Struct({
    status: TokenHealthStatusSchema,
    expiresAt: NullableIsoDateTimeString,
    lastRefreshedAt: NullableIsoDateTimeString,
  }),
  sync: Schema.Struct({
    lastAttemptedSyncAt: NullableIsoDateTimeString,
    lastSuccessfulSyncAt: NullableIsoDateTimeString,
    cacheAgeSeconds: Schema.NullOr(
      Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
    ),
    isSnapshotStale: Schema.Boolean,
    lastError: Schema.NullOr(IntegrationIssueSchema),
  }),
});

export type BookmarksStatusApiResponse =
  typeof BookmarksStatusApiResponseSchema.Type;
