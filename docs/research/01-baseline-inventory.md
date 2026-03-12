# Phase 1: Baseline Inventory — Summary

**Date**: 2026-03-12
**Status**: Complete

---

## Sub-Documents

| Document | Path | Lines |
|----------|------|-------|
| Side Effect Inventory | [`01-side-effect-inventory.md`](./01-side-effect-inventory.md) | 113 |
| Error Flow Analysis | [`01-error-flows.md`](./01-error-flows.md) | 596 |
| Test Coverage Gaps | [`01-test-gaps.md`](./01-test-gaps.md) | 383 |
| Dependency Graph | [`01-dependency-graph.md`](./01-dependency-graph.md) | 632 |

---

## Key Findings

### 1. Side Effect Profile

The codebase has **9 API route handlers** (all effectful) and **7 module-level singletons** that persist for the process lifetime:

| Singleton | Module | Risk |
|-----------|--------|------|
| `redisClient` | `lib/redis.ts` | Broken connection never recovered |
| `inMemoryStore` | `lib/redis.ts` | Unbounded growth in long-lived process |
| `githubCache` | `api/chat/route.ts` | Stale data for 5 min (acceptable) |
| `cachedPosts` | `blog/loader.ts` | Never invalidated (acceptable for build) |
| `oauthStateStore` | `lib/x/tokens.ts` | Entries auto-expire via setTimeout |
| `inMemoryStore` | `lib/x/cache.ts` | Soft TTL, no hard cap |
| `inMemoryCache` | `lib/x/oembed.ts` | Soft 24h TTL, no hard cap |

**External dependencies**: Redis (6 consumers), X API (4 endpoints), GitHub API (1), Resend email (2), AI gateway (1), filesystem (1).

### 2. Error Handling Quality

**Well-designed**: The X integration cluster (`lib/x/`) has a mature error model with `XIntegrationError`, typed error codes, and stale-cache fallback. The `toIntegrationError()` normalizer ensures consistent error shapes.

**Gaps identified**:
- **7 silent swallows** — errors caught and discarded without logging
- **8 untyped catches** — `catch (error)` with no type narrowing
- **11 missing error handlers** — async operations without try-catch that will produce unstructured 500s
- **1 XSS risk** — `message.replace(/\n/g, "<br>")` in contact route injects unsanitized HTML into emails
- **Critical blind spot**: `redis.ts:connect()` failure is never caught, and the broken client singleton is never invalidated

The most complex error flow is `BookmarksSyncService.getBookmarks()` — a 15-step orchestration with stale-cache fallback that has 2 unprotected repository calls before the try-catch block begins.

### 3. Test Coverage

| Metric | Value |
|--------|-------|
| Existing test files | 4 |
| Existing test cases | 13 |
| API routes with tests | 0 / 9 |
| Modules needing tests | 19 |
| Estimated new tests needed | ~106 |
| Framework | `node:test` (no Vitest/Jest) |
| `apps/www/package.json` test script | **Missing** — `turbo test` silently skips |

**Immediate blocker**: There is no `"test"` script in `apps/www/package.json`, so the Turborepo pipeline silently no-ops.

**Existing test helpers** (inline, not shared): `MemoryRepository`, `StubBookmarksClient`, `withEnv()`, factory functions for test data.

### 4. Architecture Quality

**Strengths**:
- **No circular dependencies** — the module graph is a clean DAG
- **Clean client/server separation** — `atoms.ts` + hooks are client-only; everything else is server-only
- **Well-encapsulated X cluster** — 9 modules with strict layering and a single external dependency (`lib/redis`)
- **No barrel exports** — explicit imports keep the dependency graph tree-shakeable

**Natural Effect.ts Layer boundaries** (10 identified):
1. `RedisLayer` — most depended-upon (6 consumers)
2. `XConfigLayer` — environment config
3. `XClientLayer` — X API client
4. `XCacheLayer` — persistence
5. `XTokenLayer` — OAuth token management
6. `XSyncLayer` — orchestration (composition root)
7. `EmailLayer` — Resend client
8. `BlogContentLayer` — MDX loader
9. `AnalyticsLayer` — click/view counting
10. `ChatLayer` — AI gateway + system prompt

**Inconsistency**: The blog loader lives at `app/(portfolio)/blog/loader.ts` rather than in `lib/`, making it the only non-UI library code outside `lib/`.

---

## Recommendations for Phase 2

Based on these findings, the Phase 2 feasibility spikes should prioritize:

1. **RedisLayer spike first** — highest consumer count, clearest boundary, and the broken-connection bug makes this the most impactful improvement
2. **Error model spike** — the existing `XIntegrationError` pattern is solid; investigate whether Effect's tagged errors can subsume it without regression
3. **Route handler spike** — the chat route (no error handling at all) is the riskiest handler; prove Effect.runPromise works there
4. **Schema coexistence** — 30+ Zod schemas in `contracts.ts` are working well; confirm gradual migration is viable
5. **Tracer spike** — custom span storage in Redis is a natural extension of the existing Redis infrastructure
