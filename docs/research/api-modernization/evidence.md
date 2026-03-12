# API Modernization Evidence Appendix

Date: 2026-03-12
Status: supporting
Type: evidence
Audience: engineering team
Topic: api-modernization
Canonical: no

Source scope: `apps/www/app/api/*`, `apps/www/lib/*`, package manifests, and Turbo config

## Method

This appendix normalizes the repo findings into subsystem-level and route-level evidence. Each entry records:

- current behavior
- technical debt category
- risk level
- file/line evidence
- impact on `Effect`
- impact on testing
- impact on trace/logging

## Normalized Findings Table

| ID | Subsystem | Finding | Debt category | Risk | Evidence | Impact on `Effect` | Impact on testing | Impact on trace/logging |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F1 | Chat | Server trusts caller-provided `model` and forwards it to `gateway(model)` | boundary validation | High | `apps/www/app/api/chat/route.ts:221-231`, `apps/www/app/api/chat/route.ts:268-286`, `apps/www/lib/chat/models.ts:1-9` | model policy is not represented as a typed contract | route behavior can change with arbitrary client inputs | no stable error tag for invalid model selection |
| F2 | Chat | Route combines request parsing, blog lookup, GitHub fetch, prompt build, and stream startup | module boundary | Medium-High | `apps/www/app/api/chat/route.ts:31-115`, `apps/www/app/api/chat/route.ts:220-291`, `apps/www/app/(portfolio)/blog/loader.ts:81-96` | environment dependencies are implicit | hard to isolate prompt and context branches | no per-region telemetry around fetch/build/stream phases |
| F3 | Views | View dedupe cookie stores only slugs, not per-slug timestamps | cookie contract | High | `apps/www/app/api/views/route.ts:100-160` | cookie policy cannot be expressed cleanly until schema exists | time-based cases are difficult to test without explicit state model | no place to attach structured dedupe decisions |
| F4 | Views | Route owns query parsing, JSON parsing, cookie parsing, and storage calls inline | route cohesion | High | `apps/www/app/api/views/route.ts:85-168` | pushes logic into adapters instead of services | no clean service boundary for unit tests | no shared interception point for tracing |
| F5 | Clicks/Views | Shared in-memory store fallback does not match production storage isolation | repository design | High | `apps/www/lib/redis.ts:3-25`, `apps/www/app/api/clicks/route.ts:5-29`, `apps/www/app/api/views/route.ts:26-67` | hidden state cannot be modeled as domain-specific layers | local tests can collide across counters | fallback behavior is invisible to logs unless added per route |
| F6 | Clicks | Client uses optimistic batching and `sendBeacon` flush on page hide | client/server contract | Medium | `apps/www/lib/hooks/use-click-counts.ts:19-37`, `apps/www/lib/hooks/use-click-counts.ts:77-94` | service contract must tolerate repeated ids and fire-and-forget delivery | requires route tests for duplicate batch semantics | tracing should model batch size and beacon delivery separately |
| F7 | Contact/Feedback | Routes instantiate `Resend`, parse JSON, validate fields, and compose HTML inline | service extraction | Medium-High | `apps/www/app/api/contact/route.ts:5-47`, `apps/www/app/api/feedback/route.ts:5-56` | email delivery cannot be injected/tested cleanly | upstream email behavior must be mocked at route level today | no structured record of validation vs provider failure |
| F8 | Contact/Feedback | Raw user input is interpolated into HTML email bodies | output sanitization | High | `apps/www/app/api/contact/route.ts:17-29`, `apps/www/app/api/feedback/route.ts:27-37` | failure/redaction policy must be explicit in service layer | message rendering logic is not isolated for tests | unsafe to expose in client-visible trace payloads |
| F9 | X Auth | Owner bootstrap uses a query-string secret | auth transport | High | `apps/www/app/api/x/auth/route.ts:10-24` | auth policy is not modeled as a reusable contract | auth path is hard to test safely without fixture abstraction | secrets in URLs are incompatible with safe trace correlation |
| F10 | X Callback | Callback flow mixes state lookup, config access, token exchange, persistence, and redirect | route cohesion | High | `apps/www/app/api/x/callback/route.ts:5-86`, `apps/www/lib/x/tokens.ts:15-90` | difficult to express environment requirements cleanly | hard to isolate expiration, refresh, and exchange branches | no stable region boundaries for state lookup vs upstream exchange |
| F11 | Bookmarks | Missing credentials cause unconditional fixture responses | environment policy | High | `apps/www/app/api/x/bookmarks/route.ts:15-24` | live/test policy is implicit instead of layered | tests can accidentally match fixture behavior instead of true failures | production misconfig can look healthy in logs |
| F12 | Shared runtime | Logging is mostly `console.error`, not structured events | observability | High | `apps/www/app/api/chat/route.ts:60`, `apps/www/app/api/chat/route.ts:112`, `apps/www/app/api/clicks/route.ts:23`, `apps/www/app/api/views/route.ts:37`, `apps/www/app/api/contact/route.ts:33`, `apps/www/app/api/feedback/route.ts:41`, `apps/www/app/api/x/bookmarks/route.ts:68` | no typed exit/cause mapping | hard to assert on behavior beyond status codes | no usable client-visible trace model yet |
| F13 | Shared runtime | Module-level caches and singleton state are used across chat, Redis, and X helpers | determinism | Medium | `apps/www/app/api/chat/route.ts:27-35`, `apps/www/lib/redis.ts:5-20`, `apps/www/lib/x/cache.ts:4-38`, `apps/www/lib/x/tokens.ts:11-13` | environment/lifecycle assumptions are hidden | cache and expiry behavior require integration-style tests | trace data cannot show why one branch used a warm cache |
| F14 | Testing | Root and Turbo advertise `test`, but app/package scripts do not execute API tests | build/test infrastructure | Very High | `package.json:5-13`, `turbo.json:31-33`, `apps/www/package.json:5-13`, `packages/link-checker/package.json:9-12` | migration lacks safety net | all schema, repo, and service changes are high risk | trace/log changes cannot be regression tested |

## Route-by-Route Matrix

| Route | Current contract | Hidden dependencies | Fallback behavior | Failure behavior | Observability gaps |
| --- | --- | --- | --- | --- | --- |
| `GET /api/views` | query param `slug` -> `{ slug, count }` | Redis client, key prefix, shared in-memory map | returns in-memory count if Redis is absent or errors | `400` on missing slug, silent fallback on storage errors | no request id, no storage/fallback annotations |
| `POST /api/views` | body `{ slug }` -> `{ slug, count, duplicate }` | Redis client, cookie parsing, shared in-memory map | in-memory increment on Redis failure; empty cookie on parse failure | `400` on missing/invalid body, silent fallback on Redis errors | no dedupe-region logs, no cookie decode trace |
| `GET /api/clicks` | returns `{ counts }` | Redis hash, shared in-memory map | returns in-memory map if Redis is absent or errors | no typed storage errors; always `200` unless code throws outside try | no insight into Redis vs fallback path |
| `POST /api/clicks` | body `{ ids: string[] }` -> `{ counts }` | Redis hash, transaction semantics, shared in-memory map | in-memory tally on Redis failure | `400` on invalid body, otherwise silent fallback | no batch metadata or retry telemetry |
| `POST /api/contact` | body `{ name, email, message }` -> `{ success: true }` | `RESEND_API_KEY`, `Resend`, portfolio email address | none | `400` on missing fields, `500` on provider/internal errors | no validation/provider distinction in logs |
| `POST /api/feedback` | body `{ page, sentiment, message? }` -> `{ success: true }` | `RESEND_API_KEY`, `Resend`, portfolio email address | none | `400` on missing or invalid fields, `500` otherwise | no typed domain error for invalid sentiment vs provider failure |
| `GET /api/x/auth` | query `secret` -> redirect to X auth | `X_OWNER_SECRET`, `X_CLIENT_ID`, Redis or in-memory state store | in-memory state map if Redis absent | `401` unauthorized, `500` if config missing | no audit trail for privileged bootstrap |
| `GET /api/x/callback` | query `code`, `state`, `error` -> redirect or JSON error | state store, `X_CLIENT_ID`, `X_CLIENT_SECRET`, token exchange fetch | in-memory OAuth state if Redis absent | `400` for OAuth/query issues, `500` for token exchange/config | no region separation for state, exchange, persistence |
| `GET /api/x/bookmarks` | optional query `folder` -> bookmarks/folders payload | X config, X token state, cache helpers, fixture data | serves fixtures when credentials absent; cache fills on misses | `500` with error string on exceptions | no cache-hit/miss or fixture-mode annotations |
| `POST /api/chat` | body `{ messages, model?, webSearch?, slug? }` -> streamed AI response | AI Gateway, GitHub fetch, blog loader, client-selected model | GitHub context fetch returns empty string on failure | no request schema validation; stream errors surface through AI SDK | no stable trace regions and no pre-stream cookie handling |

## Supporting Client Flows That Constrain Server Design

| Client surface | Current behavior | Server implication |
| --- | --- | --- |
| `useClickCountEngine` | batches click ids and retries failed flushes, then uses `sendBeacon` on visibility change | `ClicksService` must accept duplicate ids, idempotent-ish replays, and short non-blocking writes |
| `usePageViews` | increments once per slug in React Strict Mode and suppresses analytics errors in UI | `ViewsService` should keep stable duplicate semantics and never become user-visible page failure |
| `useChatSession` | sends `model`, `webSearch`, and optional `slug` in the request body and relies on streaming | server must validate model policy and create trace-cookie state before streaming starts |

Evidence:

- `apps/www/lib/hooks/use-click-counts.ts:15-97`
- `apps/www/lib/components/site/page-views.tsx:80-140`
- `apps/www/lib/hooks/use-chat-session.ts:123-163`

## Shared Runtime Evidence

### Redis and in-memory behavior

- `apps/www/lib/redis.ts:3-25`
  One shared `Map<string, number>` acts as the in-memory fallback for both views and clicks.
- `apps/www/lib/redis.ts:27-35`
  Key prefixing is centralized, but local fallback always returns the same `dev:` namespace.

### X token and cache state

- `apps/www/lib/x/tokens.ts:11-13`
  OAuth state and token fallback are module-level mutable state.
- `apps/www/lib/x/cache.ts:4-38`
  Bookmark cache uses a module-level TTL map when Redis is absent.
- `apps/www/lib/x/client.ts:139-214`
  X client functions read env directly and throw raw `Error` values.

### Chat context construction

- `apps/www/app/api/chat/route.ts:31-115`
  GitHub context fetch has its own module-level cache and string-building responsibility.
- `apps/www/app/(portfolio)/blog/loader.ts:81-96`
  Raw blog content loading is a synchronous file-system read wrapped in a nullable helper.
