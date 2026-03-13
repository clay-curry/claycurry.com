import crypto from "node:crypto";
import { Effect } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { keyPrefix, RedisClient } from "@/lib/effect/services/redis";
import { withDebug } from "@/lib/effect/with-debug";
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

  const stateKey = `${keyPrefix()}x:oauth:${state}`;

  return withDebug(
    request,
    Effect.gen(function* () {
      const redis = yield* RedisClient;
      yield* redis.set(stateKey, codeVerifier, { EX: 300 });

      const callbackUrl = new URL("/api/x/callback", request.url).toString();
      const authUrl = new URL("https://x.com/i/oauth2/authorize");
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("client_id", config.clientId!);
      authUrl.searchParams.set("redirect_uri", callbackUrl);
      authUrl.searchParams.set(
        "scope",
        "bookmark.read users.read tweet.read offline.access",
      );
      authUrl.searchParams.set("state", state);
      authUrl.searchParams.set("code_challenge", codeChallenge);
      authUrl.searchParams.set("code_challenge_method", "S256");

      return NextResponse.redirect(authUrl.toString());
    }).pipe(
      Effect.catchTag("RedisError", (err) => {
        console.error("Failed to store OAuth state:", err.message);
        return Effect.succeed(
          NextResponse.json(
            { error: "Failed to store OAuth state. Redis may be unavailable." },
            { status: 503 },
          ),
        );
      }),
    ),
  );
}
