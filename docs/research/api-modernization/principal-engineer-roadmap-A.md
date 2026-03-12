# Principal Engineer Roadmap A

Date: 2026-03-12
Status: active
Type: roadmap
Audience: principal engineering review
Topic: api-modernization
Canonical: yes
Derived from: synthesis.md, evidence.md, benchmark.md, inputs/effect-migration-review.md, inputs/principal-architecture-review.md

## Executive Direction

- Adopt Option B: a hybrid `Effect` core behind thin Next.js route adapters.
- Keep the first implementation inside `apps/www`; defer `packages/api-core`
  extraction until reuse or boundary pressure justifies it.
- Treat schemas, typed errors, request context, trace redaction, and the route
  runner as shared platform work, not route-local work.
- Use a signed trace pointer cookie plus server-side trace storage; reject full
  trace-in-cookie designs.
- Require a real package-level test harness before migrations move past the
  pilot route.
- Use `/api/views` as the proving slice, then migrate low-complexity JSON
  routes, then `x/*`, and only then `/api/chat`.

Rejected alternatives:

- pragmatic hardening without `Effect` as the long-term path
- full platform rewrite before proving the shared runtime
- full execution-state payloads in cookies

## Priority Model

- `P0`: blocks safe migration, closes a production or security gap, or unlocks
  multiple downstream requirements
- `P1`: important follow-on work that depends on the platform foundation or
  removes subsystem-level risk
- `P2`: consistency or governance work that improves quality but does not block
  the migration path by itself

Phase gates:

- Do not start route migrations beyond boundary hardening until Phases 1-3 are
  complete.
- Do not start `x/*` until the low-complexity route pattern is proven.
- Do not start `/api/chat` until non-streaming routes have stable typed
  boundaries and trace initialization.

## Requirement Categories

- Boundary hardening and security corrections
- Shared runtime and contract foundations
- Trace and observability platform
- Test harness and deterministic coverage
- Route migrations by complexity
- Documentation and artifact governance

## Requirement Register

Sources reference the current topic docs by filename and existing finding or
section identifiers.

| ID | Requirement | Source | Priority | Depends on | Phase | Success signal |
| --- | --- | --- | --- | --- | --- | --- |
| `BND-1` | Enforce a server-side allowlist for chat model selection before `gateway(model)` is called. | `evidence.md:F1`, `inputs/effect-migration-review.md` finding 1 | `P0` | none | 0 | Unsupported models fail fast with an explicit `4xx` and no upstream model call. |
| `BND-2` | Replace the query-string secret on `/api/x/auth` with a safer owner bootstrap path. | `evidence.md:F9`, `inputs/effect-migration-review.md` finding 2 | `P0` | none | 0 | Owner bootstrap no longer accepts credentials in the URL query string. |
| `BND-3` | Split in-memory fallback state by domain and remove shared counter collisions. | `evidence.md:F5`, `synthesis.md` current-state diagnosis | `P0` | none | 0 | Local fallback semantics for views, clicks, and X state no longer share one mutable store. |
| `BND-4` | Make bookmark fixture mode explicit and non-production only. | `evidence.md:F11`, `inputs/effect-migration-review.md` finding 5 | `P0` | none | 0 | Missing production credentials fail loudly instead of serving fixture data. |
| `BND-5` | Escape or sanitize user-controlled HTML content in contact and feedback email bodies. | `evidence.md:F8`, `inputs/effect-migration-review.md` finding 6 | `P0` | none | 0 | Email payload rendering no longer injects raw user input into HTML. |
| `RT-1` | Introduce a shared route/runtime boundary so `route.ts` files become transport adapters only. | `synthesis.md` executive summary, `inputs/principal-architecture-review.md` debt register | `P0` | `BND-1`-`BND-5` | 1 | One route can be expressed fully through shared runtime primitives instead of route-local infra code. |
| `RT-2` | Standardize request, response, cookie, trace, and config schemas with `Effect.Schema`. | `synthesis.md` module boundaries, `benchmark.md` contract benchmark | `P0` | `RT-1` | 1 | New route boundaries decode and encode through a shared schema layer. |
| `RT-3` | Adopt tagged error families and consistent HTTP error mapping. | `synthesis.md` shared error families, `inputs/principal-architecture-review.md` debt register | `P0` | `RT-1`, `RT-2` | 1 | Route handlers map decode, auth, domain, and upstream failures consistently. |
| `RT-4` | Hide Redis, Resend, GitHub, X, and AI integrations behind shared repos/adapters with explicit live and test layers. | `synthesis.md` service and repository contracts, `benchmark.md` dependency benchmark | `P0` | `RT-1`, `RT-2`, `RT-3` | 1 | External dependencies can be swapped via interfaces without changing route logic. |
| `OBS-1` | Introduce `RequestContext`, `TraceEvent`, `TraceCookiePointer`, and a server-side `TraceRepo`. | `synthesis.md` shared request and trace contracts, `benchmark.md` cookie constraints | `P1` | `RT-1`, `RT-2`, `RT-4` | 2 | A traced request emits sanitized server-side events and returns a signed pointer cookie. |
| `OBS-2` | Standardize structured logging, span/region naming, and redaction rules. | `inputs/principal-architecture-review.md` debt register, `benchmark.md` observability benchmark | `P1` | `OBS-1` | 2 | Logs and trace events use stable region names with redacted annotations. |
| `TST-1` | Add package-level test scripts, Vitest, `@effect/vitest`, `fast-check`, and Turbo-visible test wiring. | `inputs/principal-architecture-review.md` debt register, `benchmark.md` testing model | `P0` | `RT-1` | 3 | `pnpm test --filter www` executes meaningful API tests locally and in CI. |
| `TST-2` | Establish contract, service, repository, route-adapter, and property-test layers. | `synthesis.md` testing decision, `inputs/effect-migration-review.md` testing strategy | `P1` | `TST-1`, `RT-2`, `RT-4`, `OBS-1` | 3 | Each migrated route is covered by the same deterministic test pyramid. |
| `MIG-1` | Migrate `/api/views` first, including corrected per-page dedupe semantics and traced cookie handling. | `evidence.md:F3,F4`, `synthesis.md` first implementation slice | `P0` | `RT-2`, `RT-3`, `RT-4`, `OBS-1`, `TST-2` | 4 | `/api/views` runs through the shared runtime and passes deterministic dedupe and trace tests. |
| `MIG-2` | Migrate `/api/clicks`, `/api/contact`, and `/api/feedback` onto the shared route pattern. | `synthesis.md` migration order, `inputs/effect-migration-review.md` Phase 4 | `P1` | `MIG-1` | 5 | All non-streaming JSON routes share one implementation pattern. |
| `MIG-3` | Migrate `x/*` routes with typed OAuth, token, cache, and environment-policy services. | `evidence.md:F9,F10,F11`, `inputs/effect-migration-review.md` Phase 5 | `P1` | `MIG-2` | 6 | X routes no longer mix bootstrap, cache, token, and upstream logic inside handlers. |
| `MIG-4` | Migrate `/api/chat` last with validated model policy, prompt services, and pre-stream trace initialization. | `evidence.md:F1,F2`, `inputs/effect-migration-review.md` Phase 6 | `P1` | `MIG-2`, `MIG-3`, `OBS-1` | 7 | Chat sets trace state before streaming and uses the same shared runtime contracts as other routes. |
| `DOC-1` | Standardize server module docstrings for responsibility, dependencies, regions, failures, and observability. | `synthesis.md` module docstring standard, `inputs/principal-architecture-review.md` debt register | `P2` | `RT-1` | 1 | New shared server modules use one documentation template. |
| `DOC-2` | Maintain one canonical roadmap and retire overlapping active planning artifacts. | `docs/research/README.md` working rules, `docs/research/api-modernization/README.md` artifact register | `P1` | none | 0 | The topic has one `Canonical: yes` roadmap and archived/supporting docs are clearly labeled. |

## Phase Plan

| Phase | Objective | Requirements | Deliverables | Dependencies | Exit criteria |
| --- | --- | --- | --- | --- | --- |
| `0` | Boundary hardening and artifact governance | `BND-1`-`BND-5`, `DOC-2` | Chat/X/email/bookmark boundary fixes, isolated fallback behavior, roadmap becomes canonical | none | Unsafe boundary behavior is removed and the topic has one canonical roadmap. |
| `1` | Shared runtime foundations | `RT-1`-`RT-4`, `DOC-1` | Shared route runner, schemas, error families, repos/adapters, docstring template | Phase `0` | One route can be represented end-to-end with shared runtime abstractions. |
| `2` | Trace and request-context platform | `OBS-1`, `OBS-2` | `RequestContext`, trace contracts, pointer cookie handling, trace repo, span/redaction rules | Phase `1` | A traced request emits sanitized events and returns a valid pointer cookie. |
| `3` | Testing foundation | `TST-1`, `TST-2` | Package test scripts, Vitest toolchain, layered suites, CI-visible test execution | Phases `1`-`2` | `pnpm test --filter www` is meaningful and reusable for migrated routes. |
| `4` | `/api/views` pilot | `MIG-1` | Views service/repo/schema/cookie implementation and deterministic coverage | Phases `1`-`3` | `/api/views` proves the shared runtime, trace model, and test pyramid together. |
| `5` | Low-complexity route migrations | `MIG-2` | `clicks`, `contact`, and `feedback` migrated to the shared pattern | Phase `4` | All simple JSON routes use the same route/runtime model. |
| `6` | X integration | `MIG-3` | Typed OAuth/token/cache services with explicit environment policy | Phase `5` | X routes run through the shared runtime without route-local bootstrap drift. |
| `7` | Chat migration | `MIG-4` | Validated model selection, prompt construction services, streaming adapter, pre-stream trace init | Phases `5`-`6` | Chat uses shared contracts and initializes trace state before the response stream starts. |

## Artifact Cleanup

No appendices are deleted in this pass because each one remains cited by the
requirement register. Cleanup is status-based and duplication-based:

| Artifact | Final status | Action |
| --- | --- | --- |
| `principal-engineer-roadmap-A.md` | `active` / canonical | Owns priorities, phases, dependency gates, and artifact cleanup decisions |
| `README.md` | `active` / non-canonical | Points to the roadmap as the primary document and updates reading order |
| `synthesis.md` | `supporting` / non-canonical | Keeps architecture rationale and interface targets, but no longer owns sequencing or sprint guidance |
| `brief.md` | `archived` / non-canonical | Preserved as the short pre-roadmap memo and marked superseded |
| `principal-engineer-roadmap-D.md` | `archived` / non-canonical | Preserved as the prior roadmap draft and marked superseded |
| `evidence.md` | `supporting` / non-canonical | Retained as the repo-truth appendix cited by the roadmap |
| `benchmark.md` | `supporting` / non-canonical | Retained as the external-source appendix cited by the roadmap |
| `inputs/*` | `archived` / non-canonical | Preserved for provenance and updated to point at the canonical roadmap |
