# Tron design system

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/clay-currys-projects/v0-minimalist-portfolio-i5)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/VvQEaiGYIY5)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/clay-currys-projects/v0-minimalist-portfolio-i5](https://vercel.com/clay-currys-projects/v0-minimalist-portfolio-i5)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/VvQEaiGYIY5](https://v0.app/chat/VvQEaiGYIY5)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

---

## Local Development Setup

### Prerequisites

- **Node.js** >= 18
- **pnpm** 9.15.0 (the monorepo's `packageManager` field enforces this version via corepack)
- **Git**

Enable corepack so pnpm is managed automatically:

```bash
corepack enable
```

### 1. Clone and install

```bash
git clone <repo-url> claycurry.com
cd claycurry.com
pnpm install
```

This installs dependencies for the entire monorepo (all apps and packages). The root `postinstall` script runs `scripts/setup-skills.sh` automatically.

### 2. Environment variables

The app uses **one** env var for persistent storage:

| Variable | Purpose | Required locally? |
|---|---|---|
| `KV_REST_API_REDIS_URL` | Redis connection URL for click counts and page views | No |

**Without Redis (default):** The app runs fine with no env file at all. Click counts and page views use an in-memory `Map` that resets on every server restart. This is sufficient for frontend development.

**With Redis:** Create a `.env.local` file in the app directory:

```bash
# apps/www/.env.local
KV_REST_API_REDIS_URL="redis://localhost:6379"
```

Next.js automatically loads `.env.local` and it is gitignored by default.

### 3. Running the dev server

From the monorepo root:

```bash
pnpm dev
```

This starts all apps via Turborepo. To run only this app:

```bash
pnpm dev --filter www
```

Or from the app directory:

```bash
cd apps/www
pnpm dev
```

The dev server starts at `http://localhost:3000` (or the next available port).

### 4. Type checking and linting

```bash
# Type check
pnpm check-types --filter www

# Biome check (formatting + linting with auto-fix)
pnpm check --filter www
```

### 5. Building for production locally

```bash
pnpm build --filter www
pnpm start --filter www
```

---

## Redis and Environment Partitioning

All Redis keys are namespaced by environment to prevent development data from polluting production counters.

### How it works

The shared Redis client (`lib/redis.ts`) prepends a prefix to every key based on the current environment:

| Environment | Prefix | Example keys |
|---|---|---|
| Production (`VERCEL_ENV=production`) | `prod:` | `prod:clicks`, `prod:pageviews:my-post` |
| Preview (`VERCEL_ENV=preview`) | `preview:` | `preview:clicks`, `preview:pageviews:my-post` |
| Local development | `dev:` | `dev:clicks`, `dev:pageviews:my-post` |

- **`VERCEL_ENV`** is a system variable set automatically by Vercel on every deployment. It does not need to be manually configured -- just ensure "Automatically expose System Environment Variables" is checked in Project Settings > Environment Variables on the Vercel dashboard.
- **Locally**, `VERCEL_ENV` is not set, so the prefix falls back to `dev:` based on `NODE_ENV`.

### Setting up Redis locally (optional)

If you want persistent click/view data during local development, you can run Redis locally:

**Option A: Docker**

```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

**Option B: Homebrew (macOS)**

```bash
brew install redis
brew services start redis
```

**Option C: Use the production Upstash instance**

You can point your local dev at the production Redis URL. Because keys are namespaced with `dev:`, your local clicks will never interfere with production data under `prod:`.

Then set the connection URL in `.env.local`:

```bash
KV_REST_API_REDIS_URL="redis://localhost:6379"
```

### Vercel dashboard setup

For deployed environments to use Redis:

1. Go to **Project Settings > Environment Variables**
2. Check **"Automatically expose System Environment Variables"** (this enables `VERCEL_ENV`)
3. Add `KV_REST_API_REDIS_URL` with your Redis connection URL, scoped to the appropriate environments (Production, Preview, Development)

---

## Migration Script

If you have existing data in un-prefixed Redis keys (`clicks`, `pageviews:*`) from before environment partitioning was added, run the migration script to copy them to the `prod:` namespace:

```bash
KV_REST_API_REDIS_URL="redis://your-production-redis-url" npx tsx apps/www/scripts/migrate-redis-keys.ts
```

The script:
- Copies all fields from `clicks` hash to `prod:clicks`
- Copies all `pageviews:*` string keys to `prod:pageviews:*`
- Prints a summary of what was migrated
- Does **not** delete old keys (clean up manually after verifying)
- Is idempotent (safe to run multiple times)

After verifying production works correctly with the new prefixed keys, manually delete the old un-prefixed keys:

```bash
redis-cli DEL clicks
redis-cli KEYS "pageviews:*" | xargs redis-cli DEL
```

---

## Project Structure (key files)

```
apps/www/
  app/
    api/
      clicks/route.ts    # Click counter API (GET all counts, POST increment)
      views/route.ts     # Page view API (GET count, POST increment with dedup)
  lib/
    redis.ts             # Shared Redis client, in-memory fallback, key prefix
    hooks/
      use-click-counts.ts  # Client-side hook for click tracking
  scripts/
    migrate-redis-keys.ts  # One-time migration for un-prefixed Redis keys
```
