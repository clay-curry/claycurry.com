import crypto from "node:crypto";
import { Effect } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { appRuntime } from "@/lib/effect/runtime";
import { keyPrefix, RedisClient } from "@/lib/effect/services/redis";
import { getXRuntimeConfig } from "@/lib/x/config";

function base64url(buffer: Buffer): string {
  return buffer.toString("base64url");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const config = getXRuntimeConfig();

  if (!config.ownerSecret) {
    return NextResponse.json(
      { error: "X_OWNER_SECRET not configured" },
      { status: 500 },
    );
  }

  if (!secret || secret !== config.ownerSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!config.clientId || !config.clientSecret) {
    return NextResponse.json(
      { error: "X_CLIENT_ID or X_CLIENT_SECRET not configured" },
      { status: 500 },
    );
  }

  // Generate PKCE code verifier and challenge
  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(
    crypto.createHash("sha256").update(codeVerifier).digest(),
  );
  const state = base64url(crypto.randomBytes(16));

  // Store code_verifier keyed by state via Effect Redis service
  // (InMemoryRedisLive handles the no-Redis fallback with TTL support)
  const stateKey = `${keyPrefix()}x:oauth:${state}`;
  await appRuntime.runPromise(
    Effect.gen(function* () {
      const redis = yield* RedisClient;
      yield* redis.set(stateKey, codeVerifier, { EX: 300 });
    }).pipe(
      Effect.catchTag("RedisError", (err) => {
        console.error("Redis OAuth state store error:", err.message);
        return Effect.void;
      }),
    ),
  );

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
