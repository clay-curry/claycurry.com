# Fix: Restore missing navigation links

## Root cause

The nav links (about, resume, work, writing, contact) are completely absent from
the deployed site at claycurry.com. The raw HTML contains `"navLinks":[]`.

The problem is in `apps/www/lib/navigation.ts`:

```typescript
const APP_DIR = process.cwd();          // <-- unreliable in production
```

`getSiteNavLinks()` uses `process.cwd()` + `fs.existsSync()` to discover which
route pages exist on the filesystem. This works locally (where cwd is `apps/www`),
but on Vercel the cwd during server rendering resolves to a different directory
(the monorepo root or `/var/task`), so every `fs.existsSync()` check fails and
the function returns an empty array.

**Evidence:**
- Fetching claycurry.com shows `"navLinks":[]` in the serialized server props
- Running the same logic locally with cwd at the monorepo root reproduces
  the empty result: all 10 path checks return NOT FOUND
- Running with cwd at `apps/www` returns all 5 links correctly

## Proposed fix

**Remove the filesystem detection entirely.** Replace `getSiteNavLinks()` with a
static list. The filesystem approach is fragile and unnecessary — routes don't
appear or disappear at runtime; they change only when a developer edits the code,
at which point updating a static list is trivial.

### Changes (single file)

**`apps/www/lib/navigation.ts`**

Before (fragile):
```typescript
import fs from "node:fs";
import path from "node:path";

const APP_DIR = process.cwd();
const ROUTE_GROUPS = ["(portfolio)", "(resume)"];

export function getSiteNavLinks(): NavLink[] {
  return navRoutes
    .filter((route) => {
      return ROUTE_GROUPS.some((group) => {
        const dir = ...;
        return [...extensions].some((f) => fs.existsSync(path.join(dir, f)));
      });
    })
    .map(...);
}
```

After (robust):
```typescript
export type NavLink = { label: string; href: string };

export const siteNavLinks: NavLink[] = [
  { label: "about", href: "/" },
  { label: "resume", href: "/resume" },
  { label: "work", href: "/work" },
  { label: "writing", href: "/writing" },
  { label: "contact", href: "/contact" },
];

/** @deprecated Use `siteNavLinks` directly. Kept for call-site compat. */
export function getSiteNavLinks(): NavLink[] {
  return siteNavLinks;
}
```

- Removes `fs` and `path` imports (no more Node.js filesystem at render time)
- Removes `ROUTE_GROUPS`, `APP_DIR`, and the filter/existsSync logic
- Keeps `getSiteNavLinks()` as a thin wrapper so callers don't need to change
- Navigation order and labels preserved exactly
