<h1 align="center">claycurry.com</h1>

<p align="center">Personal portfolio and blog website.</p>

<p align="center">
  <a href="https://claycurry.com">
    <img src="https://claycurry.com/opengraph-image.png" alt="claycurry.com" width="600" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/biomejs/biome"><img src="https://img.shields.io/badge/Biome-60A5FA?style=flat&logo=biome&logoColor=white" alt="Biome" /></a>
  <a href="https://github.com/vercel/next.js"><img src="https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
  <a href="https://github.com/vercel/turborepo"><img src="https://img.shields.io/badge/Turborepo-0995FF?style=flat&labelColor=FF0C20&logo=turborepo&logoColor=white" alt="Turborepo" /></a>
  <a href="https://github.com/mdx-js/mdx"><img src="https://img.shields.io/badge/MDX-21262C?style=flat&labelColor=FCB32C&logo=mdx&logoColor=white" alt="MDX" /></a>
  <a href="https://github.com/shadcn-ui/ui"><img src="https://img.shields.io/badge/shadcn/ui-000000?style=flat&logo=shadcnui&logoColor=white" alt="shadcn/ui" /></a>
</p>

<p align="center">
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fclay-curry%2Fclaycurry.com">
    <img src="https://vercel.com/button" alt="Deploy with Vercel" />
  </a>
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

## Project Structure

```
claycurry.com/
├── apps/
│   ├── www/          # Legacy site
│   └── www-tron/     # Main portfolio site (Next.js)
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

Not currently accepting contributions.

## Security

To report a security vulnerability, please email [me@claycurry.com](mailto:me@claycurry.com).

## License

All rights reserved.
