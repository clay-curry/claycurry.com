# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev                    # Start dev server (Next.js with webpack)
pnpm build                  # Production build
pnpm check                  # Biome lint + fix
pnpm check-types            # TypeScript type-checking

# All commands run through Turborepo from the root
# The main app is at apps/www-tron/
```

## Architecture

**Turborepo monorepo** with pnpm workspaces. One app (`apps/www-tron` — Next.js 16, React 19, App Router) and one utility package (`packages/link-checker`).

### Routing

Three **route groups** with separate layouts:
- `(portfolio)` — home (`/`), blog listing (`/blog`), contact
- `(blog-post)` — individual posts at `/blog/[slug]`
- `(resume)` — resume page

Navigation links are derived from the filesystem at build time (`lib/navigation.ts`). The nav config maps segments to display labels — `/blog` displays as "writing" and uses a URL rewrite.

Short redirects (`/x`, `/l`, `/g`, `/m`, `/r`, `/rd`) in `next.config.mjs` track traffic sources.

### MDX Blog

Blog posts live in `apps/www-tron/blog/*.mdx` with gray-matter frontmatter (`slug`, `title`, `publishedDate`, `tags`, `pinned`). The loader at `lib/components/content/loader.ts` provides `getAllPostsMetadata()` and `getPost(slug)`.

MDX processing chain: remark-gfm, remark-math, remark-frontmatter → rehype-pretty-code (shiki, github-dark), rehype-katex, rehype-mdx-toc. Custom components in `mdx-components.tsx` provide auto-slugified headings, code blocks, PhotoCarousel, Mermaid diagrams, and tabbed content.

### Theming

TRON: Legacy-inspired design system using OKLch color space, defined entirely in CSS variables (`app/globals.css`). Five theme presets (cyan, orange, red, green, gray) set `--src-primary-h` and `--src-primary-c`; all other colors derive from these. Light/dark modes supported. Theme persists via localStorage (`tron-mode`, `tron-theme`) with an inline script in `<head>` to prevent flash.

### AI Chat

Chat API at `app/api/chat/route.ts` uses Vercel AI SDK with gateway routing (grok-3-mini primary, Claude/GPT fallbacks). Fetches GitHub profile + repos for system context. Blog-contextual mode passes full article markdown. Client-side chat history stored in IndexedDB via Dexie (`lib/db/index.ts`).

### Data & Analytics

- **Redis** (`lib/redis.ts`): View counts and click tracking with environment-prefixed keys (`prod:`, `preview:`, `dev:`). Falls back to in-memory Map when `KV_REST_API_REDIS_URL` is unset.
- **Contact/feedback**: Resend email API integration at `app/api/contact/` and `app/api/feedback/`.
- All hardcoded content (profile, skills, resume, social links) lives in `lib/portfolio-data.ts`.

### Component Organization

- `lib/components/ui/` — shadcn/ui (New York style, Radix primitives, Lucide icons)
- `lib/components/chat/` — Chat dialog, drawer, message rendering, prompt input
- `lib/components/content/` — Code blocks, Mermaid, photo galleries, blog loader
- `lib/components/site/` — Navigation, theme toggles, page views, hero, sidebars

Path aliases: `@/` → `apps/www-tron/` root. shadcn/ui configured in `components.json` with aliases `@/lib/components/ui`, `@/lib/hooks`.

### Formatting & Linting

Biome (not ESLint for formatting) with space indentation. Config at root `biome.json` with Next.js and React recommended rules. Tailwind CSS v4 directives enabled in CSS parser.
