# Research Workstream: Effect.ts Adoption Report

> **Goal**: Produce a final report with concrete, implementable recommendations
> for adopting Effect.ts, expanding test coverage, and adding cookie-based tracing.

---

## Workstream Structure

The research is organized into **5 phases**, each producing a deliverable that
feeds the next. Phases 1-3 are pure research (no code changes). Phase 4
produces proof-of-concept code. Phase 5 synthesizes everything into the final
report.

```
Phase 1: Inventory & Gap Analysis
  ↓
Phase 2: Effect.ts Feasibility Spikes
  ↓
Phase 3: Tracing & Observability Research
  ↓
Phase 4: Proof-of-Concept Implementations
  ↓
Phase 5: Final Report & Recommendations
```

---

## Phase 1 — Inventory & Gap Analysis

**Objective**: Establish a precise baseline of what exists, what's missing, and
where the highest-value improvements are.

### Tasks

1. **Catalog every side effect in the API layer**
   - For each route handler and library function, list:
     - External calls (Redis, X API, GitHub API, Resend, fetch)
     - State mutations (module singletons, in-memory Maps, cookies)
     - Error paths (what's thrown, what's caught, what's silent)
   - Output: Table in `docs/research/01-side-effect-inventory.md`

2. **Map error propagation paths**
   - Trace how errors flow from origin → catch → response for each route
   - Identify: silent swallows, re-throws without context, untyped catches
   - Identify which errors are recoverable vs terminal
   - Output: Error flow diagrams (Mermaid) in `docs/research/01-error-flows.md`

3. **Audit test coverage gaps**
   - Current: 4 test files, all in `lib/x/`, using `node:test`
   - Missing: all route handlers, `lib/redis.ts`, `lib/x/tokens.ts`,
     `lib/x/cache.ts`, contact/feedback/chat/views/clicks routes
   - For each untested module, identify: happy path, error paths, edge cases
   - Output: Coverage gap matrix in `docs/research/01-test-gaps.md`

4. **Catalog module boundaries and dependency direction**
   - Which modules import which? Are there circular deps?
   - Which modules are pure (no side effects) vs effectful?
   - Where are the natural service boundaries for Effect Layers?
   - Output: Dependency graph in `docs/research/01-dependency-graph.md`

### Deliverable
`docs/research/01-baseline-inventory.md` — Summary linking all sub-documents.

---

## Phase 2 — Effect.ts Feasibility Spikes

**Objective**: Answer specific technical questions about Effect.ts integration
through targeted research and small experiments.

### Tasks

1. **Spike: Effect.runPromise in Next.js 16 route handlers**
   - Question: Can `Effect.runPromise()` run inside `export async function POST()`?
   - Question: Does it work with `maxDuration` streaming?
   - Question: How does it interact with Next.js request/response types?
   - Research: Check `@mcrovero/effect-nextjs`, `@effect/rpc-nextjs` patterns
   - Output: `docs/research/02-spike-route-handlers.md`

2. **Spike: Effect Layer lifecycle in Vercel serverless**
   - Question: How should Layers be scoped — per-request or singleton?
   - Question: Does `Layer.launch()` / `ManagedRuntime` work on Vercel?
   - Question: Can we safely share a Redis Layer across cold starts?
   - Research: Effect Discord, GitHub issues, Vercel serverless docs
   - Output: `docs/research/02-spike-serverless-layers.md`

3. **Spike: @effect/schema ↔ Zod coexistence**
   - Question: Can we keep Zod in `contracts.ts` and use Effect Schema only
     in new code?
   - Question: Can `@effect/schema` decode the same shapes Zod validates?
   - Question: What's the migration path for 263 lines of Zod schemas?
   - Research: Official schema-vs-zod comparison, community codemods
   - Output: `docs/research/02-spike-schema-migration.md`

4. **Spike: Effect Tracer for custom span persistence**
   - Question: Can we write a custom `Tracer` that stores spans in Redis?
   - Question: How do `Effect.withSpan()` and `Effect.annotateCurrentSpan()`
     propagate through `Effect.gen` pipelines?
   - Question: Can span data include success/error values (for client viewing)?
   - Output: `docs/research/02-spike-tracer.md`

5. **Spike: Tagged errors bridging XIntegrationError → Effect**
   - Question: How to wrap existing `XIntegrationError` class as an
     Effect error channel type?
   - Question: Can `Effect.catchTag("ReauthRequired", ...)` work with
     our current error codes?
   - Question: What refactor is needed in `service.ts` to decompose the
     445-line try-catch into tagged error pipelines?
   - Output: `docs/research/02-spike-error-model.md`

### Deliverable
`docs/research/02-feasibility-summary.md` — Go/no-go for each spike, with
code snippets demonstrating the pattern.

---

## Phase 3 — Tracing & Observability Research

**Objective**: Design the cookie-enabled log tracing system that lets clients
view the flow of success/error values and program state.

### Tasks

1. **Define the trace data model**
   - What is a "span" in our context? (route handler → service call → Redis op)
   - What state should be captured at each boundary?
   - What should be redacted (tokens, secrets)?
   - Output: `docs/research/03-trace-data-model.md`

2. **Design the cookie protocol**
   - Cookie name, scope, TTL, security attributes
   - How trace ID flows: cookie → middleware → Effect context → storage
   - How to handle: first request (no cookie), concurrent requests, expiry
   - Output: `docs/research/03-cookie-protocol.md`

3. **Design the trace storage and retrieval API**
   - Storage: Redis list per trace ID? Sorted set? TTL?
   - Retrieval: `GET /api/trace/:id` → JSON span tree
   - Optional: SSE endpoint for live span streaming
   - Client-side viewer: minimal HTML page vs JSON dump
   - Output: `docs/research/03-trace-api.md`

4. **Evaluate integration with Effect's Tracer vs standalone**
   - If using Effect (Proposal B): native `Effect.withSpan()` + custom Tracer
   - If not using Effect (Proposal C): `AsyncLocalStorage` + manual instrumentation
   - Compare: code overhead, type safety, feature parity
   - Output: `docs/research/03-tracer-comparison.md`

### Deliverable
`docs/research/03-tracing-design.md` — Complete tracing system design.

---

## Phase 4 — Proof-of-Concept Implementations

**Objective**: Build small, throwaway PoCs that validate the hardest assumptions
from Phases 2-3. These run in an isolated branch, not merged to main.

### Tasks

1. **PoC: Effect-wrapped Redis with Layer swap**
   - Wrap `lib/redis.ts` in an Effect Service
   - Create `RedisLive` (real client) and `RedisTest` (in-memory Map) Layers
   - Write a test proving the same Effect program runs against both Layers
   - Validates: Layer pattern works, DI is clean, tests are easy

2. **PoC: Decomposed bookmark sync as Effect.gen**
   - Rewrite `service.ts:getBookmarks()` as composed Effect stages
   - Each stage: `checkFreshCache`, `acquireToken`, `verifyIdentity`,
     `fetchBookmarks`, `persistSnapshot`, `fallbackToStale`
   - Write tests for each stage independently
   - Validates: Complex orchestration decomposes cleanly into Effect

3. **PoC: Cookie trace middleware + span storage**
   - Next.js middleware that reads/writes `x-trace-id` cookie
   - Store spans in Redis list with 1-hour TTL
   - `GET /api/trace/:id` returns span tree as JSON
   - Wire into the bookmark sync PoC from task 2
   - Validates: Full tracing pipeline works end-to-end

4. **PoC: Route handler with Effect.runPromise**
   - Rewrite `/api/views` route using Effect for the increment/get logic
   - Prove streaming responses still work with Effect wrapping
   - Validates: Effect integrates with Next.js App Router without friction

### Deliverable
Working code on a `poc/effect-adoption` branch, with a short write-up of what
worked, what didn't, and what surprised us in `docs/research/04-poc-results.md`.

---

## Phase 5 — Final Report & Recommendations

**Objective**: Synthesize all research into a single actionable document.

### Report Structure

```
docs/EFFECT_ADOPTION_REPORT.md

1. Executive Summary
   - One-paragraph recommendation
   - Estimated effort and risk level

2. Current State Assessment
   - Architecture diagram (from Phase 1)
   - Side effect inventory summary
   - Error propagation analysis
   - Test coverage gaps

3. Effect.ts Integration Recommendation
   - Chosen proposal (A/B/C) with justification
   - Specific modules to migrate first (priority order)
   - Modules to leave as-is (and why)
   - Schema migration strategy (Zod → @effect/schema or coexistence)

4. Error Model Redesign
   - From: XIntegrationError class + throw/catch
   - To: Tagged error union + Effect error channel
   - Module-by-module migration plan

5. Testing Strategy
   - Framework choice: stay with node:test or adopt Vitest?
   - Test architecture (unit/integration/fixtures)
   - Layer-based test DI patterns
   - Priority order for new tests

6. Tracing System Design
   - Cookie protocol specification
   - Trace data model
   - Storage and retrieval API
   - Integration approach (Effect Tracer vs standalone)

7. Module Docstring Catalog
   - Updated docstrings for every module
   - @service, @layer, @error, @region annotations
   - Dependency map per module

8. Migration Roadmap
   - Phase 0: Foundation (docstrings, extract shared utils, tests)
   - Phase 1: Error model (tagged unions, Result type)
   - Phase 2: Effect core (Layer, Service, programs)
   - Phase 3: Tracing (cookie middleware, span storage, viewer)
   - Phase 4: Schema migration (if warranted)
   - Each phase: files changed, estimated effort, risk, rollback plan

9. Appendices
   - PoC code excerpts and results
   - Spike findings (go/no-go per question)
   - Effect.ts cheat sheet for contributors
   - Decision log (what we considered and why we rejected it)
```

### Deliverable
`docs/EFFECT_ADOPTION_REPORT.md` — The final report, ready to drive
implementation.

---

## Dependencies Between Phases

| Phase | Depends On | Can Parallelize With |
|-------|-----------|---------------------|
| 1 | Nothing | — |
| 2 | Phase 1 (need inventory to know what to spike) | Phase 3 |
| 3 | Phase 1 (need error flows for trace design) | Phase 2 |
| 4 | Phases 2 + 3 (need spike results to build PoCs) | — |
| 5 | Phase 4 (need PoC results for recommendations) | — |

**Phases 2 and 3 can run in parallel** once Phase 1 is complete.

---

## Output Artifacts

| Artifact | Path | Purpose |
|----------|------|---------|
| Side effect inventory | `docs/research/01-side-effect-inventory.md` | Baseline catalog |
| Error flow diagrams | `docs/research/01-error-flows.md` | Visual error propagation |
| Test gap matrix | `docs/research/01-test-gaps.md` | Coverage priorities |
| Dependency graph | `docs/research/01-dependency-graph.md` | Module boundaries |
| Route handler spike | `docs/research/02-spike-route-handlers.md` | Next.js compatibility |
| Serverless layer spike | `docs/research/02-spike-serverless-layers.md` | Vercel compatibility |
| Schema migration spike | `docs/research/02-spike-schema-migration.md` | Zod coexistence |
| Tracer spike | `docs/research/02-spike-tracer.md` | Custom span storage |
| Error model spike | `docs/research/02-spike-error-model.md` | Tagged error bridging |
| Trace data model | `docs/research/03-trace-data-model.md` | Span structure |
| Cookie protocol | `docs/research/03-cookie-protocol.md` | Client identification |
| Trace API design | `docs/research/03-trace-api.md` | Storage + retrieval |
| PoC results | `docs/research/04-poc-results.md` | What worked, what didn't |
| **Final report** | `docs/EFFECT_ADOPTION_REPORT.md` | **Primary deliverable** |
