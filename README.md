<p align="center">
  <img src="apps/www/public/gh-banner.png" alt="Clay Curry portfolio banner" />
</p>

<p align="center">
  <a href="https://github.com/clay-curry/claycurry.com/actions/workflows/merge-criteria.yml"><img src="https://github.com/clay-curry/claycurry.com/actions/workflows/merge-criteria.yml/badge.svg" alt="Merge criteria"/></a>
  <a href="https://www.claycurry.com"><img src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white" alt="Vercel"/></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white" alt="Next.js"/></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node-20.x-339933?logo=node.js&logoColor=white" alt="Node"/></a>
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/pnpm-9.15.0-F69220?logo=pnpm&logoColor=white" alt="pnpm"/></a>
  <a href="LICENSE.md"><img src="https://img.shields.io/badge/License-WTFPL-brightgreen.svg" alt="License: WTFPL"/></a>
</p>

<h1 align="center">
claycurry.com
</h1>

My dent on the world wide web. A portfolio and blog, built as a pnpm + Turborepo monorepo combining a Next.js app, MDX compilation pipeline, visitor analytics, ad hoc tools, visitor analytics, and integrations for LLM agents and communication channels.

## Overview

- Live site: [www.claycurry.com](https://www.claycurry.com)
- Repository: [github.com/clay-curry/claycurry.com](https://github.com/clay-curry/claycurry.com)
- Main app: Next.js 16 + React 19 + TypeScript at `apps/www`
- Build system: Turborepo with pnpm workspaces
- Content: MDX blog posts loaded from `apps/www/blog`
- Data layer: Redis-backed counters (dev container provides Redis automatically)

## Getting Started

### Dev Container (recommended)

Open the repo in VS Code with the Dev Containers extension or in GitHub Codespaces. The dev container automatically:

- Installs Node.js 22 and enables corepack/pnpm
- Starts a Redis server on port 6379
- Sets `KV_REST_API_REDIS_URL=redis://localhost:6379` via `containerEnv`

Once the container is ready:

```bash
pnpm dev
```

Local app URL: `http://localhost:3000`

### Manual setup (without dev container)

#### Prerequisites

- Node.js 20+ (CI uses Node 20)
- Corepack enabled (`corepack enable`)
- pnpm 9.15.0 (from `packageManager` in root `package.json`)
- Redis running locally on port 6379

#### 1. Install dependencies

```bash
corepack enable
pnpm install
```

#### 2. Configure local environment

Create `apps/www/.env.local`:

```bash
KV_REST_API_REDIS_URL="redis://localhost:6379"
```

#### 3. Run the app

```bash
pnpm dev
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
| `KV_REST_API_REDIS_URL` | Yes (auto-set by dev container) | Redis connection URL for click counts and page views. |

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
| `X_OWNER_USERNAME` | X bookmarks sync | Canonical bookmark owner username. Set this to `claycurry__`. |
| `X_OWNER_USER_ID` | X bookmarks sync | Deprecated compatibility field. If set, it must resolve to the same account as `X_OWNER_USERNAME`. |
| `X_OAUTH2_CLIENT_ID` | X OAuth | Canonical OAuth client identifier for token exchange/refresh. |
| `X_OAUTH2_CLIENT_SECRET` | X OAuth | Canonical OAuth client secret for token exchange/refresh. |
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
- Uses Redis for persistent counters (requires `KV_REST_API_REDIS_URL`)
- Redis keys are prefixed by environment to avoid cross-environment collisions

### X bookmarks

- Endpoints: `apps/www/app/api/x/*`
- Supports OAuth token exchange, owner validation for `@claycurry__`, and bookmark retrieval
- Returns stale snapshots instead of blank data when live sync fails and a prior snapshot exists
- Exposes a minimal operator status route at `/api/x/bookmarks/status?secret=...`
- Requires `X_OAUTH2_CLIENT_ID` and `X_OAUTH2_CLIENT_SECRET` — shows a clear error when credentials are missing or legacy names are still in use

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

## Env

```
# Created by Vercel CLI
AI_GATEWAY_API_KEY=
ANTHROPIC_API_KEY=
APPLE_DEV_TEAM_ID=
KV_REST_API_REDIS_URL=
RESEND_API_KEY=
VERCEL_OIDC_TOKEN=

# App-Only Authentication
#
# Bearer Token authenticates requests on behalf of your developer App.
X_BEARER_TOKEN=

# OAuth 1.0 Keys
#
# Consumer Key
# Think of these as the user name and password that represents your App when 
# making API requests.
# 
# While your Secret will remain permanently hidden, you can always view the 
# last 6 characters of your Consumer Key.


# An Access Token and Secret are user-specific credentials used to authenticate 
# OAuth 1.0 API requests. They specify the X account the request is made on 
# behalf of.
X_OWNER_OAUTH1_ACCESS_TOKEN=
X_OWNER_OAUTH1_ACCESS_TOKEN_SECRET=


# OAuth 2.0 Keys

# Client ID
# Think of your Client ID as the user name that allows you to use OAuth 2.0 as 
# an authentication method.
X_OAUTH2_CLIENT_ID=
# Client Secret
# Think of your Client Secret as the password that allows you to use OAuth 2.0 
# as an authentication method.
X_OAUTH2_CLIENT_SECRET=

X_OWNER_USERNAME=claycurry__
X_OWNER_SECRET=
X_OWNER_USER_ID=
```


## License

This project is licensed under the WTFPL. See [LICENSE.md](LICENSE.md).
