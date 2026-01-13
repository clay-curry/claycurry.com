<div align="center">

# claycurry.com

[![Coded with Claude](https://img.shields.io/badge/Coded_with-Claude-D97757?style=flat&logo=anthropic)](https://www.anthropic.com/)
[![Formatted using Biome](https://img.shields.io/badge/Formatted_using-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev/)
[![Declared in Next.js](https://img.shields.io/badge/Declared_in-Next.js-000000?style=flat&logo=nextdotjs)](https://nextjs.org/)
[![Styled with TailwindCSS](https://img.shields.io/badge/Styled_with-Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Cached inside Redis](https://img.shields.io/badge/Cached_inside-Redis-DC382D?style=flat&logo=redis)](https://redis.io/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat&logo=vercel)](https://vercel.com/)

My resume and portfolio.

</div>

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+), or
- [Node.js](https://nodejs.org/) (v18+)

### Local Development

```bash
# Clone the repository
git clone https://github.com/clay-curry/claycurry.com.git
cd claycurry.com

# Install dependencies
bun install

# Start development server
bun dev
```

### Scripts

| Command         | Description                      |
| --------------- | -------------------------------- |
| `bun dev`       | Start development server         |
| `bun build`     | Build for production             |
| `bun start`     | Start production server          |
| `bun lint`      | Run Biome linter                 |
| `bun format`    | Format code with Biome           |

### Deploy

Push to `main` branch to trigger automatic deployment on Vercel.

---

## Project Structure

```text
├── public/                 # Static assets
│
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── (site)/         # Site routes (grouped)
│   │   │   └── blog/
│   │   │       ├── _content/   # MDX blog post content
│   │   │       └── _lib/       # Blog utilities (loaders, types)
│   │   │
│   │   └── api/            # API routes
│   │
│   ├── lib/                # Shared utilities
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   └── blog/           # Blog-related utilities
│   │
│   └── styles/             # Global styles
│
├── biome.json              # Biome linter/formatter config
├── components.json         # shadcn/ui configuration
├── mdx-components.tsx      # Custom MDX component mappings
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

---

## Backend

### Page Views API

A simple API for tracking page view counts across the site.

#### Endpoints

| Method | Endpoint                 | Description                  | Response                                 |
| ------ | ------------------------ | ---------------------------- | ---------------------------------------- |
| GET    | `/api/views?slug=<path>` | Fetch view count (read-only) | `{"slug": "/blog/my-post", "count": 42}` |
| POST   | `/api/views`             | Increment and return count   | `{"slug": "/blog/my-post", "count": 43}` |

#### Usage

```bash
# Get view count
curl "https://claycurry.com/api/views?slug=/blog/my-post"

# Increment view count
curl -X POST https://claycurry.com/api/views \
  -H "Content-Type: application/json" \
  -d '{"slug": "/blog/my-post"}'
```

#### Storage

| Environment | Storage           | Persistence          |
| ----------- | ----------------- | -------------------- |
| Development | In-memory Map     | ❌ Resets on restart |
| Production  | Vercel KV (Redis) | ✅ Persistent        |
