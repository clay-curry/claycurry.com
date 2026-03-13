import { Schema } from "effect";

const IsoDateTimeString = Schema.String.pipe(
  Schema.minLength(1),
  Schema.filter((s) => !Number.isNaN(Date.parse(s)), {
    message: () => "Expected an ISO datetime string",
  }),
);

const NullableIsoDateTimeString = Schema.NullOr(IsoDateTimeString);

export const BookmarkSourceOwnerSchema = Schema.Struct({
  id: Schema.NullOr(Schema.String),
  username: Schema.String.pipe(Schema.minLength(1)),
  name: Schema.NullOr(Schema.String),
});

export type BookmarkSourceOwner = typeof BookmarkSourceOwnerSchema.Type;

export const BookmarkMediaSchema = Schema.Struct({
  type: Schema.Literal("photo", "video", "animated_gif"),
  url: Schema.String,
  width: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())),
  height: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())),
});

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

export const XBookmarkFolderSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
});

export type XBookmarkFolder = typeof XBookmarkFolderSchema.Type;

export const XPublicMetricsSchema = Schema.Struct({
  like_count: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
  retweet_count: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
  reply_count: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
  impression_count: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
});

export const XMediaSchema = Schema.Struct({
  media_key: Schema.String,
  type: Schema.Literal("photo", "video", "animated_gif"),
  url: Schema.optional(Schema.String),
  preview_image_url: Schema.optional(Schema.String),
  width: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())),
  height: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())),
});

export type XMedia = typeof XMediaSchema.Type;

export const XUserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.optional(Schema.String),
  username: Schema.String,
  profile_image_url: Schema.optional(Schema.String),
  verified: Schema.optional(Schema.Boolean),
});

export type XUser = typeof XUserSchema.Type;

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

export const XBookmarkFoldersResponseSchema = Schema.Struct({
  data: Schema.optional(Schema.mutable(Schema.Array(XBookmarkFolderSchema))),
});

export const XUserEnvelopeSchema = Schema.Struct({
  data: XUserSchema,
});

export const XOAuthTokenResponseSchema = Schema.Struct({
  token_type: Schema.String,
  expires_in: Schema.Number.pipe(Schema.int(), Schema.positive()),
  access_token: Schema.String.pipe(Schema.minLength(1)),
  scope: Schema.optional(Schema.String),
  refresh_token: Schema.String.pipe(Schema.minLength(1)),
});

export type XOAuthTokenResponse = typeof XOAuthTokenResponseSchema.Type;

export const LegacyStoredTokensSchema = Schema.Struct({
  access_token: Schema.String.pipe(Schema.minLength(1)),
  refresh_token: Schema.String.pipe(Schema.minLength(1)),
  expires_at: Schema.Number.pipe(Schema.int(), Schema.positive()),
});

export type LegacyStoredTokens = typeof LegacyStoredTokensSchema.Type;

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

export const IntegrationIssueCodeSchema = Schema.Literal(
  "misconfigured",
  "reauth_required",
  "owner_mismatch",
  "schema_invalid",
  "upstream_error",
  "cache_stale",
);

export type IntegrationIssueCode = typeof IntegrationIssueCodeSchema.Type;

export const IntegrationIssueSchema = Schema.Struct({
  code: IntegrationIssueCodeSchema,
  message: Schema.String,
});

export type IntegrationIssue = typeof IntegrationIssueSchema.Type;

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

export const TokenHealthStatusSchema = Schema.Literal(
  "missing",
  "valid",
  "expiring",
  "refresh_failed",
  "owner_mismatch",
  "invalid",
);

export type TokenHealthStatus = typeof TokenHealthStatusSchema.Type;

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

/** Standalone sub-schemas for legacy migration in cache.ts */
export const NormalizedBookmarksArraySchema = Schema.mutable(
  Schema.Array(NormalizedBookmarkSchema),
);
export const XBookmarkFoldersArraySchema = Schema.mutable(
  Schema.Array(XBookmarkFolderSchema),
);

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
