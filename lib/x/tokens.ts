/**
 * OAuth2 token lifecycle management for the X API.
 *
 * `XTokenStore` handles the full token lifecycle:
 * 1. **Exchange** — trades an authorization code + PKCE verifier for tokens
 *    via `POST /2/oauth2/token` (`grant_type=authorization_code`).
 * 2. **Refresh** — proactively refreshes tokens before they expire using
 *    `grant_type=refresh_token`.
 * 3. **Storage** — persists `XTokenRecord` to Redis via `BookmarksRepository`.
 * 4. **Legacy promotion** — one-time migration of tokens stored under the
 *    old `x:tokens` keyspace to the v2 format.
 *
 * All public methods return `Effect` programs for composable error handling.
 * Token requests use HTTP Basic authentication with the OAuth client
 * credentials.
 *
 * @see https://developer.x.com/en/docs/authentication/oauth-2-0/authorization-code
 * @see https://effect.website/docs/getting-started/using-generators
 * @module
 */
import { Effect, Schema } from "effect";
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
  return Schema.decodeUnknownSync(XTokenRecordSchema)({
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

/**
 * Manages OAuth2 token storage, retrieval, refresh, and legacy migration
 * for the X API integration.
 *
 * Tokens are persisted in Redis via the injected `BookmarksRepository`.
 * The class uses HTTP Basic auth (client ID + secret) when communicating
 * with the `POST /2/oauth2/token` endpoint.
 *
 * Use `fromRuntimeConfig()` to construct with config validation, or the
 * constructor directly when validation has already been performed.
 *
 * @see https://developer.x.com/en/docs/authentication/oauth-2-0/authorization-code
 */
export class XTokenStore {
  constructor(
    private readonly repository: BookmarksRepository,
    private readonly config: XLiveRuntimeConfig,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  /**
   * Factory that asserts the config has live OAuth credentials before
   * constructing the store. Throws if `clientId` or `clientSecret` is missing.
   */
  static fromRuntimeConfig(
    repository: BookmarksRepository,
    config: XLiveRuntimeConfig,
    fetchImpl: typeof fetch = fetch,
  ): XTokenStore {
    assertLiveRuntimeConfig(config);
    return new XTokenStore(repository, config, fetchImpl);
  }

  /**
   * Retrieves a valid token record for bookmark sync.
   *
   * Resolution order:
   * 1. Look up the v2 token record in Redis.
   * 2. If missing, attempt legacy token promotion.
   * 3. If still missing, fail with `ReauthRequired`.
   * 4. Verify owner identity and refresh if within the expiry window.
   *
   * @param verifyOwner - Callback to verify the authenticated user matches
   *   the configured owner. Called during refresh and legacy promotion.
   * @returns Effect yielding a valid `XTokenRecord`.
   */
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

  /**
   * Exchanges an OAuth2 authorization code for an access/refresh token pair.
   * Called from the `/api/x/callback` route after the user completes the
   * X OAuth consent screen.
   *
   * @param params.code - The authorization code from the callback URL.
   * @param params.codeVerifier - The PKCE code verifier generated during auth initiation.
   * @param params.redirectUri - Must match the redirect_uri used in the auth request.
   * @returns Effect yielding an `XOAuthTokenResponse`.
   */
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

  /**
   * Persists a verified token + owner pair to Redis. Called after a
   * successful OAuth exchange and identity verification.
   */
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

  /**
   * One-time migration: reads a legacy `x:tokens` record, refreshes it
   * if needed, verifies the owner, stores it under the v2 keyspace, and
   * deletes the legacy key. Returns `null` if no legacy record exists.
   */
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

  /**
   * Refreshes an expiring token via `grant_type=refresh_token`, verifies
   * the owner on the new token, and persists the updated record.
   */
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
    return Schema.decodeUnknownSync(XOAuthTokenResponseSchema)({
      token_type: "bearer",
      expires_in: Math.max(
        1,
        Math.floor((record.expires_at - Date.now()) / 1000),
      ),
      access_token: record.access_token,
      refresh_token: record.refresh_token,
    });
  }

  /**
   * Low-level token request to `POST /2/oauth2/token`. Used by both
   * authorization code exchange and refresh token grant flows.
   * Authenticates with HTTP Basic (client ID:secret).
   */
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
        try: () =>
          Schema.decodeUnknownSync(XOAuthTokenResponseSchema)(parsedJson),
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
