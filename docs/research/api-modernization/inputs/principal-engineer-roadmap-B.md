# Principal Engineer Roadmap B

Date: 2026-03-12
Status: archived
Type: input-roadmap
Audience: principal engineering review
Topic: api-modernization
Canonical: no
Derived from: ../synthesis.md, ../brief.md, ../evidence.md, ../benchmark.md, effect-migration-review.md, principal-architecture-review.md
Superseded by: ../principal-engineer-roadmap-A.md

## Executive Summary

This roadmap converts the API modernization research set into one execution
sequence for principal review. It does not reopen the architecture decision.
The chosen direction remains the hybrid `Effect` core behind thin Next.js route
adapters defined in [../synthesis.md](../synthesis.md).

The delivery order is deliberate:

1. stop high-risk drift before migration
2. establish one shared server runtime
3. add trace and test foundations that make migration safe
4. prove the model on `/api/views`
5. spread the pattern across simpler JSON routes
6. migrate stateful integrations and streaming last

This file is a non-canonical planning artifact. The implementation-facing
architecture background stays in [../synthesis.md](../synthesis.md), while the
canonical execution-handoff roadmap is
[../principal-engineer-roadmap-A.md](../principal-engineer-roadmap-A.md). This
report exists as the archived peer-roadmap input requested for principal review.

## Compiled Requirements

### Foundation and architecture

- Standardize on one route architecture for all API surfaces: thin Next.js
  adapters, shared runtime, `Effect` services, and explicit repository and
  adapter boundaries.
- Keep the shared server core inside `apps/www` for the first pass; do not
  extract a new package before a second consumer exists.
- Adopt `Layer` immediately for config, repositories, clocks, tracing, and
  external clients instead of postponing dependency injection.

### Contracts, errors, and observability

- Use `Effect.Schema` as the default runtime contract system for request,
  response, cookie, trace, and config payloads.
- Reuse the target interfaces already defined in
  [../synthesis.md](../synthesis.md): `RequestContext`,
  `TraceCookiePointer`, `TraceEvent`, the shared error families,
  `RouteRunnerSpec`, and the service and repository contracts.
- Centralize request-scoped observability with `FiberRef`, span helpers,
  structured logs, typed exit mapping, and a server-side `TraceRepo`.
- Keep cookies limited to signed correlation metadata and optional compact
  summary data; do not store full trace payloads client-side.

### Boundary hardening before migration

- Enforce the chat model allowlist on the server boundary.
- Replace the query-string X owner secret flow with a safer privileged entry
  mechanism.
- Split in-memory fallback state by domain and gate bookmarks fixtures by
  environment.
- Escape and redact user-controlled email content before rendering or tracing.

### Test and rollout discipline

- Add a real `apps/www` test harness before broad route migration begins.
- Standardize on Vitest plus `@effect/vitest`, then add property tests where
  cookie, time, or aggregation invariants matter.
- Preserve current external response shapes unless a route explicitly calls out
  a breaking contract change.
- Migrate `/api/views` first, then `clicks`, `contact`, and `feedback`, then
  `x/*`, and finally chat.

## Prioritized Requirement Register

| Requirement | Priority | Rollout | Source | Rationale | Dependency | Target phase | Exit signal |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Standardize on one shared Next adapter plus `Effect` service pattern | `P0` | `required` | [synthesis](../synthesis.md), [principal review](./principal-architecture-review.md) | Removes route-by-route variance before migration scales | none | `1` | one route runs end-to-end through a shared route runner and service boundary |
| Adopt `Effect.Schema` for request, response, cookie, trace, and config contracts | `P0` | `required` | [synthesis](../synthesis.md), [benchmark](../benchmark.md) | Makes validation, encoding, and malformed-input tests explicit | shared runtime scaffold | `1` | migrated modules decode and encode through schemas instead of ad hoc checks |
| Adopt typed error families and consistent HTTP error mapping | `P0` | `required` | [synthesis](../synthesis.md), [benchmark](../benchmark.md) | Preserves decode, domain, auth, upstream, and invariant failures for tests and tracing | shared runtime scaffold | `1` | error tags map predictably to `4xx`, `5xx`, and upstream failure responses |
| Use `Layer`-based runtime assembly for config, repos, clocks, and adapters | `P0` | `required` | [synthesis](../synthesis.md), [benchmark](../benchmark.md) | Replaces hidden imports and singletons with swappable live and test services | shared runtime scaffold | `1` | live and test implementations can be swapped without editing route code |
| Enforce the chat model allowlist on the server | `P0` | `required` | [evidence](../evidence.md), [effect review](./effect-migration-review.md) | Closes an uncontrolled boundary that affects policy, cost, and reliability | none | `0` | unknown or disallowed models are rejected before `gateway(model)` runs |
| Replace the query-string X owner secret flow with a safer privileged entry | `P0` | `required` | [evidence](../evidence.md), [effect review](./effect-migration-review.md) | Removes a credential transport that can leak into logs, history, and screenshots | none | `0` | privileged X bootstrap no longer depends on a URL query secret |
| Split in-memory fallback stores by domain and gate bookmarks fixtures by environment | `P0` | `required` | [evidence](../evidence.md), [effect review](./effect-migration-review.md) | Restores dev and prod parity and prevents false-health responses | none | `0` | views, clicks, and X fallback behavior are explicit, isolated, and environment-scoped |
| Escape and redact user-controlled email content before send or trace | `P0` | `required` | [evidence](../evidence.md), [effect review](./effect-migration-review.md) | Removes injection risk and keeps trace replay safe | none | `0` | contact and feedback payloads are normalized before rendering or persistence |
| Add `RequestContext`, structured spans, `TraceRepo`, and signed pointer cookies | `P0` | `required` | [synthesis](../synthesis.md), [benchmark](../benchmark.md), [evidence](../evidence.md) | Establishes safe client-visible tracing with request-scoped context | shared runtime scaffold | `2` | one non-streaming route emits trace events and returns a signed pointer cookie |
| Keep full traces server-side and initialize pointer cookies before streaming | `P0` | `required` | [benchmark](../benchmark.md), [synthesis](../synthesis.md) | Respects Next.js streaming limits and HTTP cookie constraints | trace foundation | `2` | chat design sets the trace pointer before streaming and never stores full event timelines in cookies |
| Add an app-level test harness with Vitest, `@effect/vitest`, Turbo wiring, and coverage | `P0` | `required` | [evidence](../evidence.md), [benchmark](../benchmark.md), [principal review](./principal-architecture-review.md) | Creates the minimum safety net for architecture and route migration | shared runtime scaffold | `3` | `pnpm test --filter www` executes meaningful API tests in CI and locally |
| Add property tests for cookie, dedupe, and aggregation invariants | `P0` | `required` | [benchmark](../benchmark.md), [synthesis](../synthesis.md) | Example tests alone are weak for time and state transitions | test harness, views contracts | `4` | views cookie and aggregation rules have property coverage alongside route tests |
| Use `/api/views` as the proving slice for schema, tracing, time, and storage | `P1` | `recommended` | [synthesis](../synthesis.md), [brief](../brief.md) | Exercises all core concerns without OAuth or streaming complexity | phases `1` through `3` complete | `4` | `/api/views` is schema-driven, effect-driven, traced, and fully tested |
| Migrate `clicks`, `contact`, and `feedback` before stateful integrations | `P1` | `recommended` | [synthesis](../synthesis.md), [principal review](./principal-architecture-review.md) | Spreads the shared pattern across simpler JSON routes before harder flows | successful views pilot | `5` | all simple JSON routes share the same runtime, tracing, and test conventions |
| Migrate `x/*` before chat, and chat last | `P1` | `recommended` | [synthesis](../synthesis.md), [principal review](./principal-architecture-review.md) | Streaming depends on a proven cookie and trace model, while OAuth and caches prove stateful service boundaries | phases `1` through `5` complete | `6` | X auth and bookmarks, then chat, run through the same shared runtime model |

## Phased Roadmap

| Phase | Scope | Prerequisites | Required deliverables | Major risks | Exit criteria |
| --- | --- | --- | --- | --- | --- |
| `0. Boundary hardening` | Stop high-risk drift before architecture migration | none | server-side model allowlist, safer X auth entry, isolated in-memory stores, explicit fixture gating, HTML escaping and redaction | accidental behavior drift before tests exist | external route behavior remains stable while the highest-risk boundary issues are removed |
| `1. Shared runtime` | Establish one reusable server pattern inside `apps/www` | phase `0` | `contracts`, `errors`, `runtime`, `repos`, and `services` scaffolding; config service; shared route runner; live and test layer assembly | over-abstracting early or extracting a package too soon | one route can execute entirely through the shared runtime without direct env or singleton access |
| `2. Trace foundation` | Add request-scoped observability and cookie-pointer tracing | phase `1` | `RequestContext`, `FiberRef` plumbing, `TraceRepo`, signer and parser for pointer cookies, region helpers, redaction rules, pre-stream cookie initialization path | oversized or unsafe cookie design; tracing scope creep | one non-streaming route persists trace events and returns a signed pointer cookie while keeping full events server-side |
| `3. Test foundation` | Make route migration safe and measurable | phase `1` and phase `2` decisions fixed | `apps/www` test script, Vitest, `@effect/vitest`, route-adapter test setup, deterministic time utilities, coverage wired through Turbo | shallow route-only tests that miss services and repos | `pnpm test --filter www` executes schema, service, repo, route, and trace-oriented tests |
| `4. Route pilot` | Prove the full model on `/api/views` | phases `1` through `3` complete | view request and cookie schemas, `ViewsService`, `ViewsRepo`, typed failures, trace integration, property tests for dedupe and cookie rules, migrated route adapter | dedupe semantics regress or trace data becomes noisy | `/api/views` preserves external behavior while meeting the architecture, tracing, and testing goals together |
| `5. Low-complexity routes` | Spread the pattern across non-streaming JSON routes | successful phase `4` | migrated `clicks`, `contact`, and `feedback` services and adapters, provider adapters, aggregation logic tests, sanitized email rendering paths | local route exceptions creep back in | all simple JSON routes use the same runtime, contracts, trace model, and test layout |
| `6. Stateful integrations` | Migrate `x/*` and then chat | successful phase `5`; pre-stream trace cookie model proven | X auth, callback, token, and bookmark services; state and cache repos; chat service migration; chat model validation; trace pointer initialization before streaming | OAuth edge cases, cache semantics, and streaming response timing | X routes and chat run through the same runtime conventions with typed failures, stable trace regions, and real tests |

## Dependencies And Shared Artifacts

### Target interfaces adopted by reference

This roadmap does not define new contracts. It adopts the report-level target
interfaces already specified in [../synthesis.md](../synthesis.md):

- `RequestContext`
- `TraceCookiePointer`
- `TraceEvent`
- shared error families
- `RouteRunnerSpec`
- service contracts for views, clicks, contact, feedback, chat, X auth, and X
  bookmarks
- repository contracts for views, clicks, trace, X token, and X cache state

### Shared artifacts that must stay synchronized

The archived principal review identifies four cross-report artifacts that should
be maintained once, not reinvented per subsystem:

- one glossary for `Effect`, trace, and testing terms
- one dependency matrix naming owners for shared abstractions
- one list of platform-level decisions that must be made once
- one rollout sequence that keeps workstreams from colliding

### Ownership model used by this roadmap

- `shared foundation`: contracts, errors, runtime, trace model, route runner,
  test harness conventions
- `local implementation`: per-route service, repository, and adapter migration
- `cross-cutting concern`: redaction policy, cookie policy, response-shape
  compatibility, and CI coverage expectations

## Test And Rollout Expectations

### Required test layers

- schema tests for request, response, cookie, and trace payload contracts
- service tests that run `Effect` programs against fake `Layer`s
- repository tests that verify live and in-memory parity where applicable
- deterministic time tests for expiry, dedupe windows, and TTL behavior
- route integration tests for status, body, and cookie behavior
- targeted end-to-end smoke tests for trace pointer flow and selected
  client-visible interactions

### Rollout rules

- approve shared abstractions before route-by-route migration begins
- require the package-level test harness before major route migration
- approve trace redaction and cookie policies before any client-visible trace
  rollout
- treat `/api/views` as the proving ground before migrating email, OAuth, or
  streaming paths
- keep current public response shapes unless a route explicitly calls out a
  compatibility change

### Acceptance checks

- every migrated route uses the same route architecture pattern
- typed failures and trace behavior are testable and consistent
- CI runs real API tests instead of a no-op `test` task
- migration order remains `views`, then simple JSON routes, then stateful
  integrations, then chat

## Cleanup Actions

- Register this roadmap in [../README.md](../README.md) so the topic index,
  reading order, and artifact register stay complete.
- Keep the canonical implementation guidance in
  [../synthesis.md](../synthesis.md); do not duplicate or supersede the target
  interface definitions here.
- Preserve the canonical handoff roadmap in
  [../principal-engineer-roadmap-A.md](../principal-engineer-roadmap-A.md);
  this file is an archived peer-roadmap input, not a replacement.
- Limit cleanup to topic-local artifacts and references created for this
  workstream.
- Current cleanup result: no extra topic-local scratch files were found during
  drafting, so the only required cleanup is registering this artifact and
  keeping the topic references consistent.

## Assumptions And Open Decisions

### Assumptions

- This roadmap operationalizes the existing architecture decision; it does not
  re-evaluate options `A`, `B`, and `C`.
- The shared server core stays in `apps/www` for the initial migration.
- Redis remains the live backing store for trace, token, and cache state unless
  a separate platform decision replaces it.
- Current response shapes remain backward compatible unless a route documents a
  deliberate compatibility change.

### Open decisions for principal review

| Decision | Default in this roadmap | Why |
| --- | --- | --- |
| Schema system | `Effect.Schema` | Aligns contracts with the chosen runtime model |
| Trace exposure policy | preview, development, or admin-only first | Minimizes end-user data exposure while the trace model matures |
| Trace backing store | Redis with TTL-backed trace state | Matches the current platform dependency model |
| Route architecture standard | one shared Next adapter plus `Effect` program pattern | Prevents peer workstreams from proposing incompatible route designs |
