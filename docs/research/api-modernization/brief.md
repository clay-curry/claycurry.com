# API Modernization Brief

Date: 2026-03-12
Status: archived
Type: brief
Audience: engineering team
Topic: api-modernization
Canonical: no
Derived from: synthesis.md, evidence.md, benchmark.md
Superseded by: principal-engineer-roadmap-A.md

## Archived Brief

This brief is preserved as the short pre-roadmap summary. The canonical
execution-facing document for this topic is
[principal-engineer-roadmap-A.md](./principal-engineer-roadmap-A.md).

## Decision Summary

- Recommended path: Option B, a hybrid `Effect` core with thin Next.js route
  adapters.
- Fallback path: keep the server core inside `apps/www` and defer package
  extraction until there is a second consumer.
- Rejected path: a full platform rewrite or trace-in-cookie design.

## Chosen Direction

Keep Next.js route handlers as transport adapters and move route behavior into a
shared server runtime with `Effect`, `Schema`, layered services, structured
logging, and a signed trace-session cookie that points to server-side trace
state.

## Key Risks

- The repo advertises testing, but `apps/www` has no real API test harness yet.
- Redis and in-memory fallback behavior do not currently match across
  `views`, `clicks`, and X-related state.
- Traceability is too ad hoc for safe client-visible debugging until redaction,
  schemas, and request context are centralized.

## Pilot

Use `/api/views` as the first migration slice because it exercises request
decode, cookie state, time-sensitive dedupe behavior, storage, and trace
capture without streaming or OAuth complexity.

## Next Steps

1. Add the shared server runtime contracts, error types, request context, and
   route runner.
2. Add a real `apps/www` test harness with Vitest and effect-aware program
   tests.
3. Migrate `/api/views`, then reuse the same pattern for `clicks`,
   `contact`, and `feedback`.
4. Move X and chat routes last, after the runtime and trace model are proven.
