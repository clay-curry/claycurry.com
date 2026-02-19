<p align="center">
  <img src="apps/www/public/gh-banner.png" alt="Clay Curry portfolio banner" />
</p>

<p align="center">

[![Merge criteria](https://github.com/clay-curry/claycurry.com/actions/workflows/merge-criteria.yml/badge.svg)](https://github.com/clay-curry/claycurry.com/actions/workflows/merge-criteria.yml)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)](https://www.claycurry.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node](https://img.shields.io/badge/Node-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15.0-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: WTFPL](https://img.shields.io/badge/License-WTFPL-brightgreen.svg)](LICENSE.md)

</p>

# claycurry.com

Clay Curry's personal portfolio and blog, built as a pnpm + Turborepo monorepo with a Next.js app, MDX content, AI chat, usage analytics, and optional social/email integrations.

## Overview

- Live site: [www.claycurry.com](https://www.claycurry.com)
- Repository: [github.com/clay-curry/claycurry.com](https://github.com/clay-curry/claycurry.com)
- Main app: Next.js 16 + React 19 + TypeScript at `apps/www`
- Build system: Turborepo with pnpm workspaces
- Content: MDX blog posts loaded from `apps/www/blog`
- Data layer: Redis-backed counters with in-memory fallback for local development

## Getting Started

### Prerequisites

- Node.js 20+ (CI uses Node 20)
- Corepack enabled (`corepack enable`)
- pnpm 9.15.0 (from `packageManager` in root `package.json`)

### 1. Install dependencies

```bash
corepack enable
pnpm install
```

### 2. Configure local environment (optional)

No environment variables are required for basic local development.

To enable optional integrations, create:

```bash
apps/www/.env.local
```

Example:

```bash
# Optional Redis persistence for click + view counters
KV_REST_API_REDIS_URL="redis://localhost:6379"
```

### 3. Run the app

```bash
# Run the monorepo dev pipeline
pnpm dev

# Run only the portfolio app
pnpm dev --filter www
```

Local app URL: `http://localhost:3000`

## Common Commands

| Purpose | Command |
| --- | --- |
| Start all dev tasks | `pnpm dev` |
| Start only website app | `pnpm dev --filter www` |
| Build all packages | `pnpm build` |
| Build website app only | `pnpm build --filter www` |
| Run all checks | `pnpm check` |
| Run website checks only | `pnpm check --filter www` |
| Run TypeScript checks | `pnpm check-types` |
| Run website type checks only | `pnpm check-types --filter www` |
| Run tests | `pnpm test` |
| Run link checks | `pnpm check-links` |
| Validate social metadata rules | `pnpm --filter www check-social-metadata` |

## Environment Variables

### Core local development

| Variable | Required locally | Purpose |
| --- | --- | --- |
| `KV_REST_API_REDIS_URL` | No | Enables Redis persistence for click counts and page views. Without it, counters fall back to in-memory storage. |

### Optional integrations

| Variable | Required for | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | Contact + feedback forms | Sends messages from `/api/contact` and `/api/feedback`. |
| `GITHUB_TOKEN` | Higher GitHub API limits in chat | Adds authenticated GitHub requests for portfolio chat context. |
| `AI_GATEWAY_API_KEY` | AI chat | Authenticates model requests through AI Gateway in `/api/chat`. |
| `ANTHROPIC_API_KEY` | AI model fallback | Optional direct provider fallback support. |
| `OPENAI_API_KEY` | AI model fallback | Optional direct provider fallback support. |
| `XAI_API_KEY` | AI model selection | Optional model/provider support. |
| `PERPLEXITY_API_KEY` | Web search tool in chat | Enables search tool usage when web search is turned on in chat. |
| `X_OWNER_USER_ID` | X bookmarks sync | Owner account ID used for bookmark fetches. |
| `X_CLIENT_ID` | X OAuth | OAuth client identifier. |
| `X_CLIENT_SECRET` | X OAuth | OAuth client secret for token exchange/refresh. |
| `X_OWNER_SECRET` | X OAuth bootstrap route | Shared secret gate for `/api/x/auth`. |

Deployment note:

- `VERCEL_ENV` is provided by Vercel and used to namespace Redis keys (`prod:`, `preview:`, `dev:`).

## Integrations

### AI chat

- Endpoint: `apps/www/app/api/chat/route.ts`
- Streams responses via AI SDK + gateway model routing
- Supports optional web search tooling and blog-aware Q&A context

### Redis-backed analytics

- Endpoints: `apps/www/app/api/clicks/route.ts`, `apps/www/app/api/views/route.ts`
- Uses Redis when configured; automatically falls back to in-memory storage
- Redis keys are prefixed by environment to avoid cross-environment collisions

### X bookmarks

- Endpoints: `apps/www/app/api/x/*`
- Supports OAuth token exchange and bookmark retrieval
- Returns fixture data when X credentials are not configured (useful for local UI work)

### Email delivery

- Endpoints: `apps/www/app/api/contact/route.ts`, `apps/www/app/api/feedback/route.ts`
- Uses Resend API for contact and page feedback workflows

## Features

- Portfolio sections for About, Resume, Work, Writing, and Contact
- MDX blog with metadata-driven routing and dynamic post pages
- Ask-AI chat experience with source and reasoning streaming
- Click-count overlays and page view counters
- X bookmarks explorer with folder and search support
- Short-link redirects (e.g. `/x`, `/l`, `/g`) for referral attribution

## Monorepo Layout

```text
.
├─ apps/
│  └─ www/                  # Next.js portfolio/blog app
├─ packages/
│  ├─ link-checker/         # Link validation utilities/scripts
│  └─ www/                  # Legacy/experimental files (not a workspace package)
├─ scripts/
│  └─ setup-skills.sh       # Postinstall skill bootstrap (skipped in CI/Vercel)
├─ turbo.json               # Task graph and cache config
├─ pnpm-workspace.yaml      # Workspace package globs
└─ package.json             # Root scripts delegating to turbo
```

Note: `packages/www` currently has no `package.json`, so it is not an active pnpm workspace package.

## Architecture Notes

- App routing uses Next.js App Router with route groups under `apps/www/app`.
- Blog content is sourced from `apps/www/blog/*.mdx` and loaded through `apps/www/app/(portfolio)/blog/loader.ts`.
- MDX processing is configured in `apps/www/next.config.mjs` (GFM, math, TOC, pretty-code).
- Turbo tasks are defined in `turbo.json` (`dev`, `build`, `check`, `check-types`, `test`, `check-links`).
- Social metadata guardrails are enforced by `apps/www/scripts/check-social-metadata.mjs`.
- Redis helpers and key-prefix logic are centralized in `apps/www/lib/redis.ts`.

## Deployment

- Production URL: [https://www.claycurry.com](https://www.claycurry.com)
- Deployed on Vercel
- Ensure required environment variables are set in Vercel Project Settings
- Keep Vercel system environment variables enabled so `VERCEL_ENV` is available at runtime

## Contributing

1. Create a branch and open a PR targeting `main`.
2. Run checks before opening/updating the PR:
   - `pnpm check --filter www`
   - `pnpm check-types --filter www`
   - `pnpm --filter www check-social-metadata`
3. Update `CHANGELOG.md` for user-facing changes.
4. Follow conventional commit messages (validated in CI).

CI enforces merge criteria via `.github/workflows/merge-criteria.yml`, including changelog and commit checks.

## License

This project is licensed under the WTFPL. See [LICENSE.md](LICENSE.md).
