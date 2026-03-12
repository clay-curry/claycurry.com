import { Effect } from "effect";
import type { BookmarksRepository } from "./cache";
import {
  assertLiveRuntimeConfig,
  TOKEN_REFRESH_WINDOW_MS,
  type XLiveRuntimeConfig,
} from "./config";
import type {
  BookmarkSourceOwner,
  XOAuthTokenResponse,
  XTokenRecord,
} from "./contracts";
import {
  type LegacyStoredTokens,
  XOAuthTokenResponseSchema,
  XTokenRecordSchema,
} from "./contracts";
import {
  OwnerMismatch,
  ReauthRequired,
  SchemaInvalid,
  type XError,
} from "./errors";

type VerifyOwner = (
  accessToken: string,
) => Effect.Effect<BookmarkSourceOwner, XError>;

function basicAuthHeader(clientId: string, clientSecret: string): string {
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

function buildTokenRecord(
  tokenResponse: XOAuthTokenResponse,
  owner: BookmarkSourceOwner,
  previousRecord?: XTokenRecord,
): XTokenRecord {
  const now = new Date().toISOString();
  return XTokenRecordSchema.parse({
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    expiresAt: Date.now() + tokenResponse.expires_in * 1000,
    owner,
    createdAt: previousRecord?.createdAt ?? now,
    updatedAt: now,
    lastRefreshedAt: previousRecord ? now : null,
  });
}

function shouldDiscardStoredToken(error: unknown): boolean {
  return (
    error instanceof ReauthRequired ||
    error instanceof OwnerMismatch ||
    error instanceof SchemaInvalid
  );
}

export class XTokenStore {
  constructor(
    private readonly repository: BookmarksRepository,
    private readonly config: XLiveRuntimeConfig,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  static fromRuntimeConfig(
    repository: BookmarksRepository,
    config: XLiveRuntimeConfig,
    fetchImpl: typeof fetch = fetch,
  ): XTokenStore {
    assertLiveRuntimeConfig(config);
    return new XTokenStore(repository, config, fetchImpl);
  }

  getTokenForSync(verifyOwner: VerifyOwner) {
    const repo = this.repository;
    const config = this.config;
    const self = this;

    return Effect.gen(function* () {
      let record = yield* Effect.promise(() =>
        repo.getTokenRecord(config.ownerUsername),
      );
      if (!record) {
        record = yield* self.promoteLegacyTokenIfPossible(verifyOwner);
      }

      if (!record) {
        return yield* Effect.fail(
          new ReauthRequired({
            message: "No X tokens stored. Run the OAuth setup flow first.",
            tokenStatus: "missing",
          }),
        );
      }

      if (
        record.owner.username.toLowerCase() !==
        config.ownerUsername.toLowerCase()
      ) {
        yield* Effect.promise(() =>
          repo.deleteTokenRecord(config.ownerUsername),
        );
        return yield* Effect.fail(
          new OwnerMismatch({
            message: `Stored token owner @${record.owner.username} does not match required owner @${config.ownerUsername}`,
            tokenStatus: "owner_mismatch",
          }),
        );
      }

      if (record.expiresAt - Date.now() < TOKEN_REFRESH_WINDOW_MS) {
        record = yield* self.refreshTokenRecord(record, verifyOwner).pipe(
          Effect.tapError((error) => {
            if (shouldDiscardStoredToken(error)) {
              return Effect.promise(() =>
                repo.deleteTokenRecord(config.ownerUsername),
              );
            }
            return Effect.void;
          }),
        );
      }

      return record;
    });
  }

  exchangeAuthorizationCode(params: {
    code: string;
    codeVerifier: string;
    redirectUri: string;
  }) {
    return this.requestToken("authorization code exchange", {
      grant_type: "authorization_code",
      code: params.code,
      redirect_uri: params.redirectUri,
      code_verifier: params.codeVerifier,
    });
  }

  storeVerifiedToken(
    tokenResponse: XOAuthTokenResponse,
    owner: BookmarkSourceOwner,
  ) {
    const repo = this.repository;
    const config = this.config;

    return Effect.gen(function* () {
      const record = buildTokenRecord(tokenResponse, owner);
      yield* Effect.promise(() =>
        repo.setTokenRecord(config.ownerUsername, record),
      );
      return record;
    });
  }

  private promoteLegacyTokenIfPossible(verifyOwner: VerifyOwner) {
    const repo = this.repository;
    const config = this.config;
    const self = this;

    return Effect.gen(function* () {
      const legacyRecord = yield* Effect.promise(() =>
        repo.getLegacyTokenRecord(),
      );
      if (!legacyRecord) {
        return null;
      }

      const tokenResponse =
        legacyRecord.expires_at - Date.now() < TOKEN_REFRESH_WINDOW_MS
          ? yield* self.requestToken("legacy token refresh", {
              grant_type: "refresh_token",
              refresh_token: legacyRecord.refresh_token,
            })
          : self.legacyRecordToTokenResponse(legacyRecord);

      const owner = yield* verifyOwner(tokenResponse.access_token);
      const record = buildTokenRecord(tokenResponse, owner);
      yield* Effect.promise(() =>
        repo.setTokenRecord(config.ownerUsername, record),
      );
      yield* Effect.promise(() => repo.deleteLegacyTokenRecord());
      return record;
    }).pipe(
      Effect.tapError((error) => {
        if (shouldDiscardStoredToken(error)) {
          return Effect.promise(() => repo.deleteLegacyTokenRecord());
        }
        return Effect.void;
      }),
    );
  }

  private refreshTokenRecord(record: XTokenRecord, verifyOwner: VerifyOwner) {
    const repo = this.repository;
    const config = this.config;
    const self = this;

    return Effect.gen(function* () {
      const refreshed = yield* self.requestToken("token refresh", {
        grant_type: "refresh_token",
        refresh_token: record.refreshToken,
      });

      const owner = yield* verifyOwner(refreshed.access_token);
      const nextRecord = buildTokenRecord(refreshed, owner, record);
      yield* Effect.promise(() =>
        repo.setTokenRecord(config.ownerUsername, nextRecord),
      );
      return nextRecord;
    });
  }

  private legacyRecordToTokenResponse(
    record: LegacyStoredTokens,
  ): XOAuthTokenResponse {
    return XOAuthTokenResponseSchema.parse({
      token_type: "bearer",
      expires_in: Math.max(
        1,
        Math.floor((record.expires_at - Date.now()) / 1000),
      ),
      access_token: record.access_token,
      refresh_token: record.refresh_token,
    });
  }

  private requestToken(context: string, body: Record<string, string>) {
    const fetchImpl = this.fetchImpl;
    const config = this.config;

    return Effect.gen(function* () {
      const response = yield* Effect.tryPromise({
        try: () =>
          fetchImpl("https://api.x.com/2/oauth2/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: basicAuthHeader(
                config.clientId,
                config.clientSecret,
              ),
            },
            body: new URLSearchParams(body),
          }),
        catch: (error) =>
          new ReauthRequired({
            message: `${context} fetch failed`,
            cause: error,
            tokenStatus: "refresh_failed",
          }),
      });

      if (!response.ok) {
        const payload = yield* Effect.promise(() => response.text());
        return yield* Effect.fail(
          new ReauthRequired({
            message: `${context} failed (${response.status}): ${payload}`,
            tokenStatus: "refresh_failed",
          }),
        );
      }

      const parsedJson = yield* Effect.tryPromise({
        try: () => response.json(),
        catch: (error) =>
          new SchemaInvalid({
            message: `${context} returned non-JSON`,
            cause: error,
            tokenStatus: "invalid",
          }),
      });

      return yield* Effect.try({
        try: () => XOAuthTokenResponseSchema.parse(parsedJson),
        catch: (error) =>
          new SchemaInvalid({
            message: `${context} returned an invalid token payload`,
            cause: error,
            tokenStatus: "invalid",
          }),
      });
    });
  }
}
