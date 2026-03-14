/**
 * `GET /api/x/auth` — Initiates the X OAuth2 Authorization Code flow
 * with PKCE (Proof Key for Code Exchange).
 *
 * Generates a cryptographic code verifier/challenge pair, stores the
 * verifier in Redis (5-minute TTL keyed by a random state token), and
 * redirects the user to X's authorization URL with scopes:
 * `bookmark.read`, `users.read`, `tweet.read`, `offline.access`.
 *
 * After the user consents, X redirects to `/api/x/callback` with the
 * authorization code and state.
 *
 * Requires `X_OAUTH2_CLIENT_ID` and `X_OAUTH2_CLIENT_SECRET` env vars.
 *
 * @see https://developer.x.com/en/docs/authentication/oauth-2-0/authorization-code
 * @module
 */
import crypto from "node:crypto";
import { Effect } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { appRuntime } from "@/lib/effect/runtime";
import { keyPrefix, RedisClient } from "@/lib/effect/services/redis";
import {
  assertLiveRuntimeConfig,
  buildXLiveCredentialsErrorMessage,
  getMissingCanonicalXOAuthConfigKeys,
  getPresentLegacyXOAuthEnvKeys,
  getXRuntimeConfig,
} from "@/lib/x/config";

function base64url(buffer: Buffer): string {
  return buffer.toString("base64url");
}

/**
 * Handles the OAuth2 initiation: validates config, generates PKCE params,
 * stores the code verifier in Redis, and redirects to X's authorize URL.
 */
export async function GET(request: NextRequest) {
  const config = getXRuntimeConfig();
  const missingKeys = getMissingCanonicalXOAuthConfigKeys(config);

  if (missingKeys.length > 0) {
    return NextResponse.json(
      {
        error: buildXLiveCredentialsErrorMessage(missingKeys, {
          hasLegacyOauthVars:
            getPresentLegacyXOAuthEnvKeys(process.env).length > 0,
        }),
      },
      { status: 500 },
    );
  }
  assertLiveRuntimeConfig(config);

  // Generate PKCE code verifier and challenge
  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(
    crypto.createHash("sha256").update(codeVerifier).digest(),
  );
  const state = base64url(crypto.randomBytes(16));

  // Store code_verifier keyed by state via Effect Redis service.
  // Must succeed — if this fails, the callback will never find the verifier.
  const stateKey = `${keyPrefix()}x:oauth:${state}`;
  try {
    await appRuntime.runPromise(
      Effect.gen(function* () {
        const redis = yield* RedisClient;
        yield* redis.set(stateKey, codeVerifier, { EX: 300 });
      }),
    );
  } catch (err) {
    console.error("Failed to store OAuth state:", err);
    return NextResponse.json(
      { error: "Failed to store OAuth state. Redis may be unavailable." },
      { status: 503 },
    );
  }

  const callbackUrl = new URL("/api/x/callback", request.url).toString();
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
}
