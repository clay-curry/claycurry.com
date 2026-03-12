# Principal Engineer Roadmap D

Date: 2026-03-12
Status: archived
Type: roadmap
Audience: principal engineering review
Topic: api-modernization
Canonical: no
Derived from: synthesis.md, evidence.md, benchmark.md, inputs/effect-migration-review.md, inputs/principal-architecture-review.md
Superseded by: principal-engineer-roadmap-A.md

## Archived Roadmap Draft

This roadmap draft is preserved for history, but it is no longer the active
execution plan. The canonical execution-facing document for this topic is
[principal-engineer-roadmap-A.md](./principal-engineer-roadmap-A.md).

## Purpose and Decision Anchor

This roadmap translates the canonical decisions in
[synthesis.md](./synthesis.md) into a principal-engineer execution sequence. It
does not reopen the architecture decision. Option B, a hybrid `Effect` core
behind thin Next.js route adapters, remains the selected direction.

Use this document for sequencing, prioritization, and artifact hygiene. Use
[synthesis.md](./synthesis.md) for the normative route runner, contract, error,
service, and repository interfaces.

Source shorthand used below:

- `synthesis`: [synthesis.md](./synthesis.md)
- `evidence`: [evidence.md](./evidence.md)
- `benchmark`: [benchmark.md](./benchmark.md)
- `effect-input`: [inputs/effect-migration-review.md](./inputs/effect-migration-review.md)
- `principal-input`: [inputs/principal-architecture-review.md](./inputs/principal-architecture-review.md)

## Consolidated Requirements

| Requirement | Source artifacts | Affected subsystem | Priority | Rationale | Prerequisite | Target phase | Completion signal |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Standardize on one shared Next adapter plus `Effect` runtime pattern for all migrated routes. | `synthesis`, `effect-input`, `principal-input` | shared runtime | `P0` | Prevents route-by-route architectural drift and gives every later migration the same execution model. | Keep `synthesis.md` canonical. | 1 | One route runs end to end through the shared route runner and service boundary. |
| Use `Effect.Schema` for request, response, cookie, and trace contracts. | `synthesis`, `benchmark`, `principal-input` | contracts | `P0` | Replaces ad hoc parsing and gives tests and traces stable runtime contracts. | Shared route pattern approved. | 1 | Migrated routes decode and encode through shared schemas instead of hand-written checks. |
| Define tagged error families and one HTTP mapping policy in the shared runtime. | `synthesis`, `benchmark`, `principal-input` | runtime/errors | `P0` | Removes stringly failures and makes route exits testable and trace-safe. | Shared route pattern approved. | 1 | Decode, domain, auth, and upstream failures map consistently in one runner. |
| Build a real `apps/www` test harness with Vitest, `@effect/vitest`, and property tests. | `synthesis`, `evidence`, `effect-input`, `principal-input` | testing | `P0` | The current repo advertises testing without executing meaningful API tests. | None. | 3 | `pnpm test --filter www` runs contract, service, repo, and route tests locally and in CI. |
| Introduce request-scoped context, structured logging, and named trace regions. | `synthesis`, `benchmark`, `principal-input` | observability | `P0` | Client-visible tracing is unsafe until request metadata and region boundaries are explicit. | Shared runtime scaffolding exists. | 2 | Request context and region helpers emit structured trace events for at least one migrated route. |
| Implement a signed trace pointer cookie backed by a server-side `TraceRepo`. | `synthesis`, `benchmark`, `effect-input`, `principal-input` | observability | `P0` | Meets the cookie requirement without storing full execution state client-side. | Request-scoped trace model exists. | 2 | One non-streaming route returns a signed pointer cookie and persists full events server-side with TTL. |
| Enforce a server-side allowlist for chat model selection. | `synthesis`, `evidence`, `effect-input` | chat | `P0` | The server currently trusts client-supplied model identifiers. | None. | 0 | Invalid models are rejected server-side before provider dispatch. |
| Replace query-string owner auth and make bookmark fixtures explicitly non-production only. | `synthesis`, `evidence`, `effect-input` | X auth/bookmarks | `P0` | Query-string secrets and unconditional fixture mode are unsafe production defaults. | None. | 0 | Privileged X bootstrap no longer depends on a URL secret and fixture mode is environment-gated. |
| Escape or sanitize contact and feedback HTML output and redact unsafe trace fields. | `synthesis`, `evidence`, `effect-input` | contact/feedback | `P0` | Raw user input cannot be trusted in outbound HTML or client-visible trace flows. | None. | 0 | Email composition no longer interpolates raw HTML and redaction rules are documented for migrated routes. |
| Stop cross-domain in-memory fallback collisions before broader migration. | `synthesis`, `evidence`, `effect-input` | repos/storage | `P0` | One shared mutable fallback store hides behavior and breaks parity across counters and stateful flows. | None. | 0 | Views, clicks, and X paths no longer share a single mutable fallback store. |
| Centralize config loading so migrated modules do not read env directly. | `synthesis`, `benchmark`, `principal-input` | runtime/config | `P1` | Explicit runtime dependencies are required for `Layer` assembly and deterministic tests. | Shared route pattern approved. | 1 | Migrated modules read config through one injected service. |
| Establish domain-specific repository interfaces with live and isolated test/dev layers. | `synthesis`, `evidence`, `principal-input` | repos | `P1` | Repo parity is needed after the immediate fallback split so later migrations can test real storage semantics. | Shared runtime scaffolding exists. | 1 | Views, clicks, traces, and X state have explicit repo contracts with live and isolated in-memory implementations. |
| Apply the module docstring standard and keep the research index authoritative. | `synthesis`, `principal-input` | governance | `P1` | Shared documentation conventions reduce peer drift during a parallel migration. | Shared module layout exists. | 1 | New server modules use the agreed docstring template and the topic README stays current. |
| Migrate `/api/views` first and fix per-page 24-hour dedupe semantics. | `synthesis`, `evidence`, `effect-input` | views | `P1` | Views is the smallest route that proves decode, cookies, time, storage, tracing, and tests together. | Phases 0-3 complete. | 4 | `/api/views` becomes the traced, schema-driven reference implementation with full layered test coverage. |
| Migrate `/api/clicks`, `/api/contact`, and `/api/feedback` on the same runtime pattern. | `synthesis`, `effect-input`, `principal-input` | simple JSON routes | `P1` | These routes spread the house style without the extra complexity of OAuth or streaming. | `/api/views` pilot complete. | 5 | All simple JSON routes use shared contracts, services, repos, tracing, and tests. |
| Migrate X auth, callback, and bookmarks after auth and cache policies stabilize. | `synthesis`, `evidence`, `effect-input`, `principal-input` | X flows | `P1` | X routes combine secrets, token state, external IO, and cache policy in one place today. | Low-complexity routes migrated. | 6 | X flows run through the shared runtime with typed OAuth, storage, and live-vs-dev behavior. |
| Migrate chat last with prompt-service extraction and pre-stream trace cookie init. | `synthesis`, `benchmark`, `evidence`, `effect-input` | chat | `P1` | Streaming, provider routing, and redaction make chat the highest operational-risk migration. | X flows stabilized and trace policy approved. | 6 | Chat uses the shared runtime, validates models server-side, and sets its trace cookie before streaming starts. |
| Defer package extraction until a second consumer creates a concrete reuse need. | `synthesis`, `principal-input` | packaging | `P2` | Immediate package extraction adds churn without reducing current migration risk. | Broad migration complete and reuse demand exists. | deferred | Extraction is reconsidered only when another app or package needs the server core. |

## Prioritization Method

This roadmap is risk-first. Delivery speed matters, but only after safety
prerequisites and shared foundations are in place.

- `P0`: work that either closes a current unsafe behavior or unblocks every
  later route migration.
- `P1`: work that depends on the shared foundation and proves or scales the new
  model route by route.
- `P2`: optional or deferred work that improves structure later but does not
  reduce current migration risk.

Ordering rules:

1. Close unsafe boundary behavior before changing multiple routes at once.
2. Define one runtime, contract, error, and trace model before subsystem teams
   start migrating independently.
3. Add the real test harness before broad route migration so regressions are
   detected automatically instead of manually.
4. Prove the pattern on `/api/views`, then expand to simple JSON routes, then
   move to stateful OAuth and finally streaming chat.

## Phased Roadmap

| Phase | Scope | Dependencies | Exit criteria |
| --- | --- | --- | --- |
| 0. Boundary hardening | Close the highest-risk gaps without waiting for the full migration: chat model allowlist, safer X bootstrap, explicit fixture gating, email sanitization/redaction, and immediate fallback-store isolation. | None. | Current routes keep their external behavior, but the highest-risk input, secret, and fallback paths are no longer uncontrolled. |
| 1. Shared runtime | Add the reusable server structure inside `apps/www`: `contracts`, `errors`, `runtime`, `repos`, `services`, shared config, route runner, and module docstrings. | Phase 0 decisions fixed. | One route can execute through the shared runtime with injected config, schemas, and tagged errors. |
| 2. Trace foundation | Add `RequestContext`, trace schemas, region helpers, trace cookie signing/parsing, trace redaction, and a server-side trace repository. | Shared runtime exists. | At least one non-streaming route emits structured trace events and returns a signed pointer cookie. |
| 3. Test foundation | Add package-level test scripts, Vitest, `@effect/vitest`, property tests, route-adapter tests, and CI-visible coverage for `apps/www`. | Runtime and trace interfaces are stable enough to test. | `pnpm test --filter www` executes meaningful API coverage and becomes a migration gate. |
| 4. Route pilot | Migrate `/api/views` only, including explicit cookie schema, 24-hour dedupe semantics, repo parity, trace events, and layered tests. | Phases 0-3 complete. | `/api/views` is the reference implementation for contracts, repos, tracing, and tests. |
| 5. Low-complexity routes | Migrate `/api/clicks`, `/api/contact`, and `/api/feedback` using the same house style proven by the pilot. | `/api/views` pilot complete. | All simple JSON routes use one route architecture, typed contracts, and shared observability. |
| 6. Stateful integrations | Migrate X routes first, then chat last. X absorbs typed OAuth and cache policy; chat absorbs prompt-service extraction, model validation, and pre-stream trace cookie initialization. | Low-complexity routes complete and trace redaction policy approved. | X and chat run through the shared runtime without route-local auth, cache, or streaming exceptions. |

## Cleanup Plan

Authoritative artifacts after the canonical roadmap handoff:

- [principal-engineer-roadmap-A.md](./principal-engineer-roadmap-A.md): active
  sequencing, prioritization, and cleanup companion.
- [synthesis.md](./synthesis.md): supporting architecture and interface source.
- [brief.md](./brief.md): archived fast decision summary.
- [evidence.md](./evidence.md) and [benchmark.md](./benchmark.md): supporting
  appendices.
- [inputs/](./inputs/): archived peer inputs that should remain preserved but
  non-authoritative.

Required cleanup actions:

- keep the topic [README.md](./README.md) aligned with the reading order and
  artifact register above
- point architecture questions to `synthesis.md` and sequencing questions to
  [principal-engineer-roadmap-A.md](./principal-engineer-roadmap-A.md)
- keep archived inputs archived; do not promote them back to active status

Removal policy:

- remove only duplicate drafts or stale references created during roadmap
  authoring
- do not delete `brief.md`, `evidence.md`, `benchmark.md`, or anything under
  `inputs/`

Current cleanup note:

- this draft is now archived and preserved only for history; roadmap ownership
  belongs to [principal-engineer-roadmap-A.md](./principal-engineer-roadmap-A.md)
