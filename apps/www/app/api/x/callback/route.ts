import { type NextRequest, NextResponse } from "next/server";
import { getRedisClient, keyPrefix } from "@/lib/redis";
import { BookmarksSnapshotRepository } from "@/lib/x/cache";
import {
  XBookmarksClient,
  XBookmarksOwnerResolver,
  XIdentityVerifier,
} from "@/lib/x/client";
import { assertLiveRuntimeConfig, getXRuntimeConfig } from "@/lib/x/config";
import { BookmarksSyncStatusRecordSchema } from "@/lib/x/contracts";
import { toIntegrationError } from "@/lib/x/errors";
import { oauthStateStore, XTokenStore } from "@/lib/x/tokens";

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

  // Retrieve code_verifier from Redis or in-memory fallback
  let codeVerifier: string | null = null;
  const redisClient = await getRedisClient();
  if (redisClient) {
    const stateKey = `${keyPrefix()}x:oauth:${state}`;
    codeVerifier = await redisClient.get(stateKey);
    await redisClient.del(stateKey);
  } else {
    codeVerifier = oauthStateStore.get(state) ?? null;
    oauthStateStore.delete(state);
  }

  if (!codeVerifier) {
    return NextResponse.json(
      { error: "Invalid or expired state" },
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

  const callbackUrl = new URL("/api/x/callback", request.url).toString();
  const repository = new BookmarksSnapshotRepository();
  const xClient = new XBookmarksClient();
  const tokenStore = XTokenStore.fromRuntimeConfig(repository, config);
  const identityVerifier = new XIdentityVerifier(xClient, config.ownerUsername);
  const ownerResolver = new XBookmarksOwnerResolver(
    xClient,
    config.ownerUsername,
    config.ownerUserId,
  );

  try {
    const tokenData = await tokenStore.exchangeAuthorizationCode({
      code,
      codeVerifier,
      redirectUri: callbackUrl,
    });
    const authenticatedOwner = await identityVerifier.verify(
      tokenData.access_token,
    );
    const resolvedOwner = await ownerResolver.resolve(tokenData.access_token);

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

    const tokenRecord = await tokenStore.storeVerifiedToken(
      tokenData,
      authenticatedOwner,
    );
    await repository.setStatus(
      config.ownerUsername,
      BookmarksSyncStatusRecordSchema.parse({
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
    );
  } catch (error) {
    const normalized = toIntegrationError(error);
    const status =
      normalized.code === "owner_mismatch"
        ? 403
        : normalized.code === "reauth_required"
          ? 400
          : 500;

    return NextResponse.json({ error: normalized.message }, { status });
  }

  const homeUrl = new URL("/", request.url).toString();
  return NextResponse.redirect(homeUrl);
}
