import { Effect, Schema } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { keyPrefix, RedisClient } from "@/lib/effect/services/redis";
import { withDebug } from "@/lib/effect/with-debug";
import { BookmarksSnapshotRepository } from "@/lib/x/cache";
import {
  XBookmarksClient,
  XBookmarksOwnerResolver,
  XIdentityVerifier,
} from "@/lib/x/client";
import { assertLiveRuntimeConfig, getXRuntimeConfig } from "@/lib/x/config";
import { BookmarksSyncStatusRecordSchema } from "@/lib/x/contracts";
import { errorCode, toXError } from "@/lib/x/errors";
import { XTokenStore } from "@/lib/x/tokens";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json(
      { error: `OAuth error: ${error}` },
      { status: 400 },
    );
  }

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing code or state" },
      { status: 400 },
    );
  }

  const config = getXRuntimeConfig();
  if (config.mode !== "live") {
    return NextResponse.json(
      { error: "X credentials not configured" },
      { status: 500 },
    );
  }
  assertLiveRuntimeConfig(config);

  const stateKey = `${keyPrefix()}x:oauth:${state}`;
  const callbackUrl = new URL("/api/x/callback", request.url).toString();
  const homeUrl = new URL("/", request.url).toString();

  return withDebug(
    request,
    Effect.gen(function* () {
      // Retrieve + delete code_verifier from Redis
      const redis = yield* RedisClient;
      const codeVerifier = yield* redis.get(stateKey);
      yield* redis.del(stateKey);

      if (!codeVerifier) {
        return NextResponse.json(
          { error: "Invalid or expired state" },
          { status: 400 },
        );
      }

      const repository = new BookmarksSnapshotRepository();
      const xClient = new XBookmarksClient();
      const tokenStore = XTokenStore.fromRuntimeConfig(repository, config);
      const identityVerifier = new XIdentityVerifier(
        xClient,
        config.ownerUsername,
      );
      const ownerResolver = new XBookmarksOwnerResolver(
        xClient,
        config.ownerUsername,
        config.ownerUserId,
      );

      const tokenData = yield* tokenStore.exchangeAuthorizationCode({
        code,
        codeVerifier,
        redirectUri: callbackUrl,
      });
      const authenticatedOwner = yield* identityVerifier.verify(
        tokenData.access_token,
      );
      const resolvedOwner = yield* ownerResolver.resolve(
        tokenData.access_token,
      );

      if (
        authenticatedOwner.id &&
        resolvedOwner.id &&
        authenticatedOwner.id !== resolvedOwner.id
      ) {
        return NextResponse.json(
          {
            error: `Authenticated owner @${authenticatedOwner.username} does not match resolved owner @${resolvedOwner.username}`,
          },
          { status: 403 },
        );
      }

      const tokenRecord = yield* tokenStore.storeVerifiedToken(
        tokenData,
        authenticatedOwner,
      );
      yield* Effect.promise(() =>
        repository.setStatus(
          config.ownerUsername,
          Schema.decodeUnknownSync(BookmarksSyncStatusRecordSchema)({
            configuredOwnerUsername: config.ownerUsername,
            configuredOwnerUserId: config.ownerUserId,
            resolvedOwner,
            authenticatedOwner,
            tokenStatus: "valid",
            tokenExpiresAt: new Date(tokenRecord.expiresAt).toISOString(),
            lastRefreshedAt: tokenRecord.lastRefreshedAt,
            lastSuccessfulSyncAt: null,
            lastAttemptedSyncAt: new Date().toISOString(),
            lastError: null,
          }),
        ),
      );

      return NextResponse.redirect(homeUrl);
    }).pipe(
      Effect.catchTag("RedisError", (err) => {
        console.error("Redis OAuth state retrieval error:", err.message);
        return Effect.succeed(
          NextResponse.json(
            {
              error:
                "Failed to retrieve OAuth state. Redis may be unavailable. Please retry the auth flow.",
            },
            { status: 503 },
          ),
        );
      }),
      Effect.catchAll((error) => {
        const normalized = toXError(error);
        const errCode = errorCode(normalized);
        const status =
          errCode === "owner_mismatch"
            ? 403
            : errCode === "reauth_required"
              ? 400
              : 500;

        return Effect.succeed(
          NextResponse.json({ error: normalized.message }, { status }),
        );
      }),
    ),
  );
}
