/**
 * One-time migration script: copies un-prefixed Redis keys to prod:-prefixed keys.
 *
 * - `clicks` hash → `prod:clicks` hash (HSET, overwrites per field)
 * - `pageviews:*` string keys → `prod:pageviews:*` (SET, overwrites)
 *
 * Does NOT delete old keys — clean up manually after verifying.
 * Idempotent: safe to run multiple times.
 *
 * Usage:
 *   KV_REST_API_REDIS_URL="redis://..." npx tsx apps/www-tron/scripts/migrate-redis-keys.ts
 */
import { createClient } from "redis";

async function main() {
  const url = process.env.KV_REST_API_REDIS_URL;
  if (!url) {
    console.error(
      "Error: KV_REST_API_REDIS_URL environment variable is not set",
    );
    process.exit(1);
  }

  const client = createClient({ url });
  client.on("error", (err) => console.error("Redis Client Error", err));
  await client.connect();

  // --- Migrate clicks hash ---
  const clickFields = await client.hGetAll("clicks");
  const clickCount = Object.keys(clickFields).length;

  if (clickCount > 0) {
    await client.hSet("prod:clicks", clickFields);
    console.log(`Migrated ${clickCount} click fields to prod:clicks:`);
    for (const [field, value] of Object.entries(clickFields)) {
      console.log(`  ${field}: ${value}`);
    }
  } else {
    console.log('No click fields found in "clicks" hash — nothing to migrate.');
  }

  // --- Migrate pageviews:* keys ---
  let pageviewCount = 0;
  const allKeys = await client.keys("pageviews:*");
  for (const key of allKeys) {
    // Skip keys that are already prefixed (e.g. prod:pageviews:, dev:pageviews:)
    if (
      key.startsWith("prod:") ||
      key.startsWith("preview:") ||
      key.startsWith("dev:")
    ) {
      continue;
    }
    const value = await client.get(key);
    if (value !== null) {
      const newKey = `prod:${key}`;
      await client.set(newKey, value);
      console.log(`  ${key} (${value}) → ${newKey}`);
      pageviewCount++;
    }
  }

  if (pageviewCount > 0) {
    console.log(`Migrated ${pageviewCount} pageview keys.`);
  } else {
    console.log("No pageview keys found — nothing to migrate.");
  }

  console.log(
    "\nDone. Old keys were NOT deleted — verify and clean up manually.",
  );
  await client.quit();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
