# API Modernization Benchmark Appendix

Date: 2026-03-12
Status: supporting
Type: benchmark
Audience: engineering team
Topic: api-modernization
Canonical: no
Derived from: official Effect, Next.js, MDN, and RFC sources

Benchmark scope: targeted primary-source benchmark for `Effect`, Next.js cookies, and HTTP cookie constraints

## Method

This benchmark is intentionally narrow. It is not a broad ecosystem survey. It answers only the design questions needed for this repo:

- how to model dependencies and runtime requirements
- how to model request and cookie contracts
- how to preserve rich failure information
- how to carry request-scoped context across a program
- how to attach trace spans and annotations
- how to make tests layer-aware
- what cookie and streaming constraints affect the design

## Primary Sources

| Topic | Source | URL | Extracted pattern | Relevance to this repo |
| --- | --- | --- | --- | --- |
| Effect overview | Effect official site | https://effect.website/ | `Effect` is designed for composable side effects, observability, and incremental adoption | Confirms this repo can introduce `Effect` behind existing Next handlers instead of rewriting the whole app |
| Dependency management | `Layer` API docs | https://effect-ts.github.io/effect/effect/Layer.ts.html | `Layer` is the dependency provisioning mechanism for building and supplying services | Matches the repo need to replace direct env/import/singleton access with explicit runtime services |
| Runtime contracts | `Schema` API docs | https://effect-ts.github.io/effect/effect/Schema.ts.html | `Schema` provides runtime descriptions for decode/encode/validation | Fits request, response, cookie, and trace payload validation without adding a separate schema system |
| Request-scoped context | `FiberRef` API docs | https://effect-ts.github.io/effect/effect/FiberRef.ts.html | `FiberRef` provides fiber-local state that can flow with effect execution | Fits request id, trace id, route name, trace mode, and region stack propagation |
| Failure richness | `Cause` API docs | https://effect-ts.github.io/effect/effect/Cause.ts.html | `Cause` preserves structured failure context beyond a flat error string | Fits the need to distinguish decode, domain, upstream, and invariant failures |
| Trace regions | `Tracer` API docs | https://effect-ts.github.io/effect/effect/Tracer.ts.html | tracing spans and annotations are first-class runtime concepts | Fits the need for route-level regions such as `views.read-cookie` and `chat.fetch-github` |
| Effect-aware tests | `@effect/vitest` docs | https://effect-ts.github.io/effect/vitest/index.ts.html | effect-specific test helpers support layer-aware and effect-native tests | Fits the need to test services with live/test layers and typed exits |
| Next cookie API | Next.js `cookies` docs | https://nextjs.org/docs/app/api-reference/functions/cookies | cookies can be read and written in route handlers; mutation must occur before streaming starts | This is decisive for chat-route trace cookies and confirms cookie-pointer setup must happen before response streaming |
| Cookie attributes | MDN `Set-Cookie` docs | https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie | `HttpOnly`, `Secure`, `SameSite`, `Max-Age`, and related flags define cookie transport and exposure rules | Supports the design choice to keep trace cookies signed, httpOnly where possible, and short-lived |
| HTTP cookie semantics | RFC 6265 | https://httpwg.org/specs/rfc6265.html | cookies are HTTP header state, not a general-purpose storage medium | Supports keeping full trace payloads server-side rather than in cookies |

## Dimension-by-Dimension Benchmark

### 1. Dependency injection and runtime assembly

Current repo pattern:

- routes read env directly
- routes import concrete Redis, Resend, AI, and X helpers directly
- mutable singleton state is hidden in modules

Benchmarked target pattern:

- use `Layer` to provide storage, config, clock, trace logging, and external client adapters
- keep route adapters thin so only the service layer depends on runtime requirements

Why this is the right fit here:

- the repo already has natural service boundaries: counters, email, chat context, X auth, X bookmarks
- explicit layers make live Redis and in-memory test/dev implementations swappable without changing route logic

Decision:

- adopt `Layer` immediately in the shared server runtime
- do not postpone DI until after route migration

### 2. Typed errors and runtime contracts

Current repo pattern:

- routes parse JSON manually
- validation is hand-written
- failures collapse into generic JSON error strings

Benchmarked target pattern:

- use `Schema` to decode request bodies, query inputs, cookies, and response payloads
- use tagged error families and retain failure richness via `Cause`

Why this is the right fit here:

- the current routes have multiple decode points: request JSON, query params, cookies, env, Redis payloads
- the migration requires typed assertions in tests and stable error categories for trace output

Decision:

- use `Effect.Schema` as the default contract system for all new server modules
- do not add a second schema or validation stack for migrated routes

### 3. Request-scoped observability

Current repo pattern:

- `console.error` is the dominant failure signal
- there is no request id or trace id
- no consistent region or step annotations exist

Benchmarked target pattern:

- use `FiberRef` to store `RequestContext`
- use tracing spans/annotations to record regions and outcomes
- persist structured trace events server-side
- expose only a cookie pointer and compact summary to the client

Why this is the right fit here:

- it satisfies the explicit cookie requirement without overloading cookies
- it works for both non-streaming routes and the streaming chat route
- it produces a trace model that tests can assert against

Decision:

- standardize on request-scoped trace context and span helpers in the shared route runner

### 4. Testing model

Current repo pattern:

- Turbo has a `test` task but the app package does not implement one
- route code is too coupled to test efficiently without integration-style mocks

Benchmarked target pattern:

- use `@effect/vitest` for layer-aware effect tests
- pair it with standard Vitest route-adapter tests
- add property tests for cookie and aggregation logic

Why this is the right fit here:

- service and repository logic need deterministic live/test layer swaps
- cookie state and duplicate-tally logic are good candidates for property tests
- route adapters still need plain HTTP assertions, especially around cookies and statuses

Decision:

- build the test harness around Vitest plus `@effect/vitest`, not around route tests alone

## Cookie and Streaming Constraints

### Constraint 1: cookies are transport metadata, not the primary trace store

Source basis:

- RFC 6265
- MDN `Set-Cookie`

Implication for this repo:

- do not serialize full event timelines or raw request state into cookies
- use cookies only for:
  - signed trace/session correlation id
  - trace mode flags
  - optional compact breadcrumb summary

### Constraint 2: cookie mutation must happen before streaming starts

Source basis:

- Next.js `cookies` API documentation

Implication for this repo:

- the chat route must create the trace pointer cookie before `toUIMessageStreamResponse()`
- if the design ever needs a late trace summary update, it must happen via a separate endpoint or client pull, not by mutating cookies after stream start

### Constraint 3: cookie attributes are part of the design, not an afterthought

Source basis:

- MDN `Set-Cookie`

Implication for this repo:

- trace cookies should be signed
- `Secure` should be enabled outside local development
- `SameSite=Lax` is the default unless a specific cross-site need appears
- `HttpOnly` should be used for pointer cookies if the client reads trace data through an API rather than `document.cookie`
- if a client-readable summary cookie is introduced, it must be separate from the pointer cookie
