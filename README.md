<h1 align="center"><a href="https://claycurry.com">claycurry.com</a></h1>

<p align="center">Personal portfolio and blog website.</p>

<p align="center">
  <a href="https://github.com/biomejs/biome"><img src="https://img.shields.io/badge/Biome-60A5FA?style=flat&logo=biome&logoColor=white" alt="Biome" /></a>
  <a href="https://github.com/vercel/next.js"><img src="https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
  <a href="https://github.com/vercel/turborepo"><img src="https://img.shields.io/badge/Turborepo-FF0C20?style=flat&labelColor=0995FF&logo=turborepo&logoColor=white" alt="Turborepo" /></a>
  <a href="https://github.com/webpack/webpack"><img src="https://img.shields.io/badge/Webpack-1C78C0?style=flat&labelColor=8DD6F9&logo=webpack&logoColor=white" alt="Webpack" /></a>
  <a href="https://github.com/mdx-js/mdx"><img src="https://img.shields.io/badge/MDX-21262C?style=flat&labelColor=FCB32C&logo=mdx&logoColor=white" alt="MDX" /></a>
  <a href="https://github.com/unifiedjs/unified"><img src="https://img.shields.io/badge/Unified-0366D6?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==&logoColor=white" alt="Unified" /></a>
  <a href="https://github.com/shadcn-ui/ui"><img src="https://img.shields.io/badge/shadcn/ui-000000?style=flat&logo=shadcnui&logoColor=white" alt="shadcn/ui" /></a>
</p>

## Prerequisites

- Node.js 20+
- pnpm 9.15.0+

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/clay-curry/claycurry.com.git
cd claycurry.com
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Use Vercel CLI to pull environment variables:

```bash
vercel env pull
```

Required keys:

- `AI_GATEWAY_API_KEY` - Vercel AI SDK Gateway
- `ANTHROPIC_API_KEY` - Anthropic API (for AI chat)
- `KV_REST_API_REDIS_URL` - Redis (for view counts)
- `RESEND_API_KEY` - Resend (for contact form emails)
- `GITHUB_TOKEN` - GitHub API (optional, for higher rate limits)

4. Start the development server:

```bash
pnpm dev
```

The site will be available at `http://localhost:3000`.

5. Deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fclay-curry%2Fclaycurry.com)

## Project Structure

```
claycurry.com/
├── apps/
│   └── www/          # Main portfolio site (Next.js)
├── package.json
└── turbo.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm check` | Run linting |
| `pnpm check-types` | Type check |

## Contributing

Always welcoming quality contributions / feedback / critiques. Open a PR for small changes. Issues for discussing larger changes.

## Security

To report a security vulnerability, please email [me@claycurry.com](mailto:me@claycurry.com).

## License

[All rights reserved.](LICENSE)
