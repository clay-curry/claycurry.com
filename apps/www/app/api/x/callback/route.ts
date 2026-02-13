import { type NextRequest, NextResponse } from "next/server";
import { getRedisClient, keyPrefix } from "@/lib/redis";
import { storeTokens } from "@/lib/x/tokens";
import { oauthStateStore } from "../auth/route";

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
  const client = await getRedisClient();
  if (client) {
    const stateKey = `${keyPrefix()}x:oauth:${state}`;
    codeVerifier = await client.get(stateKey);
    await client.del(stateKey);
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

  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "X credentials not configured" },
      { status: 500 },
    );
  }

  const callbackUrl = new URL("/api/x/callback", request.url).toString();

  // Exchange authorization code for tokens
  const tokenRes = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl,
      code_verifier: codeVerifier,
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return NextResponse.json(
      { error: `Token exchange failed: ${text}` },
      { status: 500 },
    );
  }

  const tokenData = await tokenRes.json();
  await storeTokens(
    tokenData.access_token,
    tokenData.refresh_token,
    tokenData.expires_in,
  );

  const homeUrl = new URL("/", request.url).toString();
  return NextResponse.redirect(homeUrl);
}
