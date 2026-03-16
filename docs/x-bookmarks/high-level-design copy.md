# X Bookmarks — High-Level Design

## 1. Overview

### Problem Statement

The portfolio site at claycurry.studio displays the owner's curated X (Twitter) bookmarks as a content feed. X's API imposes OAuth2 token management, rate limits, and schema volatility — none of which should leak into the user experience. The system must sync bookmarks reliably, degrade gracefully when the upstream API is unavailable, and remain easy to debug in production.

### Goals

| # | Goal | Rationale |
|---|------|-----------|
| G1 | Display bookmarks from the configured owner only | Prevents token/owner mismatch from surfacing foreign content |
| G2 | Never blank the UI on sync failure | Stale data is better than an empty page |
| G3 | Validate every external contract at runtime | X API responses evolve without notice; schemas catch drift early |
| G4 | Keep the cache boundary replaceable | Enables future migration from Redis to push-based or disk-backed storage |
| G5 | Provide deep observability for production debugging | Token health, sync timing, cache age, and distributed traces |

---

## 2. Requirements

### 2.1 Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| FR-1 | Fetch and normalize bookmarks from X API v2 (`/2/users/:id/bookmarks`) | Implemented |
| FR-2 | Fetch bookmark folders via `/2/users/:id/bookmarks/folders` | Implemented |
| FR-3 | Auto-paginate through all bookmarks using cursor-based pagination | Implemented |
| FR-4 | Normalize X API wire format (snake_case) to domain model (camelCase) | Implemented |
| FR-5 | OAuth2 token exchange (authorization code + PKCE) | Implemented |
| FR-6 | Automatic token refresh within a 5-minute window before expiry | Implemented |
| FR-7 | Owner identity verification — authenticated user must match `X_OWNER_USERNAME` | Implemented |
| FR-8 | Cache snapshots in Redis with 30-minute freshness window | Implemented |
| FR-9 | Serve stale snapshot when live sync fails | Implemented |
| FR-10 | Serve bundled mock data when no snapshot exists and sync fails | Implemented |
| FR-11 | Filter bookmarks by folder on the client | Implemented |
| FR-12 | Sort bookmarks by date, author, or engagement metrics | Implemented |
| FR-13 | Search bookmarks by text content | Implemented |
| FR-14 | Track viewed bookmark IDs in localStorage | Implemented |
| FR-15 | Debug mock scenarios (`?mock=reauth_required`, `upstream_error`, etc.) | Implemented |
| FR-16 | Credential diagnostics endpoint (passive read) | Implemented |
| FR-17 | Credential validation endpoint (active X API check) | Implemented |
| FR-18 | Distributed trace capture and visualization (`?debug=1`) | Implemented |

### 2.2 Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | API response time (cache hit) | < 100ms |
| NFR-2 | API response time (live sync) | < 5s |
| NFR-3 | Graceful degradation levels | Fresh → Stale → Mock → Empty |
| NFR-4 | Type safety | Effect Schema validation at all boundaries |
| NFR-5 | Testability | All services injectable via Effect layers |
| NFR-6 | Secret isolation | No raw credentials in API responses |
| NFR-7 | Environment parity | Mock service in preproduction, live in production |

---

## 3. System Architecture

### 3.1 System Context (C4 Level 1)

```mermaid
graph TB
    User["👤 Site Visitor"]
    Owner["👤 Site Owner"]
    System["🔷 claycurry.studio<br/>Next.js Application"]
    XApi["🐦 X API v2"]
    Redis["🗄️ Upstash Redis"]

    User -->|"Views bookmarks"| System
    Owner -->|"Debug panel,<br/>credential management"| System
    System -->|"OAuth2 token exchange,<br/>bookmark fetch"| XApi
    System <-->|"Cache snapshots,<br/>tokens, sync status"| Redis

    style System fill:#0ff3,stroke:#0ff,color:#fff
    style XApi fill:#1da1f233,stroke:#1da1f2,color:#fff
    style Redis fill:#dc382c33,stroke:#dc382c,color:#fff
```

### 3.2 Container Diagram (Layered Architecture)

```mermaid
graph TB
    subgraph Client["Browser"]
        Hook["useBookmarks()<br/><i>React Hook</i>"]
        Atoms["Jotai Atoms<br/><i>Sort, filter, search state</i>"]
        FetchLib["fetchBookmarks()<br/><i>HTTP client + Schema validation</i>"]
        DebugPanel["Debug Panel<br/><i>Credentials, Traces, API tester</i>"]
    end

    subgraph Server["Next.js Server"]
        subgraph Routes["API Routes"]
            BookmarksRoute["GET /api/x/bookmarks"]
            StatusRoute["GET /api/x/bookmarks/status"]
            CredRoute["GET /api/x/debug/credentials"]
            ValidateRoute["POST /api/x/debug/credentials/validate"]
        end

        subgraph Application["Application Layer"]
            SyncService["BookmarksSyncService<br/><i>Cache-first orchestrator</i>"]
            Runtime["Runtime Factory<br/><i>Mock vs. Live selection</i>"]
        end

        subgraph Infrastructure["Infrastructure Layer"]
            XClient["XBookmarksClient<br/><i>X API wrapper</i>"]
            TokenStore["XTokenStore<br/><i>OAuth lifecycle</i>"]
            IdentityVerifier["XIdentityVerifier<br/><i>Owner validation</i>"]
            OwnerResolver["XBookmarksOwnerResolver<br/><i>Username → ID</i>"]
            Repo["BookmarksRepo<br/><i>Redis persistence</i>"]
        end

        subgraph Domain["Domain Layer"]
            Contracts["Effect Schemas<br/><i>Wire + domain types</i>"]
            Errors["Tagged Errors<br/><i>6 error classes</i>"]
        end
    end

    Hook --> FetchLib
    FetchLib --> BookmarksRoute
    DebugPanel --> CredRoute
    DebugPanel --> ValidateRoute
    BookmarksRoute --> Runtime
    Runtime --> SyncService
    SyncService --> TokenStore
    SyncService --> XClient
    SyncService --> Repo
    TokenStore --> IdentityVerifier
    XClient --> OwnerResolver
    XClient -.->|"validates with"| Contracts
    Repo -.->|"validates with"| Contracts
    TokenStore --> Repo
    SyncService -.->|"raises"| Errors

    style Client fill:#0ff1,stroke:#0ff
    style Server fill:#0001,stroke:#666
    style Routes fill:#f0f1,stroke:#f0f
    style Application fill:#ff01,stroke:#ff0
    style Infrastructure fill:#0f01,stroke:#0f0
    style Domain fill:#00f1,stroke:#00f
```

### 3.3 Bookmark Sync Sequence

```mermaid
sequenceDiagram
    participant B as Browser
    participant R as /api/x/bookmarks
    participant S as SyncService
    participant C as BookmarksRepo (Redis)
    participant T as XTokenStore
    participant V as XIdentityVerifier
    participant X as X API v2

    B->>R: GET /api/x/bookmarks
    R->>S: getBookmarks()
    S->>C: loadSnapshot(owner)

    alt Snapshot is fresh (< 30 min)
        C-->>S: snapshot
        S-->>R: BookmarksApiResponse (status: fresh)
    else Snapshot stale or missing
        S->>T: getTokenForSync()
        T->>C: loadToken(owner)
        C-->>T: tokenRecord

        alt Token near expiry (< 5 min)
            T->>X: POST /2/oauth2/token (refresh)
            X-->>T: new access_token
            T->>C: persistToken(owner, token)
        end

        T->>V: verify(authenticatedUser, configuredOwner)
        V-->>T: verified ✓

        S->>X: GET /2/users/:id/bookmarks
        S->>X: GET /2/users/:id/bookmarks/folders
        Note over S,X: Concurrent requests

        X-->>S: bookmarks + folders

        S->>C: persistSnapshot(owner, data)
        S->>C: persistStatus(owner, success)
        S-->>R: BookmarksApiResponse (status: fresh)
    end

    R-->>B: JSON response
```

### 3.4 Error Recovery & Fallback Flow

```mermaid
flowchart TD
    Start["GET /api/x/bookmarks"] --> CheckCache{"Redis snapshot<br/>< 30 min old?"}

    CheckCache -->|Yes| ReturnFresh["Return fresh snapshot<br/>✅ status: fresh"]
    CheckCache -->|No| AttemptSync["Attempt live sync"]

    AttemptSync --> CheckConfig{"OAuth config<br/>present?"}
    CheckConfig -->|No| Misconfigured["❌ Misconfigured"]

    CheckConfig -->|Yes| GetToken{"Load & refresh<br/>token"}
    GetToken -->|No token| ReauthRequired["❌ ReauthRequired"]
    GetToken -->|Refresh failed| ReauthRequired

    GetToken -->|Token OK| VerifyOwner{"Authenticated user<br/>= configured owner?"}
    VerifyOwner -->|No| OwnerMismatch["❌ OwnerMismatch"]
    VerifyOwner -->|Yes| FetchBookmarks["Fetch from X API"]

    FetchBookmarks -->|Schema mismatch| SchemaInvalid["❌ SchemaInvalid"]
    FetchBookmarks -->|Network/API error| UpstreamError["❌ UpstreamError"]
    FetchBookmarks -->|Success| PersistAndReturn["Persist + Return<br/>✅ status: fresh"]

    Misconfigured --> HasStale{"Stale snapshot<br/>exists?"}
    ReauthRequired --> HasStale
    OwnerMismatch --> HasStale
    SchemaInvalid --> HasStale
    UpstreamError --> HasStale

    HasStale -->|Yes| ReturnStale["Return stale snapshot<br/>⚠️ status: stale + error"]
    HasStale -->|No| HasMock{"Bundled mock<br/>available?"}
    HasMock -->|Yes| ReturnMock["Return mock data<br/>⚠️ status: stale"]
    HasMock -->|No| ReturnEmpty["Return empty<br/>❌ status: error"]

    style ReturnFresh fill:#0f03,stroke:#0f0
    style PersistAndReturn fill:#0f03,stroke:#0f0
    style ReturnStale fill:#ff03,stroke:#ff0
    style ReturnMock fill:#ff03,stroke:#ff0
    style ReturnEmpty fill:#f003,stroke:#f00
    style Misconfigured fill:#f003,stroke:#f00
    style ReauthRequired fill:#f003,stroke:#f00
    style OwnerMismatch fill:#f003,stroke:#f00
    style SchemaInvalid fill:#f003,stroke:#f00
    style UpstreamError fill:#f003,stroke:#f00
```

---

## 4. Current Solution

### 4.1 Module Dependency Graph

```mermaid
graph LR
    subgraph Domain
        contracts["contracts.ts"]
        errors["errors.ts"]
    end

    subgraph Infrastructure
        config["config.ts"]
        client["client.ts"]
        tokens["tokens.ts"]
        cache["cache.ts"]
    end

    subgraph Application
        service["service.ts"]
        runtime["runtime.ts"]
    end

    subgraph Client-Side
        api["api.ts"]
        hooks["use-bookmarks.ts"]
        atoms["atoms.ts"]
    end

    hooks --> api
    hooks --> atoms
    api --> contracts
    runtime --> service
    runtime --> cache
    service --> client
    service --> tokens
    service --> cache
    tokens --> cache
    tokens --> config
    client --> contracts
    client --> config
    cache --> contracts
    errors --> contracts
    service --> errors

    style Domain fill:#00f1,stroke:#00f
    style Infrastructure fill:#0f01,stroke:#0f0
    style Application fill:#ff01,stroke:#ff0
    style Client-Side fill:#0ff1,stroke:#0ff
```

### 4.2 Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Effect-TS for server logic | Effect generators + tagged errors | Composable error handling, dependency injection via layers, built-in tracing |
| Schema validation library | Effect Schema (not Zod) | Native Effect integration, decode/encode symmetry, better error messages |
| State management (client) | Jotai atoms | Lightweight, no provider required, supports localStorage persistence |
| Cache backend | Upstash Redis | Serverless-compatible, sub-ms latency, environment-prefixed keys |
| Owner-scoped storage keys | `x:v2:{owner}:tokens`, `x:v2:{owner}:snapshot`, etc. | Supports multi-owner deployments without key collision |
| Mock fallback strategy | Bundled static data in `mock-bookmarks.ts` | Zero-dependency fallback when Redis and X API are both unavailable |

### 4.3 Error Taxonomy

```mermaid
graph TD
    XError["XError (base)"]
    XError --> Misconfigured["Misconfigured<br/><i>Missing OAuth env vars</i>"]
    XError --> ReauthRequired["ReauthRequired<br/><i>No token or token rejected</i>"]
    XError --> OwnerMismatch["OwnerMismatch<br/><i>Auth user ≠ configured owner</i>"]
    XError --> SchemaInvalid["SchemaInvalid<br/><i>X API response drift</i>"]
    XError --> UpstreamError["UpstreamError<br/><i>Network or API failure</i>"]
    XError --> CacheStale["CacheStale<br/><i>Sync failed, stale data served</i>"]

    style Misconfigured fill:#f003,stroke:#f00
    style ReauthRequired fill:#f003,stroke:#f00
    style OwnerMismatch fill:#f003,stroke:#f00
    style SchemaInvalid fill:#f003,stroke:#f00
    style UpstreamError fill:#f003,stroke:#f00
    style CacheStale fill:#ff03,stroke:#ff0
```

### 4.4 Data Model Summary

| Entity | Storage | TTL / Freshness |
|--------|---------|-----------------|
| OAuth Token | Redis (`x:v2:{owner}:tokens`) | Refresh 5 min before expiry |
| Bookmark Snapshot | Redis (`x:v2:{owner}:snapshot`) | 30 min freshness window |
| Sync Status | Redis (`x:v2:{owner}:status`) | Updated on every sync attempt |
| Sort/Filter Preferences | localStorage (Jotai) | Persistent across sessions |
| Viewed Bookmark IDs | localStorage (Jotai) | Persistent across sessions |

---

## 5. Alternative Solutions

### Alternative A: Static Export with Build-Time Sync

**Approach:** Fetch bookmarks at build time via a Next.js `generateStaticParams` or a custom build script. Store results as static JSON. Rebuild on a cron schedule (e.g., every 30 minutes via GitHub Actions or Vercel cron).

```mermaid
graph LR
    Cron["⏰ Cron Trigger<br/>(every 30 min)"] --> Build["Next.js Build"]
    Build --> XApi["X API v2"]
    XApi --> JSON["Static JSON<br/>in /public"]
    JSON --> CDN["CDN Edge"]
    CDN --> Browser["Browser"]

    style Cron fill:#ff01,stroke:#ff0
    style CDN fill:#0f03,stroke:#0f0
```

**Pros:**
- Zero runtime dependencies (no Redis, no serverless functions)
- Instant page loads (static assets served from CDN)
- No token management at request time
- Simpler error surface — failures are build-time only

**Cons:**
- Content staleness up to rebuild interval (30+ minutes)
- Build minutes cost on hosting platform
- No on-demand refresh capability
- OAuth token still needs management (in CI secrets)
- Folder filtering requires client-side logic on full dataset

---

### Alternative B: Edge Function with KV Cache

**Approach:** Move the bookmarks endpoint to a Vercel Edge Function. Replace Redis with Vercel KV (or Cloudflare KV). Token management happens at the edge with encrypted KV storage.

```mermaid
graph LR
    Browser["Browser"] --> Edge["Edge Function<br/>(Vercel Edge Runtime)"]
    Edge --> KV["Vercel KV<br/>(Edge-local cache)"]
    Edge --> XApi["X API v2"]
    KV -.->|"cache hit"| Edge

    style Edge fill:#0ff3,stroke:#0ff
    style KV fill:#f0f3,stroke:#f0f
```

**Pros:**
- Lower latency (edge-local execution)
- Built-in KV with automatic global replication
- No cold start penalty
- Same cache-first pattern as current solution

**Cons:**
- Edge Runtime restrictions (no Node.js APIs, limited Effect-TS compatibility)
- Vercel KV has eventual consistency (stale reads possible)
- Token refresh at edge adds complexity (concurrent refresh races)
- Vendor lock-in to Vercel's edge infrastructure
- Effect-TS runtime may not work in edge environment

---

### Alternative C: Webhook-Driven Push Sync

**Approach:** Instead of polling X API on demand, use X's Account Activity API (or a polling worker) to push bookmark changes to a webhook endpoint. The webhook persists changes incrementally to the database.

```mermaid
graph LR
    XApi["X API v2"] -->|"Webhook / Poll worker"| Webhook["POST /api/x/webhooks"]
    Webhook --> DB["Database<br/>(incremental updates)"]
    Browser["Browser"] --> API["GET /api/x/bookmarks"]
    API --> DB

    style Webhook fill:#0f03,stroke:#0f0
    style DB fill:#ff03,stroke:#ff0
```

**Pros:**
- Near-real-time updates
- No cache freshness concerns — data is always current
- Lower X API rate limit usage (incremental vs. full fetch)
- Read path is a simple database query (fast, no external calls)

**Cons:**
- X does not currently offer bookmark-specific webhooks
- Requires a persistent worker process (not serverless-friendly)
- Incremental sync adds complexity (ordering, deduplication, deletions)
- Higher infrastructure cost (always-on worker or managed queue)
- Must still handle initial full sync (bootstrap)

---

### Alternative D: Client-Side Direct Fetch (SPA Pattern)

**Approach:** Eliminate the server-side proxy entirely. The browser fetches bookmarks directly from the X API using the owner's token (stored encrypted in a secure cookie or exchanged via a lightweight auth endpoint).

```mermaid
graph LR
    Browser["Browser"] -->|"Bearer token"| XApi["X API v2"]
    Browser --> Auth["Auth Endpoint<br/>(token exchange only)"]
    Auth --> Redis["Redis<br/>(token storage)"]

    style Browser fill:#0ff3,stroke:#0ff
    style Auth fill:#ff03,stroke:#ff0
```

**Pros:**
- Minimal server infrastructure (auth endpoint only)
- Real-time data (no caching layer)
- Reduced server costs

**Cons:**
- Exposes token to the browser (security risk)
- CORS restrictions on X API
- Rate limits hit per-user, not per-server
- No caching — every page load triggers API calls
- Visitor cannot see bookmarks without owner's active session
- Fundamentally incompatible with a public portfolio site

---

## 6. Comparison Matrix

| Criteria | Current (Server Sync + Redis) | A: Static Build | B: Edge + KV | C: Webhook Push | D: Client Direct |
|----------|-------------------------------|-----------------|--------------|-----------------|------------------|
| **Freshness** | ≤ 30 min | ≤ build interval | ≤ 30 min | Near-real-time | Real-time |
| **Latency (cache hit)** | < 100ms | < 10ms (CDN) | < 50ms (edge) | < 100ms | 500ms+ (API) |
| **Graceful degradation** | ✅ 4 levels | ✅ Static always works | ⚠️ Edge KV eventual | ⚠️ DB required | ❌ No fallback |
| **Effect-TS compatible** | ✅ Full | ✅ Build-time only | ❌ Edge restrictions | ✅ Full | N/A |
| **Infrastructure cost** | Low (Redis) | Low (build mins) | Medium (Edge + KV) | High (worker) | Minimal |
| **Complexity** | Medium | Low | Medium | High | Low |
| **Security** | ✅ Server-side tokens | ✅ Build-time tokens | ✅ Edge tokens | ✅ Server tokens | ❌ Browser tokens |
| **Observability** | ✅ Effect tracing | ⚠️ Build logs only | ⚠️ Limited edge logs | ✅ Full | ❌ None |
| **Vendor lock-in** | Low (any Redis) | Low | High (Vercel) | Medium | None |
| **Debug panel support** | ✅ Full | ❌ No runtime debug | ⚠️ Limited | ✅ Full | ❌ None |

**Recommendation:** The current approach (Server Sync + Redis) provides the best balance of freshness, reliability, observability, and compatibility with the Effect-TS architecture. Alternative A (Static Build) is a viable simplification if real-time freshness is not needed. Alternatives B–D introduce trade-offs that don't align well with the project's goals.

---

## 7. Known Gaps

### 7.1 Test Coverage

- Only 4 test files with 13 test cases in `lib/x/`
- **Zero test coverage on all API route handlers**
- Missing tests for: `tokens.ts`, `cache.ts` (real Redis), `errors.ts`
- Estimated ~106 new tests needed (~27 hours effort)

### 7.2 Error Handling

- 7 errors silently swallowed without logging
- 8 untyped `catch (error)` blocks with no narrowing
- Redis connection singleton never recovers from failure

### 7.3 Observability

- Distributed tracing is implemented but requires `?debug=1` query param
- No structured logging framework (console.log/error only)
- No alerting on repeated sync failures

### 7.4 Infrastructure

- Module-level singletons with no lifecycle management
- Redis connection has no reconnection logic
- In-memory fallback is global mutable state

---

## 8. File Reference

| Layer | File | Purpose |
|-------|------|---------|
| Domain | `lib/x/contracts.ts` | Effect Schemas for wire + domain types |
| Domain | `lib/x/errors.ts` | Tagged error hierarchy (6 classes) |
| Infra | `lib/x/client.ts` | X API v2 HTTP wrapper |
| Infra | `lib/x/config.ts` | Environment config loader |
| Infra | `lib/x/tokens.ts` | OAuth2 token lifecycle |
| Infra | `lib/x/cache.ts` | Redis persistence (Effect service) |
| App | `lib/x/service.ts` | Sync orchestrator |
| App | `lib/x/runtime.ts` | Mock vs. live factory |
| Route | `app/api/x/bookmarks/route.ts` | Main bookmarks endpoint |
| Client | `lib/x/api.ts` | Browser-side fetch + validation |
| Client | `lib/hooks/use-bookmarks.ts` | React hook (Jotai state) |
| Debug | `lib/x/diagnostics.ts` | Credential diagnostics |
| Debug | `lib/x/mock-bookmarks.ts` | Mock data + scenarios |
| Debug | `lib/x/debug.ts` | Query param constants |
