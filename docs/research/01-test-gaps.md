# Test Coverage Gap Analysis

**Date**: 2026-03-12
**Repo**: claycurry.com (Turborepo monorepo)
**Main app**: `apps/www/` (Next.js 16, React 19, App Router)

---

## 1. Current Test Infrastructure

### Test Framework

- **`node:test`** (Node.js built-in test runner) with **`node:assert/strict`**
- No Vitest, Jest, or any third-party test framework installed
- No test configuration files (no `vitest.config.ts`, `jest.config.ts`)
- No test utilities, fixtures, or shared mock libraries beyond what exists inline in test files

### Test Scripts

| Scope | Script | Status |
|-------|--------|--------|
| Root `package.json` | `"test": "turbo test"` | Defined |
| `turbo.json` | `"test": { "dependsOn": ["^build"] }` | Defined |
| `apps/www/package.json` | (none) | **Missing** -- Turbo will no-op for this workspace |

**Issue**: The `www` app has no `"test"` script in its `package.json`, so `turbo test` silently skips it. Tests can only be run manually via `node --test apps/www/lib/x/*.test.ts` (requires `--experimental-strip-types` or tsx).

### Existing Test Files (4 total)

All tests live in `apps/www/lib/x/` and use `node:test` + `node:assert/strict`:

| File | Tests | What's Covered |
|------|-------|----------------|
| `lib/x/service.test.ts` | 6 | `BookmarksSyncService.getBookmarks()`: fresh cache hit, stale fallback on token failure, reauth_required when no snapshot, token refresh flow, owner mismatch detection, legacy token promotion |
| `lib/x/client.test.ts` | 2 | `XIdentityVerifier.verify()` rejects wrong account; `XBookmarksOwnerResolver.resolve()` rejects user ID mismatch |
| `lib/x/contracts.test.ts` | 3 | `XOAuthTokenResponseSchema` rejects missing refresh_token; `NormalizedBookmarkSchema` enforces ISO timestamps; `BookmarksApiResponseSchema` accepts stale responses |
| `lib/x/config.test.ts` | 2 | `getXRuntimeConfig()` defaults owner username; enters live mode with full credentials |

**Total: 13 test cases**, all focused on the X/Twitter bookmarks integration layer.

### Test Helpers in Existing Tests

- `MemoryRepository` (in-memory `BookmarksSnapshotRepository` stub)
- `StubBookmarksClient` (fake `XBookmarksClient` with canned responses)
- `withEnv()` helper for safe env var manipulation
- `createBookmark()`, `createTokenRecord()`, `createSnapshot()` factory functions
- `jsonResponse()` helper for creating mock fetch responses

These are defined inline in test files and **not shared** as reusable fixtures.

---

## 2. Coverage Gap Matrix

### Untested Modules

| Module | Key Exports | Test Difficulty | Priority | Gap Description |
|--------|-------------|-----------------|----------|-----------------|
| `app/api/chat/route.ts` | `POST` handler, `fetchGitHubData()` | Hard | Critical | AI chat endpoint -- streaming, external APIs, caching, blog context mode |
| `app/api/views/route.ts` | `GET`, `POST`, `getViewCount()`, `incrementViewCount()` | Medium | Critical | Page view tracking with Redis fallback, cookie dedup |
| `app/api/clicks/route.ts` | `GET`, `POST` | Medium | Critical | Click tracking with Redis multi/exec transactions, in-memory fallback |
| `app/api/contact/route.ts` | `POST` | Medium | High | Contact form with Resend email integration |
| `app/api/feedback/route.ts` | `POST` | Medium | High | Page feedback with Resend email integration |
| `app/api/x/auth/route.ts` | `GET` | Hard | High | OAuth PKCE initiation, crypto, Redis state storage |
| `app/api/x/callback/route.ts` | `GET` | Hard | High | OAuth callback, token exchange, identity verification, owner matching |
| `app/api/x/bookmarks/route.ts` | `GET` | Medium | High | Delegates to `BookmarksSyncService`, error wrapping |
| `app/api/x/bookmarks/status/route.ts` | `GET` | Medium | Medium | Auth-gated status endpoint |
| `lib/redis.ts` | `getRedisClient()`, `getInMemoryStore()`, `keyPrefix()` | Easy | Critical | Redis connection singleton, env-based key prefixing, in-memory fallback |
| `lib/x/tokens.ts` | `XTokenStore` class | Medium | Critical | Token exchange, refresh, legacy promotion, error-triggered deletion |
| `lib/x/cache.ts` | `BookmarksSnapshotRepository` | Medium | High | Redis-backed cache with Zod validation, TTL, legacy migration |
| `lib/x/errors.ts` | `XIntegrationError`, `toIntegrationError()`, `toIntegrationIssue()` | Easy | Medium | Error normalization and classification |
| `lib/x/oembed.ts` | `fetchOEmbed()`, `fetchOEmbedBatch()` | Medium | Medium | oEmbed fetching with Redis cache, batch concurrency control |
| `lib/x/runtime.ts` | `createBookmarksSyncService()` | Easy | Low | Factory function, thin wiring |
| `lib/navigation.ts` | `getSiteNavLinks()` | Easy | Low | Static nav link array |
| `lib/portfolio-data.ts` | `profileData`, `resumeData`, etc. | Easy | Low | Static data exports |
| `app/(portfolio)/blog/loader.ts` | `getAllPostsMetadata()`, `getPost()`, `getPostContent()` | Medium | High | MDX blog loader with filesystem reads, caching, production filtering |
| `lib/db/index.ts` | `ChatDatabase`, `db` | Hard | Low | Dexie/IndexedDB (browser-only, needs jsdom/happy-dom) |

---

## 3. Detailed Gap Analysis per Module

### 3.1 `lib/redis.ts` -- Priority: Critical, Difficulty: Easy

**Exports**: `getRedisClient()`, `getInMemoryStore()`, `keyPrefix()`

| Scenario | Type | Notes |
|----------|------|-------|
| `keyPrefix()` returns `"prod:"` when `VERCEL_ENV=production` | Happy path | Pure env check |
| `keyPrefix()` returns `"preview:"` when `VERCEL_ENV=preview` | Happy path | |
| `keyPrefix()` returns `"dev:"` when `VERCEL_ENV=development` | Happy path | |
| `keyPrefix()` returns `"dev:"` when `VERCEL_ENV` unset, `NODE_ENV=development` | Edge case | Fallback logic |
| `keyPrefix()` returns `"dev:"` when both env vars unset | Edge case | Default fallback |
| `getRedisClient()` returns `null` when `KV_REST_API_REDIS_URL` unset | Happy path | |
| `getRedisClient()` reuses singleton on second call | Edge case | Module-level `redisClient` var |
| `getInMemoryStore()` returns the shared Map | Happy path | |

### 3.2 `lib/x/tokens.ts` -- Priority: Critical, Difficulty: Medium

**Exports**: `XTokenStore`, `oauthStateStore`

| Scenario | Type | Notes |
|----------|------|-------|
| `getTokenForSync()` returns stored token when valid and owner matches | Happy path | Needs mock repository |
| `getTokenForSync()` refreshes token when near expiry | Happy path | Mock fetch for token endpoint |
| `getTokenForSync()` throws `reauth_required` when no tokens exist | Error path | |
| `getTokenForSync()` throws `owner_mismatch` when stored owner differs | Error path | |
| `getTokenForSync()` deletes token on `reauth_required` refresh failure | Error path | Verify side effect |
| `getTokenForSync()` promotes legacy token when no owner-scoped token exists | Happy path | Legacy migration path |
| `exchangeAuthorizationCode()` calls token endpoint with correct params | Happy path | |
| `exchangeAuthorizationCode()` throws on non-OK response | Error path | |
| `exchangeAuthorizationCode()` throws `schema_invalid` on non-JSON response | Error path | |
| `storeVerifiedToken()` persists record via repository | Happy path | |
| `requestToken()` sends Basic auth header | Edge case | Verify header format |
| Concurrent `getTokenForSync()` calls (race condition on refresh) | Edge case | No locking mechanism exists |

### 3.3 `app/api/views/route.ts` -- Priority: Critical, Difficulty: Medium

**Exports**: `GET`, `POST`

| Scenario | Type | Notes |
|----------|------|-------|
| `GET` returns count for a valid slug | Happy path | |
| `GET` returns 400 when slug is missing | Error path | |
| `GET` returns 0 for unknown slug | Edge case | |
| `POST` increments count for new visitor | Happy path | |
| `POST` returns `duplicate: true` for repeated visit (cookie present) | Happy path | Cookie dedup |
| `POST` returns 400 for missing slug | Error path | |
| `POST` returns 400 for invalid JSON body | Error path | |
| `POST` caps viewed_pages cookie at 100 entries | Edge case | Overflow behavior |
| `POST` handles malformed cookie gracefully | Edge case | JSON parse failure in cookie |
| Redis failure falls back to in-memory store | Error path | Both GET and POST |
| Empty string slug | Edge case | Accepted or rejected? |

### 3.4 `app/api/clicks/route.ts` -- Priority: Critical, Difficulty: Medium

**Exports**: `GET`, `POST`

| Scenario | Type | Notes |
|----------|------|-------|
| `GET` returns all click counts from Redis | Happy path | |
| `GET` falls back to in-memory when Redis unavailable | Error path | |
| `GET` falls back to in-memory when Redis throws | Error path | |
| `POST` increments counts for array of ids | Happy path | |
| `POST` handles duplicate ids in array (tally logic) | Edge case | |
| `POST` returns 400 for missing/empty ids array | Error path | |
| `POST` returns 400 for invalid JSON body | Error path | |
| `POST` falls back to in-memory on Redis transaction failure | Error path | |
| `POST` handles `NaN` from Redis result | Edge case | Explicit `NaN` check in code |
| `POST` with Redis multi returning null results | Edge case | |

### 3.5 `app/api/contact/route.ts` -- Priority: High, Difficulty: Medium

**Exports**: `POST`

| Scenario | Type | Notes |
|----------|------|-------|
| Valid submission sends email and returns success | Happy path | Mock Resend |
| Missing name/email/message returns 400 | Error path | 3 required fields |
| Resend API error returns 500 | Error path | |
| Invalid JSON body returns 500 (caught by outer try/catch) | Error path | |
| XSS in message field (HTML injection in email body) | Edge case | `message.replace(/\n/g, "<br>")` -- no sanitization |
| Very long message body | Edge case | No length validation |

### 3.6 `app/api/feedback/route.ts` -- Priority: High, Difficulty: Medium

**Exports**: `POST`

| Scenario | Type | Notes |
|----------|------|-------|
| Valid positive feedback sends email | Happy path | |
| Valid negative feedback sends email | Happy path | |
| Missing page or sentiment returns 400 | Error path | |
| Invalid sentiment value returns 400 | Error path | |
| Resend API error returns 500 | Error path | |
| Feedback with optional message field | Edge case | |
| XSS in message field | Edge case | Same HTML injection concern as contact |

### 3.7 `app/api/chat/route.ts` -- Priority: Critical, Difficulty: Hard

**Exports**: `POST`, `fetchGitHubData()`

| Scenario | Type | Notes |
|----------|------|-------|
| General chat returns streaming response | Happy path | Needs AI SDK mocking |
| Blog-context chat includes article content | Happy path | Needs MDX loader mock |
| Blog-context with invalid slug falls back to base prompt | Edge case | |
| GitHub data is cached for 5 minutes | Edge case | TTL behavior |
| GitHub API failure returns empty string (graceful degradation) | Error path | |
| GitHub API rate limiting (no token vs with token) | Edge case | |
| Invalid/missing messages in request body | Error path | No input validation |
| Max duration of 30 seconds | Edge case | Timeout behavior |

### 3.8 `app/api/x/auth/route.ts` -- Priority: High, Difficulty: Hard

**Exports**: `GET`

| Scenario | Type | Notes |
|----------|------|-------|
| Valid request generates PKCE and redirects to X | Happy path | Crypto, Redis |
| Missing `X_OWNER_SECRET` returns 500 | Error path | |
| Wrong secret returns 401 | Error path | |
| Missing `X_CLIENT_ID`/`X_CLIENT_SECRET` returns 500 | Error path | |
| OAuth state stored in Redis with 300s TTL | Edge case | |
| Fallback to in-memory state store | Edge case | |

### 3.9 `app/api/x/callback/route.ts` -- Priority: High, Difficulty: Hard

**Exports**: `GET`

| Scenario | Type | Notes |
|----------|------|-------|
| Valid callback exchanges code, verifies identity, stores token, redirects home | Happy path | Multi-step flow |
| OAuth error parameter returns 400 | Error path | |
| Missing code or state returns 400 | Error path | |
| Expired/invalid state returns 400 | Error path | |
| Non-live config returns 500 | Error path | |
| Owner mismatch between authenticated and resolved users returns 403 | Error path | |
| Token exchange failure returns appropriate error status | Error path | |

### 3.10 `lib/x/cache.ts` (non-test-covered parts) -- Priority: High, Difficulty: Medium

The existing tests use `MemoryRepository` stubs. The real `BookmarksSnapshotRepository` class with Redis integration is **untested**.

| Scenario | Type | Notes |
|----------|------|-------|
| `getValidated()` returns null for missing key | Happy path | |
| `getValidated()` deletes and returns null for malformed JSON | Error path | Corrupt cache cleanup |
| `getValidated()` deletes and returns null for schema-invalid data | Error path | Schema evolution |
| `setValidated()` serializes through Zod schema | Happy path | |
| `migrateLegacySnapshot()` promotes legacy bookmarks to v2 format | Happy path | Migration path |
| `migrateLegacySnapshot()` returns null when no legacy data exists | Edge case | |
| In-memory TTL expiration removes entries | Edge case | `expiresAt` check in `getRaw()` |
| `scopedKey()` lowercase-encodes owner username | Edge case | Case normalization |
| Concurrent reads/writes to same key | Edge case | No locking |

### 3.11 `lib/x/errors.ts` -- Priority: Medium, Difficulty: Easy

| Scenario | Type | Notes |
|----------|------|-------|
| `toIntegrationError()` passes through `XIntegrationError` unchanged | Happy path | |
| `toIntegrationError()` wraps standard `Error` with fallback code | Happy path | |
| `toIntegrationError()` wraps non-Error value | Edge case | String, null, undefined |
| `toIntegrationIssue()` returns `{ code, message }` object | Happy path | |
| `XIntegrationError` preserves cause chain | Edge case | |

### 3.12 `lib/x/oembed.ts` -- Priority: Medium, Difficulty: Medium

| Scenario | Type | Notes |
|----------|------|-------|
| `fetchOEmbed()` returns parsed response for valid tweet URL | Happy path | Mock fetch |
| `fetchOEmbed()` returns null on non-OK response | Error path | |
| `fetchOEmbedBatch()` returns cached results without re-fetching | Happy path | |
| `fetchOEmbedBatch()` fetches uncached items in batches of 8 | Happy path | Concurrency limit |
| `fetchOEmbedBatch()` logs and continues on individual fetch failure | Error path | `Promise.allSettled` |
| In-memory cache TTL expiration | Edge case | |
| Empty bookmarks array input | Edge case | |

### 3.13 `app/(portfolio)/blog/loader.ts` -- Priority: High, Difficulty: Medium

| Scenario | Type | Notes |
|----------|------|-------|
| `getAllPostsMetadata()` returns sorted posts | Happy path | Needs blog dir fixture |
| `getAllPostsMetadata()` filters unpublished in production | Happy path | `NODE_ENV` check |
| `getAllPostsMetadata()` includes unpublished in development | Happy path | |
| `getAllPostsMetadata()` caches result on second call | Edge case | Module-level `cachedPosts` |
| `getPostMetadata()` reads frontmatter from MDX file | Happy path | |
| `getPost()` throws for non-existent slug | Error path | |
| `getPostContent()` returns null for non-existent slug | Error path | Graceful null return |
| `calculateReadTime()` returns minimum 1 minute | Edge case | Empty/short content |
| Blog directory missing or empty | Edge case | Filesystem error |

### 3.14 `lib/navigation.ts` -- Priority: Low, Difficulty: Easy

| Scenario | Type | Notes |
|----------|------|-------|
| `getSiteNavLinks()` returns all 5 nav links | Happy path | Static array |
| Links have correct href values | Happy path | Snapshot test |

### 3.15 `lib/portfolio-data.ts` -- Priority: Low, Difficulty: Easy

| Scenario | Type | Notes |
|----------|------|-------|
| All exports have expected shape | Happy path | Type-level already enforced |
| Social URLs are valid | Edge case | Optional URL validation |

---

## 4. Prioritized Testing Roadmap

### Tier 1: Critical (production failure risk) -- Implement First

| # | Module | Tests Needed | Effort | Rationale |
|---|--------|-------------|--------|-----------|
| 1 | `lib/redis.ts` | 8 | 1h | Foundation for all API routes; `keyPrefix()` is pure, easy win |
| 2 | `lib/x/tokens.ts` | 12 | 3h | Token refresh bugs = complete X integration outage; existing test stubs can be extracted |
| 3 | `app/api/views/route.ts` | 11 | 2h | Public-facing, runs on every page view, cookie logic is subtle |
| 4 | `app/api/clicks/route.ts` | 10 | 2h | Redis transaction logic with `NaN` guard, fallback paths |
| 5 | `app/api/chat/route.ts` | 8 | 4h | Core feature; streaming + external APIs require careful mocking |

### Tier 2: High (data integrity) -- Implement Second

| # | Module | Tests Needed | Effort | Rationale |
|---|--------|-------------|--------|-----------|
| 6 | `lib/x/cache.ts` | 9 | 2h | Schema validation + legacy migration; corrupt data = silent failures |
| 7 | `app/(portfolio)/blog/loader.ts` | 8 | 2h | Blog content serving; caching + production filter logic |
| 8 | `app/api/contact/route.ts` | 6 | 1h | Contact form; HTML injection risk in email body |
| 9 | `app/api/feedback/route.ts` | 6 | 1h | Same pattern as contact |
| 10 | `app/api/x/auth/route.ts` | 6 | 2h | OAuth initiation; crypto + state management |
| 11 | `app/api/x/callback/route.ts` | 7 | 3h | OAuth callback; most complex error handling in codebase |
| 12 | `app/api/x/bookmarks/route.ts` | 3 | 1h | Thin wrapper, but error response shape matters |

### Tier 3: Medium (UX impact) -- Implement Third

| # | Module | Tests Needed | Effort | Rationale |
|---|--------|-------------|--------|-----------|
| 13 | `lib/x/errors.ts` | 5 | 30m | Small module, easy to test, used everywhere |
| 14 | `lib/x/oembed.ts` | 7 | 1.5h | Batch fetching + caching; failure isolation |
| 15 | `app/api/x/bookmarks/status/route.ts` | 4 | 1h | Auth-gated, low traffic |

### Tier 4: Low (cosmetic / static) -- Optional

| # | Module | Tests Needed | Effort | Rationale |
|---|--------|-------------|--------|-----------|
| 16 | `lib/x/runtime.ts` | 1 | 15m | Factory function; integration tested via service tests |
| 17 | `lib/navigation.ts` | 2 | 15m | Static data |
| 18 | `lib/portfolio-data.ts` | 1 | 15m | Static data, type system handles shape |
| 19 | `lib/db/index.ts` | 0 | N/A | Browser-only Dexie DB; test in E2E if needed |

---

## 5. Infrastructure Recommendations

### Immediate Actions

1. **Add `"test"` script to `apps/www/package.json`**: Without it, `turbo test` does nothing.
   ```json
   "test": "node --experimental-strip-types --test lib/x/*.test.ts"
   ```
   Or adopt a test runner like Vitest that handles TypeScript natively.

2. **Extract shared test utilities**: The `MemoryRepository`, `StubBookmarksClient`, `withEnv()`, and factory functions in `service.test.ts` should be moved to a `lib/x/__test-utils__/` or `lib/x/testing.ts` module for reuse.

3. **Consider Vitest**: The codebase is already TypeScript-first. Vitest would provide:
   - Native TS/ESM support without `--experimental-strip-types`
   - Built-in mocking (`vi.mock`, `vi.fn`, `vi.spyOn`)
   - Watch mode for development
   - Coverage reporting
   - Compatible with existing `assert` style if desired

### Mocking Strategy

| Dependency | Mocking Approach |
|------------|-----------------|
| Redis client | Use `MemoryRepository` pattern (already proven) or mock `getRedisClient()` to return null |
| Resend API | Mock `resend.emails.send()` return value |
| `fetch` (GitHub, X API) | Inject `fetchImpl` parameter (pattern already used in X modules) |
| AI SDK (`streamText`) | Mock module or use test doubles |
| Filesystem (`fs`) | Create temp blog dir with fixture MDX files |
| `next/server` (`NextRequest`, `NextResponse`) | Construct real objects or use minimal stubs |
| Environment variables | Use `withEnv()` helper (already exists) |

---

## 6. Summary

| Metric | Value |
|--------|-------|
| Total test files | 4 |
| Total test cases | 13 |
| Modules with tests | 4 (all in `lib/x/`) |
| Modules needing tests | 19 |
| Estimated total new tests | ~106 |
| Estimated total effort | ~27 hours |
| API routes with zero tests | 9/9 (100%) |
| Lib modules with zero tests | 7/11 non-x modules (64%) |
| `lib/x/` modules untested | 4/10 (tokens, cache real impl, errors, oembed) |

The X bookmarks integration has good foundational test coverage for the service orchestration layer. The largest gaps are in:
1. **All API route handlers** (zero coverage)
2. **Redis/data layer** (`redis.ts`, `cache.ts` real implementation, `tokens.ts`)
3. **Blog content loader** (filesystem-dependent, caching, production filtering)
