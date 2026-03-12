/**
 * @module api/x/callback
 *
 * API Route: X OAuth Callback
 *
 * Handles the OAuth PKCE callback: retrieves code_verifier from Redis,
 * exchanges the authorization code for tokens, verifies owner identity,
 * stores the token, and redirects to home.
 *
 * Endpoint:
 * - GET /api/x/callback?code=<code>&state=<state>
 *
 * Effect services used: RedisService, TracingService
 */
import { Effect } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { AuthError, UpstreamError, ValidationError } from "@/lib/effect/errors";
import { RedisService } from "@/lib/services/Redis";
import { TracingService } from "@/lib/services/Tracing";
import { createEffectRepository } from "@/lib/x/cache";
import {
  XBookmarksClient,
  XBookmarksOwnerResolver,
  XIdentityVerifier,
} from "@/lib/x/client";
import { assertLiveRuntimeConfig, getXRuntimeConfig } from "@/lib/x/config";
import { BookmarksSyncStatusRecordSchema } from "@/lib/x/contracts";
import { toIntegrationError } from "@/lib/x/errors";
import { XTokenStore } from "@/lib/x/tokens";
import { runRouteHandler } from "../../_shared/handler";

const handleGet = (req: NextRequest) =>
  Effect.gen(function* () {
    const redis = yield* RedisService;
    const tracing = yield* TracingService;
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      return yield* Effect.fail(
        new ValidationError({ message: `OAuth error: ${errorParam}` }),
      );
    }

    if (!code || !state) {
      return yield* Effect.fail(
        new ValidationError({ message: "Missing code or state" }),
      );
    }

    // Retrieve code_verifier from Redis
    const stateKey = `${redis.keyPrefix}x:oauth:${state}`;
    const codeVerifier = yield* tracing.span(
      "redis.get.oauthState",
      redis.get(stateKey),
    );
    // Clean up the state key
    yield* redis.del(stateKey);

    if (!codeVerifier) {
      return yield* Effect.fail(
        new ValidationError({ message: "Invalid or expired state" }),
      );
    }

    const config = getXRuntimeConfig();
    if (config.mode !== "live") {
      return yield* Effect.fail(
        new AuthError({ message: "X credentials not configured" }),
      );
    }
    assertLiveRuntimeConfig(config);

    const callbackUrl = new URL("/api/x/callback", req.url).toString();
    const repository = yield* createEffectRepository();
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

    const result = yield* tracing.span(
      "x.oauthCallback",
      Effect.tryPromise({
        try: async () => {
          const tokenData = await tokenStore.exchangeAuthorizationCode({
            code,
            codeVerifier,
            redirectUri: callbackUrl,
          });
          const authenticatedOwner = await identityVerifier.verify(
            tokenData.access_token,
          );
          const resolvedOwner = await ownerResolver.resolve(
            tokenData.access_token,
          );

          if (
            authenticatedOwner.id &&
            resolvedOwner.id &&
            authenticatedOwner.id !== resolvedOwner.id
          ) {
            throw Object.assign(
              new Error(
                `Authenticated owner @${authenticatedOwner.username} does not match resolved owner @${resolvedOwner.username}`,
              ),
              { statusCode: 403 },
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

          return { success: true };
        },
        catch: (e) => {
          const normalized = toIntegrationError(e);
          const status =
            normalized.code === "owner_mismatch"
              ? 403
              : normalized.code === "reauth_required"
                ? 400
                : 500;
          return new UpstreamError({
            message: normalized.message,
            cause: Object.assign(normalized, { statusCode: status }),
          });
        },
      }),
    );

    if (!result.success) {
      return NextResponse.json({ error: "OAuth flow failed" }, { status: 500 });
    }

    const homeUrl = new URL("/", req.url).toString();
    return NextResponse.redirect(homeUrl);
  });

export async function GET(req: NextRequest) {
  return runRouteHandler(req, handleGet(req));
}
