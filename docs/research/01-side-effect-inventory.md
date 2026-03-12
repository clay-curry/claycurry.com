# Side Effect Inventory

**Date**: 2026-03-12
**Scope**: API route handlers (`apps/www/app/api/`), library modules (`lib/redis.ts`, `lib/x/`, `lib/db/`, blog loader, portfolio data)

## Methodology

Every exported function and route handler in the target directories was read in full. For each, I cataloged: external network calls, mutations to module-level singletons or persistent stores (Redis, IndexedDB, cookies, localStorage), and error handling behavior (thrown, caught-and-returned, or silently swallowed). Pure Zod schema definitions and type-only modules are excluded.

---

## API Route Handlers

| Module | Function | External Call | State Mutation | Error Handling | Notes |
|--------|----------|--------------|----------------|----------------|-------|
| `app/api/chat/route.ts` | `POST` | **GitHub API**: fetches `api.github.com/users/{user}` and `/repos` (via `fetchGitHubData`). **AI Gateway**: `streamText()` with grok-3-mini primary, Claude/GPT fallbacks via Vercel AI SDK gateway. **Perplexity**: optional web search tool. | Writes to module-level `githubCache` singleton (`{ data, timestamp }`) with 5-min TTL. | GitHub fetch errors: caught, `console.error`, returns empty string (silently degraded). AI streaming errors: **not caught** -- propagate to caller/framework. | `maxDuration = 30` exported. Blog-context mode calls `getPostContent(slug)` which reads filesystem synchronously. |
| `app/api/contact/route.ts` | `POST` | **Resend**: `resend.emails.send()` to `contactData.email`. | None. | Resend SDK error: caught, `console.error`, returns 500 JSON. Outer try/catch: `console.error`, returns 500. Missing fields: returns 400. | Resend client instantiated per request (not singleton). |
| `app/api/feedback/route.ts` | `POST` | **Resend**: `resend.emails.send()` to `contactData.email`. | None. | Same pattern as contact: Resend error logged + 500; outer catch logged + 500; missing fields 400; invalid sentiment 400. | Resend client instantiated per request. |
| `app/api/views/route.ts` | `GET` | **Redis**: `client.get()` for pageview count. | None (read-only). | Redis error: `console.error`, falls back to in-memory store. Missing slug: returns 400. | |
| `app/api/views/route.ts` | `POST` | **Redis**: `client.incr()` for pageview count. | **Redis**: increments `{prefix}pageviews:{slug}`. **In-memory Map**: fallback increment. **Cookie**: sets `viewed_pages` (httpOnly, 24h TTL, JSON array, capped at 100 slugs). | Redis error: `console.error`, falls back to in-memory increment. Cookie parse error: **silently swallowed** (treated as empty). Outer catch: returns 400 "Invalid request body". | Deduplication via cookie; duplicate views return count without incrementing. |
| `app/api/clicks/route.ts` | `GET` | **Redis**: `client.hGetAll()` on `{prefix}clicks` hash. | None (read-only). | Redis error: `console.error`, falls back to in-memory store. | |
| `app/api/clicks/route.ts` | `POST` | **Redis**: `client.multi()` with `hIncrBy()` in transaction. | **Redis**: increments fields in `{prefix}clicks` hash. **In-memory Map**: fallback increment. | Redis transaction error: `console.error`, falls back to in-memory. Invalid result from Redis: throws Error (caught by inner catch). Outer catch (bad JSON body): returns 400. | Tallies duplicate IDs before incrementing. |
| `app/api/x/auth/route.ts` | `GET` | **Redis**: `client.set()` to store OAuth PKCE code verifier. | **Redis**: sets `{prefix}x:oauth:{state}` with 300s TTL. **In-memory Map**: `oauthStateStore.set()` fallback with `setTimeout` to delete after 300s. | Missing `X_OWNER_SECRET`: returns 500. Bad/missing secret: returns 401. Missing client credentials: returns 500. Redis errors: **not caught** (will propagate as 500). | Generates PKCE code_verifier + challenge via `crypto`. Redirects to `x.com/i/oauth2/authorize`. |
| `app/api/x/callback/route.ts` | `GET` | **Redis**: get + delete OAuth state key. **X OAuth API**: token exchange via `XTokenStore.exchangeAuthorizationCode()` (POST to `api.x.com/2/oauth2/token`). **X API**: identity verification via `getAuthenticatedUser` + `getUserByUsername` (GET `api.x.com/2/users/me` and `/users/by/username/`). | **Redis**: deletes OAuth state key; stores token record and sync status via `BookmarksSnapshotRepository`. **In-memory Map**: `oauthStateStore.delete()` fallback; `inMemoryStore` in cache.ts fallback. | OAuth error param: returns 400. Missing code/state: 400. Expired state: 400. Non-live config: 500. Token exchange / identity errors: caught via `toIntegrationError`, mapped to 400/403/500 based on error code. | On success, redirects to `/`. Writes both token record and sync status record to Redis. |
| `app/api/x/bookmarks/route.ts` | `GET` | **Redis** (via repository): snapshot get/set, status get/set, token get. **X API**: bookmarks, folders, user identity (via `BookmarksSyncService.getBookmarks`). | **Redis**: updates snapshot and status records on successful sync. **In-memory Map**: fallback for all Redis operations. | Outer catch: `console.error`, returns 500 with schema-validated empty response. Inner errors handled by `BookmarksSyncService` (see service.ts below). | Delegates entirely to `createBookmarksSyncService().getBookmarks()`. |
| `app/api/x/bookmarks/status/route.ts` | `GET` | **Redis** (via repository): reads snapshot, status, and token records. | None (read-only). | Missing `X_OWNER_SECRET`: 500. Bad secret: 401. Service error: `console.error`, returns 500. | Auth-gated by `X_OWNER_SECRET` query param. |

---

## Library Modules

| Module | Function | External Call | State Mutation | Error Handling | Notes |
|--------|----------|--------------|----------------|----------------|-------|
| `lib/redis.ts` | `getRedisClient()` | **Redis**: `createClient().connect()` on first call. | Module singleton `redisClient` (lazy-initialized, persists for process lifetime). | Redis client `error` event: `console.error` (listener only). Returns `null` if `KV_REST_API_REDIS_URL` unset. | Single connection reused across all callers. |
| `lib/redis.ts` | `getInMemoryStore()` | None. | Returns reference to module singleton `inMemoryStore` (`Map<string, number>`). | None. | Callers mutate the Map directly. |
| `lib/redis.ts` | `keyPrefix()` | None. | None (pure). | None. | Reads `VERCEL_ENV` / `NODE_ENV` env vars. |
| `lib/x/tokens.ts` | `oauthStateStore` | None. | Module singleton `Map<string, string>`. | N/A (just a Map export). | Used by auth/callback routes for PKCE state. Entries deleted via `setTimeout` or explicitly in callback. |
| `lib/x/tokens.ts` | `XTokenStore.getTokenForSync()` | **X OAuth API**: may refresh token (POST `api.x.com/2/oauth2/token`). **X API**: identity verification callback. | **Redis/in-memory**: reads, writes, and potentially deletes token records via repository. | Missing token: throws `XIntegrationError("reauth_required")`. Owner mismatch: deletes token, throws `XIntegrationError("owner_mismatch")`. Refresh failure with discard-worthy error: deletes stored token, re-throws. | May trigger legacy token promotion (read legacy, refresh, write new, delete legacy). |
| `lib/x/tokens.ts` | `XTokenStore.exchangeAuthorizationCode()` | **X OAuth API**: POST `api.x.com/2/oauth2/token` with authorization_code grant. | None directly (caller stores result). | Non-OK response: throws `XIntegrationError("reauth_required")`. Non-JSON response: throws `XIntegrationError("schema_invalid")`. Invalid payload shape: throws `XIntegrationError("schema_invalid")`. | |
| `lib/x/tokens.ts` | `XTokenStore.storeVerifiedToken()` | None directly. | **Redis/in-memory**: writes token record via `repository.setTokenRecord()`. | Zod validation errors propagate from `XTokenRecordSchema.parse()`. | |
| `lib/x/cache.ts` | `BookmarksSnapshotRepository` (all methods) | **Redis**: get/set/del operations via `getRedisClient()`. | **Redis**: CRUD on keys `{prefix}x:v2:{owner}:{suffix}` for tokens, snapshots, status. **Module singleton** `inMemoryStore` (`Map<string, {value, expiresAt?}>`): fallback for all Redis ops. | `getValidated()`: JSON parse or Zod validation failure: `console.error`, deletes corrupted key, returns `null`. Redis errors from `getRedisClient()`: propagate. | Legacy migration: reads from `x:` keyspace, writes to `x:v2:` keyspace on first access. TTL-based expiry for in-memory entries. |
| `lib/x/client.ts` | `XBookmarksClient.getAuthenticatedUser()` | **X API**: GET `api.x.com/2/users/me`. | None. | 401/403: throws `XIntegrationError("reauth_required")`. Other HTTP errors: throws `XIntegrationError("upstream_error")`. Non-JSON: throws `XIntegrationError("schema_invalid")`. Contract mismatch: throws `XIntegrationError("schema_invalid")`. | |
| `lib/x/client.ts` | `XBookmarksClient.getUserByUsername()` | **X API**: GET `api.x.com/2/users/by/username/{username}`. | None. | Same error pattern as `getAuthenticatedUser`. | |
| `lib/x/client.ts` | `XBookmarksClient.fetchAllBookmarks()` | **X API**: GET `api.x.com/2/users/{id}/bookmarks` (paginated). | None. | Same HTTP/schema error pattern. Pagination continues until no `next_token`. | |
| `lib/x/client.ts` | `XBookmarksClient.fetchBookmarksByFolder()` | **X API**: GET `api.x.com/2/users/{id}/bookmarks/folders/{folderId}/tweets` (paginated). | None. | Same error pattern. | |
| `lib/x/client.ts` | `XBookmarksClient.fetchBookmarkFolders()` | **X API**: GET `api.x.com/2/users/{id}/bookmarks/folders`. | None. | 403/404: **silently returns empty array** (not an error). Other errors: same pattern. | Graceful degradation for accounts without folder access. |
| `lib/x/client.ts` | `XBookmarksOwnerResolver.resolve()` | **X API**: via `client.getUserByUsername()`. | None. | Owner ID mismatch with configured `X_OWNER_USER_ID`: throws `XIntegrationError("owner_mismatch")`. | |
| `lib/x/client.ts` | `XIdentityVerifier.verify()` | **X API**: via `client.getAuthenticatedUser()`. | None. | Username mismatch: throws `XIntegrationError("owner_mismatch")`. | |
| `lib/x/service.ts` | `BookmarksSyncService.getBookmarks()` | **Redis** (via repository): snapshot/status/token CRUD. **X API** (via client): bookmarks, folders, identity. **X OAuth** (via token store): token refresh. | **Redis/in-memory**: writes fresh snapshot and updated status record on success. On error with stale snapshot: writes stale status. On error without snapshot: writes failure status. | Catches all errors via `toIntegrationError()`. Stale snapshot available: returns 200 with `status: "stale"`. No snapshot: returns mapped HTTP status (502, 503, 409). Always writes status record regardless of outcome. | Core orchestrator; most complex error recovery logic in the codebase. |
| `lib/x/service.ts` | `BookmarksSyncService.getStatus()` | **Redis** (via repository): reads snapshot, status, token records in parallel. | None (read-only). | Errors propagate (no try/catch). | |
| `lib/x/runtime.ts` | `createBookmarksSyncService()` | None directly. | None (factory function). | None. | Wires together config, repository, client, and service. |
| `lib/x/config.ts` | `getXRuntimeConfig()` | None. | None (pure). | Zod parse of `process.env` may throw on invalid env schema. | |
| `lib/x/config.ts` | `assertLiveRuntimeConfig()` | None. | None. | Throws plain `Error` if credentials missing. | |
| `lib/x/errors.ts` | `toIntegrationError()` | None. | None (pure). | Normalizes any error into `XIntegrationError`. | |
| `lib/x/errors.ts` | `toIntegrationIssue()` | None. | None (pure). | Normalizes any error into `IntegrationIssue` object. | |
| `lib/x/oembed.ts` | `fetchOEmbed()` | **X/Twitter oEmbed**: GET `publish.x.com/oembed`. | None. | Non-OK response: returns `null` (silently swallowed). | |
| `lib/x/oembed.ts` | `fetchOEmbedBatch()` | **Redis**: cache reads/writes via `getCachedOEmbed`/`setCachedOEmbed`. **X/Twitter oEmbed**: batch fetches with concurrency limit of 8. | **Redis**: sets oEmbed cache entries with 24h TTL. **Module singleton** `inMemoryCache` (`Map<string, {data, expiresAt}>`): fallback. | Individual fetch failures in `Promise.allSettled`: `console.error` per rejection, **silently skipped** (other bookmarks still processed). | Cache-first strategy; uncached items fetched in batches. |
| `lib/x/atoms.ts` | `atomWithStorage` atoms | None. | **localStorage**: persists sort field, sort order, folder selection, viewed bookmarks via Jotai `atomWithStorage`. | N/A (Jotai handles serialization). | Client-side only (`"use client"`). |
| `lib/x/contracts.ts` | (all exports) | None. | None. | N/A. | Pure Zod schemas and type definitions. No side effects. |

---

## Client-Side Modules

| Module | Function | External Call | State Mutation | Error Handling | Notes |
|--------|----------|--------------|----------------|----------------|-------|
| `lib/db/index.ts` | `db` (export) | **IndexedDB**: Dexie creates/opens `portfolio-chat` database. | **IndexedDB**: `messages` table with schema migrations (v1 -> v2 adds `context` field). | Migration errors: handled by Dexie internally. | Client-side only. Singleton database instance. v2 migration sets `context = "general"` on existing messages. |

---

## Pure Data Modules (No Side Effects)

| Module | Function | External Call | State Mutation | Error Handling | Notes |
|--------|----------|--------------|----------------|----------------|-------|
| `lib/portfolio-data.ts` | All exports (`profileData`, `contactData`, `resumeData`, etc.) | None. | None. | None. | Hardcoded `const` objects. Consumed by chat system prompt and contact/feedback routes. |

---

## Blog Loader

| Module | Function | External Call | State Mutation | Error Handling | Notes |
|--------|----------|--------------|----------------|----------------|-------|
| `app/(portfolio)/blog/loader.ts` | `getPostMetadata()` | **Filesystem**: `fs.readFileSync()` on `blog/{slug}.mdx`. | None. | Throws if file missing (uncaught `readFileSync` error). | Synchronous I/O. |
| `app/(portfolio)/blog/loader.ts` | `getAllPostsMetadata()` | **Filesystem**: `fs.readdirSync()` + `fs.readFileSync()` per post. | Module singleton `cachedPosts` (`PostMetadata[] | null`): populated on first call, reused thereafter. | Throws on filesystem errors (uncaught). | In production, filters out `published: false` posts. Cache never invalidated (process-lifetime). |
| `app/(portfolio)/blog/loader.ts` | `getPost()` | **Filesystem**: `fs.readFileSync()`. **Dynamic import**: `import(@/blog/${slug}.mdx)`. | None (reads `cachedPosts` singleton via `getAllPostsMetadata`). | Throws `Error("Post not found: {slug}")` if slug not in metadata. Filesystem/import errors propagate. | Async due to dynamic MDX import. |
| `app/(portfolio)/blog/loader.ts` | `getPostContent()` | **Filesystem**: `fs.readFileSync()`. | None. | All errors: **silently caught**, returns `null`. | Used by chat route for article context. Intentionally graceful. |

---

## Summary of Module-Level Singletons

| Singleton | Location | Type | Lifetime |
|-----------|----------|------|----------|
| `redisClient` | `lib/redis.ts` | Redis client connection | Process |
| `inMemoryStore` | `lib/redis.ts` | `Map<string, number>` | Process |
| `githubCache` | `app/api/chat/route.ts` | `{ data: string; timestamp: number }` | Process (5-min TTL, soft) |
| `cachedPosts` | `blog/loader.ts` | `PostMetadata[]` | Process (never invalidated) |
| `oauthStateStore` | `lib/x/tokens.ts` | `Map<string, string>` | Process (entries expire via setTimeout) |
| `inMemoryStore` | `lib/x/cache.ts` | `Map<string, { value, expiresAt? }>` | Process (entries have soft TTL) |
| `inMemoryCache` | `lib/x/oembed.ts` | `Map<string, { data, expiresAt }>` | Process (24h soft TTL) |
| `db` | `lib/db/index.ts` | Dexie database instance | Browser tab (client-side) |
| Jotai atoms | `lib/x/atoms.ts` | `atomWithStorage` | Browser (localStorage-persisted, client-side) |

## Summary of Silently Swallowed Errors

1. **`app/api/chat/route.ts` -- `fetchGitHubData()`**: GitHub API failures return `""` after logging. Chat continues without GitHub context.
2. **`app/api/views/route.ts` -- `POST`**: Malformed `viewed_pages` cookie silently treated as empty (bare `catch {}`).
3. **`lib/x/client.ts` -- `fetchBookmarkFolders()`**: 403/404 responses silently return `[]`.
4. **`lib/x/oembed.ts` -- `fetchOEmbed()`**: Non-OK HTTP responses return `null`.
5. **`lib/x/oembed.ts` -- `fetchOEmbedBatch()`**: Individual fetch rejections logged but skipped.
6. **`lib/x/cache.ts` -- `getValidated()`**: Invalid JSON or Zod failures logged, corrupted key deleted, returns `null`.
7. **`app/(portfolio)/blog/loader.ts` -- `getPostContent()`**: All errors caught, returns `null`.
