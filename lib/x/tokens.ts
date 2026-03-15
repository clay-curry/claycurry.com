/**
 * OAuth2 token lifecycle management for the X API.
 *
 * `XTokenStore` handles the full token lifecycle:
 * 1. **Exchange** — trades an authorization code + PKCE verifier for tokens
 *    via `POST /2/oauth2/token` (`grant_type=authorization_code`).
 * 2. **Refresh** — proactively refreshes tokens before they expire using
 *    `grant_type=refresh_token`.
 * 3. **Storage** — persists `XTokenRecord` to Redis via `BookmarksRepo`.
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
import { BookmarksRepo } from "./cache";
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
import { XOAuthTokenResponseSchema, XTokenRecordSchema } from "./contracts";
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
 * Manages OAuth2 token storage, retrieval, and refresh for the X API
 * integration.
 *
 * Tokens are persisted in Redis via the `BookmarksRepo` Effect service
 * (accessed from the Effect context). The class uses HTTP Basic auth
 * (client ID + secret) when communicating with the `POST /2/oauth2/token`
 * endpoint.
 *
 * Use `fromRuntimeConfig()` to construct with config validation, or the
 * constructor directly when validation has already been performed.
 *
 * @see https://developer.x.com/en/docs/authentication/oauth-2-0/authorization-code
 */
export class XTokenStore {
  constructor(
    private readonly config: XLiveRuntimeConfig,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  static fromRuntimeConfig(
    config: XLiveRuntimeConfig,
    fetchImpl: typeof fetch = fetch,
  ): XTokenStore {
    assertLiveRuntimeConfig(config);
    return new XTokenStore(config, fetchImpl);
  }

  /**
   * Retrieves a valid token record for bookmark sync.
   *
   * Resolution order:
   * 1. Look up the token record in Redis.
   * 2. If missing, fail with `ReauthRequired`.
   * 3. Verify owner identity and refresh if within the expiry window.
   */
  getTokenForSync(verifyOwner: VerifyOwner) {
    const config = this.config;
    const self = this;

    return Effect.gen(function* () {
      const repo = yield* BookmarksRepo;
      let record = yield* repo.getTokenRecord(config.ownerUsername);

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
        yield* repo.deleteTokenRecord(config.ownerUsername);
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
              return Effect.gen(function* () {
                const r = yield* BookmarksRepo;
                yield* r.deleteTokenRecord(config.ownerUsername);
              });
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
   * Persists a verified token + owner pair to Redis.
   */
  storeVerifiedToken(
    tokenResponse: XOAuthTokenResponse,
    owner: BookmarkSourceOwner,
  ) {
    const config = this.config;

    return Effect.gen(function* () {
      const repo = yield* BookmarksRepo;
      const record = buildTokenRecord(tokenResponse, owner);
      yield* repo.setTokenRecord(config.ownerUsername, record);
      return record;
    });
  }

  private refreshTokenRecord(record: XTokenRecord, verifyOwner: VerifyOwner) {
    const config = this.config;
    const self = this;

    return Effect.gen(function* () {
      const repo = yield* BookmarksRepo;
      const refreshed = yield* self.requestToken("token refresh", {
        grant_type: "refresh_token",
        refresh_token: record.refreshToken,
      });

      const owner = yield* verifyOwner(refreshed.access_token);
      const nextRecord = buildTokenRecord(refreshed, owner, record);
      yield* repo.setTokenRecord(config.ownerUsername, nextRecord);
      return nextRecord;
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
