import { z } from "zod";

function isIsoDateTimeString(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

export const IsoDateTimeStringSchema = z
  .string()
  .min(1)
  .refine(isIsoDateTimeString, "Expected an ISO datetime string");

export const NullableIsoDateTimeStringSchema =
  IsoDateTimeStringSchema.nullable();

export const BookmarkSourceOwnerSchema = z.object({
  id: z.string().nullable(),
  username: z.string().min(1),
  name: z.string().nullable(),
});

export type BookmarkSourceOwner = z.infer<typeof BookmarkSourceOwnerSchema>;

export const BookmarkMediaSchema = z.object({
  type: z.enum(["photo", "video", "animated_gif"]),
  url: z.string(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const NormalizedBookmarkSchema = z.object({
  id: z.string(),
  text: z.string(),
  createdAt: IsoDateTimeStringSchema,
  author: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string(),
    profileImageUrl: z.string().optional(),
    verified: z.boolean().optional(),
  }),
  metrics: z.object({
    likes: z.number().int().nonnegative(),
    retweets: z.number().int().nonnegative(),
    replies: z.number().int().nonnegative(),
    impressions: z.number().int().nonnegative(),
  }),
  media: z.array(BookmarkMediaSchema),
});

export type NormalizedBookmark = z.infer<typeof NormalizedBookmarkSchema>;

export const XBookmarkFolderSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type XBookmarkFolder = z.infer<typeof XBookmarkFolderSchema>;

export const XPublicMetricsSchema = z.object({
  like_count: z.number().int().nonnegative(),
  retweet_count: z.number().int().nonnegative(),
  reply_count: z.number().int().nonnegative(),
  impression_count: z.number().int().nonnegative(),
});

export const XMediaSchema = z.object({
  media_key: z.string(),
  type: z.enum(["photo", "video", "animated_gif"]),
  url: z.string().optional(),
  preview_image_url: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export type XMedia = z.infer<typeof XMediaSchema>;

export const XUserSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  username: z.string(),
  profile_image_url: z.string().optional(),
  verified: z.boolean().optional(),
});

export type XUser = z.infer<typeof XUserSchema>;

export const XTweetSchema = z.object({
  id: z.string(),
  text: z.string(),
  created_at: IsoDateTimeStringSchema,
  author_id: z.string(),
  public_metrics: XPublicMetricsSchema.optional(),
  attachments: z
    .object({
      media_keys: z.array(z.string()).optional(),
    })
    .optional(),
});

export type XTweet = z.infer<typeof XTweetSchema>;

export const XBookmarksResponseSchema = z.object({
  data: z.array(XTweetSchema).optional(),
  includes: z
    .object({
      users: z.array(XUserSchema).optional(),
      media: z.array(XMediaSchema).optional(),
    })
    .optional(),
  meta: z
    .object({
      next_token: z.string().optional(),
      result_count: z.number().int().nonnegative(),
    })
    .optional(),
});

export const XBookmarkFoldersResponseSchema = z.object({
  data: z.array(XBookmarkFolderSchema).optional(),
});

export const XUserEnvelopeSchema = z.object({
  data: XUserSchema,
});

export const XOAuthTokenResponseSchema = z.object({
  token_type: z.string(),
  expires_in: z.number().int().positive(),
  access_token: z.string().min(1),
  scope: z.string().optional(),
  refresh_token: z.string().min(1),
});

export type XOAuthTokenResponse = z.infer<typeof XOAuthTokenResponseSchema>;

export const LegacyStoredTokensSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  expires_at: z.number().int().positive(),
});

export type LegacyStoredTokens = z.infer<typeof LegacyStoredTokensSchema>;

export const XTokenRecordSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresAt: z.number().int().positive(),
  owner: BookmarkSourceOwnerSchema,
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema,
  lastRefreshedAt: NullableIsoDateTimeStringSchema,
});

export type XTokenRecord = z.infer<typeof XTokenRecordSchema>;

export const IntegrationIssueCodeSchema = z.enum([
  "reauth_required",
  "owner_mismatch",
  "schema_invalid",
  "upstream_error",
  "cache_stale",
]);

export type IntegrationIssueCode = z.infer<typeof IntegrationIssueCodeSchema>;

export const IntegrationIssueSchema = z.object({
  code: IntegrationIssueCodeSchema,
  message: z.string(),
});

export type IntegrationIssue = z.infer<typeof IntegrationIssueSchema>;

export const BookmarksApiStatusSchema = z.enum([
  "fresh",
  "stale",
  "reauth_required",
  "owner_mismatch",
  "schema_invalid",
  "upstream_error",
]);

export type BookmarksApiStatus = z.infer<typeof BookmarksApiStatusSchema>;

export const TokenHealthStatusSchema = z.enum([
  "missing",
  "valid",
  "expiring",
  "refresh_failed",
  "owner_mismatch",
  "invalid",
]);

export type TokenHealthStatus = z.infer<typeof TokenHealthStatusSchema>;

export const BookmarksSnapshotRecordSchema = z.object({
  owner: BookmarkSourceOwnerSchema,
  folderId: z.string().nullable(),
  bookmarks: z.array(NormalizedBookmarkSchema),
  folders: z.array(XBookmarkFolderSchema),
  lastSyncedAt: NullableIsoDateTimeStringSchema,
  cachedAt: IsoDateTimeStringSchema,
  source: z.enum(["live", "legacy"]),
});

export type BookmarksSnapshotRecord = z.infer<
  typeof BookmarksSnapshotRecordSchema
>;

export const BookmarksSyncStatusRecordSchema = z.object({
  configuredOwnerUsername: z.string(),
  configuredOwnerUserId: z.string().nullable(),
  resolvedOwner: BookmarkSourceOwnerSchema.nullable(),
  authenticatedOwner: BookmarkSourceOwnerSchema.nullable(),
  tokenStatus: TokenHealthStatusSchema,
  tokenExpiresAt: NullableIsoDateTimeStringSchema,
  lastRefreshedAt: NullableIsoDateTimeStringSchema,
  lastSuccessfulSyncAt: NullableIsoDateTimeStringSchema,
  lastAttemptedSyncAt: NullableIsoDateTimeStringSchema,
  lastError: IntegrationIssueSchema.nullable(),
});

export type BookmarksSyncStatusRecord = z.infer<
  typeof BookmarksSyncStatusRecordSchema
>;

export const BookmarksApiResponseSchema = z.object({
  bookmarks: z.array(NormalizedBookmarkSchema),
  folders: z.array(XBookmarkFolderSchema),
  owner: BookmarkSourceOwnerSchema,
  status: BookmarksApiStatusSchema,
  isStale: z.boolean(),
  lastSyncedAt: NullableIsoDateTimeStringSchema,
  cachedAt: IsoDateTimeStringSchema,
  error: z.string().optional(),
});

export type BookmarksApiResponse = z.infer<typeof BookmarksApiResponseSchema>;

export const BookmarksStatusApiResponseSchema = z.object({
  owner: z.object({
    configuredUsername: z.string(),
    configuredUserId: z.string().nullable(),
    resolvedOwner: BookmarkSourceOwnerSchema.nullable(),
    authenticatedOwner: BookmarkSourceOwnerSchema.nullable(),
  }),
  token: z.object({
    status: TokenHealthStatusSchema,
    expiresAt: NullableIsoDateTimeStringSchema,
    lastRefreshedAt: NullableIsoDateTimeStringSchema,
  }),
  sync: z.object({
    lastAttemptedSyncAt: NullableIsoDateTimeStringSchema,
    lastSuccessfulSyncAt: NullableIsoDateTimeStringSchema,
    cacheAgeSeconds: z.number().int().nonnegative().nullable(),
    isSnapshotStale: z.boolean(),
    lastError: IntegrationIssueSchema.nullable(),
  }),
});

export type BookmarksStatusApiResponse = z.infer<
  typeof BookmarksStatusApiResponseSchema
>;
