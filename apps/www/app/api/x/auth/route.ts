/**
 * @module api/x/auth
 *
 * API Route: X OAuth PKCE Initiation
 *
 * Generates PKCE code verifier/challenge, stores state in Redis via
 * RedisService, and redirects to X.com OAuth authorize endpoint.
 * Gated behind X_OWNER_SECRET.
 *
 * Endpoint:
 * - GET /api/x/auth?secret=<ownerSecret>
 *
 * Effect services used: RedisService, TracingService
 */
import crypto from "node:crypto";
import { Effect } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { AuthError, ValidationError } from "@/lib/effect/errors";
import { RedisService } from "@/lib/services/Redis";
import { TracingService } from "@/lib/services/Tracing";
import { getXRuntimeConfig } from "@/lib/x/config";
import { runRouteHandler } from "../../_shared/handler";

function base64url(buffer: Buffer): string {
  return buffer.toString("base64url");
}

const handleGet = (req: NextRequest) =>
  Effect.gen(function* () {
    const redis = yield* RedisService;
    const tracing = yield* TracingService;
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    const config = getXRuntimeConfig();

    if (!config.ownerSecret) {
      return yield* Effect.fail(
        new AuthError({ message: "X_OWNER_SECRET not configured" }),
      );
    }

    if (!secret || secret !== config.ownerSecret) {
      return yield* Effect.fail(new AuthError({ message: "Unauthorized" }));
    }

    if (!config.clientId || !config.clientSecret) {
      return yield* Effect.fail(
        new ValidationError({
          message: "X_CLIENT_ID or X_CLIENT_SECRET not configured",
        }),
      );
    }

    // Generate PKCE code verifier and challenge
    const codeVerifier = base64url(crypto.randomBytes(32));
    const codeChallenge = base64url(
      crypto.createHash("sha256").update(codeVerifier).digest(),
    );
    const state = base64url(crypto.randomBytes(16));

    // Store code_verifier keyed by state with 5-minute TTL
    yield* tracing.span(
      "redis.set.oauthState",
      redis.set(`${redis.keyPrefix}x:oauth:${state}`, codeVerifier, {
        ex: 300,
      }),
    );

    const callbackUrl = new URL("/api/x/callback", req.url).toString();
    const authUrl = new URL("https://x.com/i/oauth2/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", config.clientId);
    authUrl.searchParams.set("redirect_uri", callbackUrl);
    authUrl.searchParams.set(
      "scope",
      "bookmark.read users.read tweet.read offline.access",
    );
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");

    return NextResponse.redirect(authUrl.toString());
  });

export async function GET(req: NextRequest) {
  return runRouteHandler(req, handleGet(req));
}
