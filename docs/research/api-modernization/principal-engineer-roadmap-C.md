# API Modernization Principal Engineer Roadmap C

Date: 2026-03-12
Status: active
Type: roadmap
Audience: engineering team
Topic: api-modernization
Canonical: no
Derived from: synthesis.md, evidence.md, benchmark.md, inputs/effect-migration-review.md, inputs/principal-architecture-review.md

## Executive Summary

The architecture decision is already settled. The canonical direction remains a
hybrid `Effect` core behind thin Next.js route adapters, with `Schema`-defined
contracts, layered dependencies, structured tracing, and server-side trace
storage behind a signed cookie pointer.

This roadmap does not reopen that decision. Its purpose is to turn the current
research set into an implementation handoff that:

- compiles the requirements already established across the topic
- prioritizes them with shared `P0`/`P1`/`P2` vocabulary
- sequences them into a single migration plan
- records the conservative artifact cleanup needed to keep the topic coherent

The first proof point remains `/api/views`. No broader route migration should
start before the shared abstractions and real `apps/www` test execution exist.

## Source Basis

This roadmap is derived from the following topic artifacts:

1. [synthesis.md](./synthesis.md)
2. [evidence.md](./evidence.md)
3. [benchmark.md](./benchmark.md)
4. [inputs/effect-migration-review.md](./inputs/effect-migration-review.md)
5. [inputs/principal-architecture-review.md](./inputs/principal-architecture-review.md)

Interpretation rules:

- Conflicts defer to [synthesis.md](./synthesis.md), which remains the canonical
  implementation-facing source of truth.
- [brief.md](./brief.md) is intentionally not treated as an input authority
  here because it is a summary output of the canonical synthesis.
- This roadmap only translates existing findings, decisions, and sequencing into
  execution terms. It does not add new architectural scope.

## Global Gating Rules

- Do not begin broad route migration until the shared route architecture is
  approved and available as a reusable runtime pattern.
- Do not begin broad route migration until `apps/www` has a real, CI-visible
  `test` script and meaningful API tests.
- Keep `/api/views` as the first end-to-end proof point for contracts, tracing,
  storage parity, and test layering.
- Do not let route-specific work invent separate schema, error, or trace-event
  vocabularies.

## Requirements Matrix

| Requirement | Why | Source | Priority | Owner type | Phase | Dependency |
| --- | --- | --- | --- | --- | --- | --- |
| Shared route architecture with thin Next adapters and `Effect` programs | Route files currently mix transport, validation, business logic, storage, and logging, which blocks consistent migration and tracing | [synthesis.md](./synthesis.md), [inputs/principal-architecture-review.md](./inputs/principal-architecture-review.md) | `P0` | `shared foundation` | 1 | architecture approval |
| Shared schema layer with `Effect.Schema` for request, response, cookie, and trace contracts | Contracts are currently implicit and hand-written, which weakens validation, testing, and typed migration | [synthesis.md](./synthesis.md), [benchmark.md](./benchmark.md) | `P0` | `shared foundation` | 1 | shared route architecture |
| Typed error families plus consistent route-runner error mapping | Stringly typed failures and ad hoc `console.error` handling prevent stable testing and observability | [synthesis.md](./synthesis.md), [inputs/principal-architecture-review.md](./inputs/principal-architecture-review.md) | `P0` | `shared foundation` | 1 | shared route architecture |
| Structured tracing foundation with request context, spans, and consistent logging | Client-visible traceability is unsafe without request-scoped context and structured event boundaries | [synthesis.md](./synthesis.md), [benchmark.md](./benchmark.md) | `P0` | `cross-cutting concern` | 2 | shared route architecture |
| Real package-level `apps/www` test harness with layered API tests | The repo advertises testing today, but the app package has no meaningful API test execution | [evidence.md](./evidence.md), [inputs/principal-architecture-review.md](./inputs/principal-architecture-review.md) | `P0` | `shared foundation` | 3 | shared route architecture |
| Server-side chat model allowlist | The public chat route currently trusts caller-provided model identifiers | [evidence.md](./evidence.md), [inputs/effect-migration-review.md](./inputs/effect-migration-review.md) | `P0` | `local implementation` | 0 | none |
| Safer X auth bootstrap entry | Query-string secrets are not acceptable for an owner-only privileged flow | [evidence.md](./evidence.md), [inputs/effect-migration-review.md](./inputs/effect-migration-review.md) | `P0` | `local implementation` | 0 | none |
| Domain-isolated in-memory fallback stores | Shared in-memory fallback state breaks parity between local behavior and production storage isolation | [evidence.md](./evidence.md), [inputs/effect-migration-review.md](./inputs/effect-migration-review.md) | `P0` | `cross-cutting concern` | 0 | none |
| Explicit non-production fixture gating for bookmarks | Missing credentials should not look healthy in non-local environments | [evidence.md](./evidence.md), [inputs/effect-migration-review.md](./inputs/effect-migration-review.md) | `P0` | `local implementation` | 0 | none |
| HTML escaping or redaction for contact and feedback email composition | Raw user input is currently interpolated into HTML email bodies | [evidence.md](./evidence.md), [inputs/effect-migration-review.md](./inputs/effect-migration-review.md) | `P0` | `local implementation` | 0 | none |
| Reusable trace model with signed cookie pointer and server-side trace repository | Trace cookies must stay small and safe, and streaming routes need cookie initialization before streaming begins | [synthesis.md](./synthesis.md), [benchmark.md](./benchmark.md), [inputs/effect-migration-review.md](./inputs/effect-migration-review.md) | `P1` | `cross-cutting concern` | 2 | tracing foundation |
| Explicit config, runtime, repository, and service boundaries under `apps/www/lib/server/**` | Hidden env access, singleton helpers, and mutable caches make deterministic testing and migration harder | [synthesis.md](./synthesis.md), [evidence.md](./evidence.md) | `P1` | `shared foundation` | 1 | shared route architecture |
| Low-complexity route migration set for `/api/clicks`, `/api/contact`, and `/api/feedback` | These routes spread the new pattern without streaming or OAuth complexity | [synthesis.md](./synthesis.md), [inputs/effect-migration-review.md](./inputs/effect-migration-review.md) | `P1` | `local implementation` | 5 | phases 1-4 complete |
| Stateful integration migration for `x/*` followed by `/api/chat` | OAuth, token state, caches, streaming, and redaction constraints make these routes the highest-risk final migration slice | [synthesis.md](./synthesis.md), [evidence.md](./evidence.md), [inputs/principal-architecture-review.md](./inputs/principal-architecture-review.md) | `P2` | `local implementation` | 6 | phases 0-5 complete |

## Prioritized Backlog

### `P0`

- Establish the shared route architecture, schema system, typed error
  vocabulary, tracing foundation, and real `apps/www` test harness.
- Harden the existing boundary before larger migration work:
  server-side chat model validation, safer X auth entry, domain-isolated
  in-memory stores, environment-gated fixtures, and HTML escaping/redaction.
- Keep `/api/views` as the first proof point once the shared foundation exists.

### `P1`

- Turn the tracing foundation into a reusable trace model with a signed cookie
  pointer and server-side trace repository.
- Make runtime boundaries explicit through shared `contracts`, `errors`,
  `runtime`, `repos`, `services`, and adapters under `apps/www`.
- Migrate `/api/clicks`, `/api/contact`, and `/api/feedback` after `/api/views`
  proves the house style.

### `P2`

- Migrate stateful integrations only after the shared foundation is stable and
  low-complexity routes are complete.
- Move `x/*` before `/api/chat`, then migrate chat last because streaming,
  model policy, GitHub context fetching, and redaction constraints make it the
  most operationally sensitive route.

## Phase Plan

### Phase 0. Boundary Hardening

Scope:
Reduce the highest-risk drift in the current routes before the shared runtime
lands.

Deliverables:

- server-side chat model allowlist
- safer X auth bootstrap entry
- domain-isolated in-memory fallback stores
- explicit fixture gating for bookmarks
- HTML escaping or redaction for contact and feedback

Dependencies:
None. This phase is intentionally front-loaded.

Exit criteria:

- current external route behavior remains stable
- high-risk boundary issues are reduced before larger refactors begin

Requirements retired:

- server-side chat model allowlist
- safer X auth bootstrap entry
- domain-isolated in-memory fallback stores
- explicit non-production fixture gating
- HTML escaping or redaction for email routes

### Phase 1. Shared Runtime

Scope:
Create one reusable server pattern inside `apps/www` for migrated routes.

Deliverables:

- `contracts`, `errors`, `runtime`, `repos`, `services`, and adapter scaffolding
- shared config-loading model
- route runner that decodes input, installs request context, executes an
  `Effect`, and maps exits to HTTP responses

Dependencies:

- architecture direction remains the canonical synthesis decision
- phase 0 hardening should already be in place for the highest-risk boundaries

Exit criteria:

- one route can execute fully through the shared runtime shape
- runtime/service/repository boundaries are explicit instead of route-local

Requirements retired:

- shared route architecture
- shared schema layer
- typed error families and route-runner mapping
- explicit config/runtime/repository/service boundaries

### Phase 2. Trace Foundation

Scope:
Add request-scoped tracing and the safe cookie-pointer model on top of the
shared runtime.

Deliverables:

- `RequestContext` and trace-event contracts
- request-scoped context propagation
- region helpers and structured logging hooks
- signed trace cookie pointer plus server-side trace repository

Dependencies:

- phase 1 shared runtime
- benchmark constraints around cookie size, security attributes, and streaming

Exit criteria:

- one route emits structured trace events
- one route returns a signed trace pointer cookie without storing full event
  payloads client-side

Requirements retired:

- structured tracing foundation
- reusable trace model with signed cookie pointer and server-side trace storage

### Phase 3. Test Foundation

Scope:
Replace the current no-op testing posture with a real API migration safety net.

Deliverables:

- package-level `test` scripts for active workspace packages
- `vitest`, `@effect/vitest`, and property-test tooling
- schema, service, repository, route-adapter, and targeted smoke-test patterns
- CI-visible execution through `turbo run test`

Dependencies:

- phase 1 shared runtime to define what gets tested
- phase 2 trace model if trace behavior is part of assertions

Exit criteria:

- `apps/www` runs meaningful API tests locally and in CI
- route and service refactors can be regression tested before broader migration

Requirements retired:

- real package-level `apps/www` test harness with layered API tests

### Phase 4. Route Pilot (`/api/views`)

Scope:
Prove contracts, tracing, storage parity, and test layering together on the
best first route.

Deliverables:

- migrated `/api/views`
- view-cookie schema with correct dedupe semantics
- `ViewsService`, `ViewsRepo`, and route adapter tests
- trace-cookie behavior validated on a non-streaming route

Dependencies:

- phases 1-3 complete

Exit criteria:

- `/api/views` is schema-driven, effect-driven, traced, and fully tested
- the new runtime pattern is validated before reuse on other routes

Requirements retired:

- first proof point for shared route architecture, tracing, and test layering

### Phase 5. Low-Complexity Routes

Scope:
Spread the shared pattern across simple JSON routes before touching streaming or
OAuth-heavy flows.

Deliverables:

- migrated `/api/clicks`
- migrated `/api/contact`
- migrated `/api/feedback`
- route-specific schemas, services, repos, and adapters aligned to the shared
  runtime

Dependencies:

- `/api/views` pilot complete
- shared runtime, trace model, and tests already stable

Exit criteria:

- all low-complexity JSON routes follow the same house style
- tracing, error mapping, and tests are reused instead of reinvented

Requirements retired:

- low-complexity route migration set for `/api/clicks`, `/api/contact`, and
  `/api/feedback`

### Phase 6. Stateful Integrations

Scope:
Migrate the highest-complexity integrations after the shared foundation is
already proven.

Deliverables:

- migrated `x/*` flows with typed auth, storage, and cache boundaries
- migrated `/api/chat` with validated model selection, typed request contract,
  prompt-construction service, and pre-stream trace-cookie initialization

Dependencies:

- phases 0-5 complete
- stable trace redaction policy and runtime conventions

Exit criteria:

- X flows and chat use the same runtime conventions as the rest of the API
- chat remains the final migration slice because of streaming and redaction
  sensitivity

Requirements retired:

- stateful integration migration for `x/*`
- highest-complexity route migration for `/api/chat`

## Artifact Cleanup

Authoritative artifact roles after this roadmap lands:

- [synthesis.md](./synthesis.md): canonical architecture and migration decision
  record
- [principal-engineer-roadmap-C.md](./principal-engineer-roadmap-C.md):
  execution-handoff sequencing, prioritization, and phase plan
- [brief.md](./brief.md): short summary for fast review
- [evidence.md](./evidence.md): repo-derived findings and file evidence
- [benchmark.md](./benchmark.md): external constraints and primary-source
  benchmark
- [inputs/](./inputs/): archived historical reviews, preserved but not
  authoritative

Conservative cleanup performed by this roadmap:

- add the roadmap to the topic reading order immediately after the canonical
  synthesis
- add the roadmap to the artifact register as a non-canonical active artifact
- remove stale topic-index wording that assumed there were only six artifacts
- replace ambiguous guidance about future top-level memos with explicit rules
  for where decision updates, execution updates, and archived inputs belong

Cleanup explicitly out of scope:

- deleting archived research inputs
- deleting unrelated repo artifacts
- changing runtime code or public API behavior

## Acceptance Checks

- Every requirement in this roadmap traces back to an existing topic artifact.
- The roadmap does not change the selected architecture or supersede the
  canonical synthesis.
- The phase order matches the established migration sequence already present in
  the research set.
- The topic index and artifact register stay consistent after the roadmap is
  added.
