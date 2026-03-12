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
import { OwnerMismatch, ReauthRequired, SchemaInvalid, xError } from "./errors";

type VerifyOwner = (accessToken: string) => Promise<BookmarkSourceOwner>;

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

  async getTokenForSync(verifyOwner: VerifyOwner): Promise<XTokenRecord> {
    let record = await this.repository.getTokenRecord(
      this.config.ownerUsername,
    );
    if (!record) {
      record = await this.promoteLegacyTokenIfPossible(verifyOwner);
    }

    if (!record) {
      throw xError(
        "reauth_required",
        "No X tokens stored. Run the OAuth setup flow first.",
        { tokenStatus: "missing" },
      );
    }

    if (
      record.owner.username.toLowerCase() !==
      this.config.ownerUsername.toLowerCase()
    ) {
      await this.repository.deleteTokenRecord(this.config.ownerUsername);
      throw xError(
        "owner_mismatch",
        `Stored token owner @${record.owner.username} does not match required owner @${this.config.ownerUsername}`,
        { tokenStatus: "owner_mismatch" },
      );
    }

    if (record.expiresAt - Date.now() < TOKEN_REFRESH_WINDOW_MS) {
      try {
        record = await this.refreshTokenRecord(record, verifyOwner);
      } catch (error) {
        if (shouldDiscardStoredToken(error)) {
          await this.repository.deleteTokenRecord(this.config.ownerUsername);
        }
        throw error;
      }
    }

    return record;
  }

  async exchangeAuthorizationCode(params: {
    code: string;
    codeVerifier: string;
    redirectUri: string;
  }): Promise<XOAuthTokenResponse> {
    return await this.requestToken("authorization code exchange", {
      grant_type: "authorization_code",
      code: params.code,
      redirect_uri: params.redirectUri,
      code_verifier: params.codeVerifier,
    });
  }

  async storeVerifiedToken(
    tokenResponse: XOAuthTokenResponse,
    owner: BookmarkSourceOwner,
  ): Promise<XTokenRecord> {
    const record = buildTokenRecord(tokenResponse, owner);
    await this.repository.setTokenRecord(this.config.ownerUsername, record);
    return record;
  }

  private async promoteLegacyTokenIfPossible(
    verifyOwner: VerifyOwner,
  ): Promise<XTokenRecord | null> {
    const legacyRecord = await this.repository.getLegacyTokenRecord();
    if (!legacyRecord) {
      return null;
    }

    let tokenResponse: XOAuthTokenResponse;
    try {
      if (legacyRecord.expires_at - Date.now() < TOKEN_REFRESH_WINDOW_MS) {
        tokenResponse = await this.requestToken("legacy token refresh", {
          grant_type: "refresh_token",
          refresh_token: legacyRecord.refresh_token,
        });
      } else {
        tokenResponse = this.legacyRecordToTokenResponse(legacyRecord);
      }

      const owner = await verifyOwner(tokenResponse.access_token);
      const record = buildTokenRecord(tokenResponse, owner);
      await this.repository.setTokenRecord(this.config.ownerUsername, record);
      await this.repository.deleteLegacyTokenRecord();
      return record;
    } catch (error) {
      if (shouldDiscardStoredToken(error)) {
        await this.repository.deleteLegacyTokenRecord();
      }
      throw error;
    }
  }

  private async refreshTokenRecord(
    record: XTokenRecord,
    verifyOwner: VerifyOwner,
  ): Promise<XTokenRecord> {
    const refreshed = await this.requestToken("token refresh", {
      grant_type: "refresh_token",
      refresh_token: record.refreshToken,
    });

    const owner = await verifyOwner(refreshed.access_token);
    const nextRecord = buildTokenRecord(refreshed, owner, record);
    await this.repository.setTokenRecord(this.config.ownerUsername, nextRecord);
    return nextRecord;
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

  private async requestToken(
    context: string,
    body: Record<string, string>,
  ): Promise<XOAuthTokenResponse> {
    const response = await this.fetchImpl("https://api.x.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuthHeader(
          this.config.clientId,
          this.config.clientSecret,
        ),
      },
      body: new URLSearchParams(body),
    });

    if (!response.ok) {
      const payload = await response.text();
      throw xError(
        "reauth_required",
        `${context} failed (${response.status}): ${payload}`,
        { tokenStatus: "refresh_failed" },
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = await response.json();
    } catch (error) {
      throw xError("schema_invalid", `${context} returned non-JSON`, {
        cause: error,
        tokenStatus: "invalid",
      });
    }

    try {
      return XOAuthTokenResponseSchema.parse(parsedJson);
    } catch (error) {
      throw xError(
        "schema_invalid",
        `${context} returned an invalid token payload`,
        {
          cause: error,
          tokenStatus: "invalid",
        },
      );
    }
  }
}
