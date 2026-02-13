import crypto from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { getRedisClient, keyPrefix } from "@/lib/redis";
import { oauthStateStore } from "@/lib/x/tokens";

function base64url(buffer: Buffer): string {
  return buffer.toString("base64url");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!secret || secret !== process.env.X_OWNER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.X_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "X_CLIENT_ID not configured" },
      { status: 500 },
    );
  }

  // Generate PKCE code verifier and challenge
  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(
    crypto.createHash("sha256").update(codeVerifier).digest(),
  );
  const state = base64url(crypto.randomBytes(16));

  // Store code_verifier keyed by state (Redis or in-memory fallback)
  const client = await getRedisClient();
  if (client) {
    await client.set(`${keyPrefix()}x:oauth:${state}`, codeVerifier, {
      EX: 300,
    });
  } else {
    oauthStateStore.set(state, codeVerifier);
    setTimeout(() => oauthStateStore.delete(state), 300_000);
  }

  const callbackUrl = new URL("/api/x/callback", request.url).toString();
  const authUrl = new URL("https://x.com/i/oauth2/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
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
