# claycurry.com

[![Formatted with Biome](https://img.shields.io/badge/Formatted_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev/)

My resume and portfolio.

---

## Page Views API

A simple API for tracking page view counts across the site.

### Endpoints

#### `GET /api/views?slug=<path>`

Fetch the view count for a page without incrementing.

**Response:**

```json
{ "slug": "/blog/my-post", "count": 42 }
```

#### `POST /api/views`

Increment and return the view count.

**Request body:**

```json
{ "slug": "/blog/my-post" }
```

**Response:**

```json
{ "slug": "/blog/my-post", "count": 43 }
```

### Setup

#### Local Development

No setup required. The API uses an **in-memory store** as a fallback when Vercel KV is not configured.

> ⚠️ Counts reset on every server restart in development.

#### Production (Vercel KV)

For persistent storage in production:

1. **Create a KV store** in your [Vercel Dashboard](https://vercel.com/dashboard):
   - Go to your project → Storage → Create Database → KV

2. **Link it to your project**:
   - Vercel automatically adds these environment variables:
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`

3. **Deploy** — the API will automatically use Vercel KV when these env vars are present.

### Usage

#### React Component

```tsx
import { PageViews } from "@/src/lib/components/page-views";

// Tracks current URL automatically
<PageViews />

// Custom slug
<PageViews slug="/custom-path" />

// Read-only (don't increment)
<PageViews increment={false} />
```

#### React Hook

```tsx
import { usePageViews } from "@/src/lib/hooks/use-page-views";

const { count, isLoading, error } = usePageViews("/blog/my-post");

// Read-only
const { count } = usePageViews("/blog/my-post", { increment: false });
```

### Data Storage

| Environment | Storage           | Persistence            |
|-------------|-------------------|------------------------|
| Development | In-memory Map     | ❌ Resets on restart   |
| Production  | Vercel KV (Redis) | ✅ Persistent          |

Keys are stored as `pageviews:<slug>` (e.g., `pageviews:/blog/my-post`).
