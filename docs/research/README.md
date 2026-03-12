# Research Taxonomy

Date: 2026-03-12
Status: active
Type: guide
Audience: engineering team
Topic: research-taxonomy
Canonical: yes

## Purpose

This directory stores topic-based research in a consistent layout so future review,
decision-making, and implementation can start from one canonical source instead
of a scattered set of overlapping memos.

## Required Topic Layout

Every research topic must live in `docs/research/<topic-slug>/` and use this
structure:

```text
docs/research/<topic-slug>/
  README.md
  brief.md
  synthesis.md
  evidence.md
  benchmark.md
  <named-roadmap>.md        # optional when execution planning becomes primary
  inputs/
    *.md
```

Role definitions:

- `README.md`: topic index, reading order, status, and artifact register
- `brief.md`: short decision memo for fast review
- `synthesis.md`: canonical architecture synthesis while a topic is still in research
- `evidence.md`: repo-derived findings and file/line evidence
- `benchmark.md`: external-source benchmark and constraints
- `<named-roadmap>.md`: canonical execution-facing plan once a topic moves into
  principal-level implementation planning
- `inputs/*.md`: archived contributor reviews, drafts, or parallel memos

## Required Metadata Header

Each research file must start with a title and these metadata fields in the
header:

- `Date`
- `Status`
- `Type`
- `Audience`
- `Topic`
- `Canonical`

Optional metadata:

- `Derived from`
- `Superseded by`

Example:

```md
# Topic Title

Date: 2026-03-12
Status: active
Type: roadmap
Audience: engineering team
Topic: example-topic
Canonical: yes
Derived from: inputs/peer-review.md
```

## Status Conventions

- `active`: current document used for decision-making
- `supporting`: current supporting appendix or reference
- `archived`: preserved historical input that is no longer canonical

## Working Rules

- Keep exactly one canonical implementation-facing document per topic.
- Use `Type: synthesis` while a topic is primarily in research; switch to
  `Type: roadmap` when execution planning becomes the primary deliverable.
- Point the topic `README.md` to the canonical synthesis or roadmap explicitly.
- Move parallel reviews and drafts into `inputs/` instead of leaving them as
  peer authorities.
- Prefer updating the topic index and the canonical synthesis/roadmap over
  creating another top-level memo.
- Remove stale links when files are renamed or moved.

## Current Topics

- [API modernization](./api-modernization/README.md)
