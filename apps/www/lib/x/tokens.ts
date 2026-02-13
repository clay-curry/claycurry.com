import { getRedisClient, keyPrefix } from "@/lib/redis";

interface StoredTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

const TOKEN_KEY = "x:tokens";

// In-memory fallbacks when Redis is not configured (local dev)
let inMemoryTokens: StoredTokens | null = null;
export const oauthStateStore = new Map<string, string>();

export async function storeTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
): Promise<void> {
  const tokens: StoredTokens = {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: Date.now() + expiresIn * 1000,
  };

  const client = await getRedisClient();
  if (client) {
    await client.set(`${keyPrefix()}${TOKEN_KEY}`, JSON.stringify(tokens));
  } else {
    inMemoryTokens = tokens;
  }
}

async function getStoredTokens(): Promise<StoredTokens | null> {
  const client = await getRedisClient();
  if (!client) return inMemoryTokens;

  const raw = await client.get(`${keyPrefix()}${TOKEN_KEY}`);
  if (!raw) return null;

  return JSON.parse(raw) as StoredTokens;
}

async function refreshAccessToken(refreshToken: string): Promise<StoredTokens> {
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("X_CLIENT_ID or X_CLIENT_SECRET not configured");
  }

  const res = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  await storeTokens(data.access_token, data.refresh_token, data.expires_in);

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

export async function getValidAccessToken(): Promise<string> {
  const tokens = await getStoredTokens();
  if (!tokens) {
    throw new Error("No X tokens stored — run the OAuth setup flow first");
  }

  // Refresh if token expires within 5 minutes
  if (tokens.expires_at - Date.now() < 5 * 60 * 1000) {
    const refreshed = await refreshAccessToken(tokens.refresh_token);
    return refreshed.access_token;
  }

  return tokens.access_token;
}
