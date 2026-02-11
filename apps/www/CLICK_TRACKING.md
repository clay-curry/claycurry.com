# Click Tracking — Contributor Guide

## How it works (30 seconds)

Every interactive element with a `data-click-id` attribute is automatically tracked.
A global click listener captures clicks, batches them, and sends counts to Redis.
When the "Click Counts" toggle in the footer is enabled, neon badges appear on
every tracked element showing its cumulative click count.

You do NOT need to import anything, add hooks, or wrap components.
Just add one HTML attribute.

## Adding tracking to a new element (1 minute)

Add `data-click-id` to any clickable element:

    <Button data-click-id="settings:dark-mode">Toggle Dark Mode</Button>
    <Link href="/about" data-click-id="nav:about">About</Link>

That's it. The system handles everything else.

## ID naming rules (2 minutes)

Format: `{section}:{element}` or `{section}:{element}:{qualifier}`

| Rule | Example | Why |
|------|---------|-----|
| Use the **page section** as prefix | `nav:`, `hero:`, `sidebar:`, `footer:`, `resume:`, `contact:`, `post:`, `blog:` | Groups related elements in Redis |
| Use a **short, descriptive** element name | `ask-ai`, `github`, `submit`, `share-x` | Human-readable in analytics |
| Add a **qualifier** for dynamic items | `blog:post:my-slug`, `resume:accordion:item-1` | Prevents ID collisions |
| IDs must be **globally unique** | No two elements on the same page share an ID | One count per element |
| IDs must be **stable across deploys** | Don't use generated IDs, array indices, or timestamps | Counts survive refactors |
| Use **kebab-case** | `hero:ask-ai` not `hero:askAI` | Consistency |

## What NOT to do

- Do NOT import `useClickCounts` or any tracking hook in your component
- Do NOT add onClick handlers for tracking — the global listener handles it
- Do NOT use array indices or React keys as ID qualifiers — they're unstable
- Do NOT add `data-click-id` to non-interactive elements (divs, spans, headings)

## Quick checklist for PR review

- [ ] Every new button/link has a `data-click-id`
- [ ] The ID follows `{section}:{element}` format
- [ ] The ID is unique (grep for it — no duplicates)
- [ ] The ID is kebab-case and human-readable
- [ ] No tracking imports were added to the component

## Architecture (if you're curious)

    Element (data-click-id)
         | click event bubbles
    Global listener (document level)
         | batches IDs every 2s
    POST /api/clicks { ids: [...] }
         |
    Redis Hash "clicks" (HINCRBY)
         |
    Jotai atom (clickCountsAtom)
         |
    ClickCountOverlay (positioned badges)

Toggle state: Jotai atomWithStorage -> localStorage key "portfolio:click-counts"
