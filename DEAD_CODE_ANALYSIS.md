# Dead-Code Analysis Report

**Repository:** `/Users/clay/workplace/art/portfolios/claycurry.com/`
**Generated:** 2026-01-24
**Tool:** Manual Analysis with Claude Code

---

## Summary

| Metric | Count |
|--------|-------|
| Total Files Analyzed | 78 |
| Total Exports Analyzed | ~95 |
| Unused Exports Found | 14 |
| Empty/Placeholder Files | 1 |
| Broken Package Configurations | 1 |

---

## Project Configuration

| Property | Value |
|----------|-------|
| Package Manager | pnpm (workspace) |
| Build Orchestration | Turborepo |
| Monorepo Structure | `apps/` + `packages/` |

### Workspace Members

| Package | Path | Type |
|---------|------|------|
| `www-tron` | `apps/www-tron` | Next.js App |
| `www` | `apps/www` | Next.js App |
| `@repo/link-checker` | `packages/link-checker` | Library |

---

## Framework Detection

### apps/www-tron

| Property | Value |
|----------|-------|
| Framework | Next.js (App Router) |
| UI Library | React 18+ |
| Styling | Tailwind CSS v4 |
| Component Library | shadcn/ui |
| Content | MDX |

### apps/www

| Property | Value |
|----------|-------|
| Framework | Next.js (App Router) |
| UI Library | React 18+ |
| Styling | Tailwind CSS |
| Component Library | shadcn/ui |
| Content | MDX |

### packages/link-checker

| Property | Value |
|----------|-------|
| Type | Node.js CLI Tool |
| Runtime | tsx |
| Purpose | Link validation for docs |

---

## Entry Points

### apps/www-tron

| Type | Path |
|------|------|
| Root Layout | `app/layout.tsx` |
| Home Page | `app/page.tsx` |
| Portfolio Layout | `app/(portfolio)/layout.tsx` |
| Blog Post Layout | `app/(blog-post)/layout.tsx` |
| About Page | `app/(portfolio)/about/page.tsx` |
| Blog Index | `app/(portfolio)/blog/page.tsx` |
| Blog Post | `app/(blog-post)/blog/[slug]/page.tsx` |
| Contact Page | `app/(portfolio)/contact/page.tsx` |
| Resume Page | `app/(portfolio)/resume/page.tsx` |
| API Route (OG) | `app/api/og/route.tsx` |
| OG Image | `app/opengraph-image.tsx` |
| MDX Components | `mdx-components.tsx` |

### apps/www

| Type | Path |
|------|------|
| Root Layout | `app/layout.tsx` |
| Home Page | `app/(site)/page.tsx` |
| Blog Index | `app/(site)/blog/page.tsx` |
| Blog Post | `app/(site)/blog/[slug]/page.tsx` |
| Registry Page | `app/(site)/registry/page.tsx` |
| Resume Page | `app/(site)/resume/page.tsx` |
| API Route (OG) | `app/api/og/route.tsx` |
| OG Image | `app/opengraph-image.tsx` |
| MDX Components | `mdx-components.tsx` |

### packages/link-checker

| Type | Path |
|------|------|
| Script Entry | `src/validate-links.ts` |
| Script Entry | `src/validate-docs-links.ts` |
| Module (unused) | `src/route-walker.ts` |
| Module (empty) | `src/writer.ts` |

---

## Symbol Analysis

### apps/www-tron - Dead Code Found

#### Unused Exported Components

| Symbol | File | Issue |
|--------|------|-------|
| `HeroSection` | `lib/components/hero-section.tsx` | Exported but never imported |
| `ProjectsSection` | `lib/components/projects-section.tsx` | Exported but never imported |
| `ProjectCard` | `lib/components/projects-section.tsx` | Should be private (only used internally) |

#### Unused CV Components

| Symbol | File | Issue |
|--------|------|-------|
| `CVText` | `lib/components/ui/cv.tsx` | Exported but never imported |
| `CVRow` | `lib/components/ui/cv.tsx` | Exported but never imported externally |
| `CVDetailBlock` | `lib/components/ui/cv.tsx` | Exported but never imported |
| `CVSimpleContent` | `lib/components/ui/cv.tsx` | Exported but never imported |
| `CVHighlight` | `lib/components/ui/cv.tsx` | Exported but never imported |

**Used CV Components:** `CVBulletList`, `CVContentBody`, `CVLink`, `CVOrgLocation`, `CVPositionAdvisor`, `CVRowItem`, `CVLabel` (internal)

#### Over-exported Page Actions

| Symbol | File | Issue |
|--------|------|-------|
| `ScrollToTop` | `lib/components/page-actions.tsx` | Should be private (only used in PageActions) |
| `CopyPage` | `lib/components/page-actions.tsx` | Should be private (only used in PageActions) |
| `EditOnGitHub` | `lib/components/page-actions.tsx` | Should be private (only used in PageActions) |
| `GiveFeedback` | `lib/components/page-actions.tsx` | Should be private (only used in PageActions) |
| `AskAI` | `lib/components/page-actions.tsx` | Should be private (only used in PageActions) |
| `OpenInChat` | `lib/components/page-actions.tsx` | Should be private (only used in PageActions) |

**Correctly exported:** `PageActions`, `ShareOnX`, `ShareOnLinkedIn`, `CopyPageButton`

#### Unused Data Exports

| Symbol | File | Issue |
|--------|------|-------|
| `portfolioData` | `lib/portfolio-data.ts` | Exported but never imported |
| `blogData` | `lib/portfolio-data.ts` | Exported but never imported |

**Used:** `resumeData`

#### Diagram Components

| Symbol | File | Issue |
|--------|------|-------|
| `DiagramTab` | `lib/components/diagram-tabs.tsx` | Should be private (only used internally) |

---

### packages/link-checker - Dead Code Found

#### Configuration Issues

| Issue | Details |
|-------|---------|
| Missing Entry Point | `package.json` exports `./dist/index.js` but no `dist/` folder exists |
| No Build Step | Package has no build script to generate `dist/` |
| Missing Index | No `src/index.ts` to define public API |

#### Unused Types

| Symbol | File | Issue |
|--------|------|-------|
| `CanonicalUrlNode` | `src/route-walker.ts` | Interface defined but never used |
| `LinkNode` | `src/route-walker.ts` | Interface defined but never used |
| `UrlCache` | `src/route-walker.ts` | References undefined `UrlNode` type |

#### Empty Files

| File | Issue |
|------|-------|
| `src/writer.ts` | Contains only comments (176 lines), no executable code |

#### Exported but Unused

| Symbol | File | Issue |
|--------|------|-------|
| `LinkCache` | `src/route-walker.ts` | Exported but not imported by any package |
| `LinkWriter` | `src/route-walker.ts` | Exported but not imported by any package |
| `LinkFinder` | `src/route-walker.ts` | Exported but not imported by any package |
| `LinkCrawler` | `src/route-walker.ts` | Exported but not imported by any package |

---

## Recommended Actions

### High Priority

1. **Fix link-checker package configuration**
   - Create `src/index.ts` with public exports
   - Add build script to generate `dist/`
   - Or change exports to point to source: `"exports": "./src/index.ts"`

2. **Remove unused component files**
   - `apps/www-tron/lib/components/hero-section.tsx`
   - `apps/www-tron/lib/components/projects-section.tsx`

3. **Clean up CV components**
   - Remove or mark as internal: `CVText`, `CVRow`, `CVDetailBlock`, `CVSimpleContent`, `CVHighlight`

### Medium Priority

4. **Fix route-walker.ts type errors**
   - Define missing `UrlNode` interface (referenced by `UrlCache` but not defined)
   - Remove unused `CanonicalUrlNode` and `LinkNode` interfaces

5. **Remove unused data exports**
   - Remove `portfolioData` and `blogData` from `lib/portfolio-data.ts`

6. **Reduce public API surface**
   - Make page-actions components private (not exported)
   - Make `ProjectCard` and `DiagramTab` private

### Low Priority

7. **Complete or remove writer.ts**
   - File contains design documentation but no implementation
   - Either implement the writers or remove the file

---

## Cross-Framework Reconciliation

Both `www` and `www-tron` apps share similar component patterns but are independent codebases. No cross-package dead code detected.

| Shared Pattern | www | www-tron | Notes |
|----------------|-----|----------|-------|
| CV Components | `lib/ui/components/cv.tsx` | `lib/components/ui/cv.tsx` | Independent implementations |
| Hero Section | `lib/ui/components/hero-section.tsx` | `lib/components/hero-section.tsx` | www-tron version unused |
| Theme Provider | `lib/ui/theme-provider.tsx` | `lib/components/theme-provider.tsx` | Both used |

---

## Appendix

### Analysis Methodology

1. **Entry Point Discovery**: Identified all Next.js pages, layouts, API routes, and MDX entry points
2. **Export Tracing**: Grepped for all `export` statements and traced imports
3. **Usage Verification**: Confirmed each export is imported at least once from an entry point
4. **Type Analysis**: Checked for undefined type references

### Limitations

- **Dynamic imports**: Components loaded via `dynamic()` may not be detected
- **MDX usage**: Components used directly in `.mdx` files require manual verification
- **Build-time code**: Code only used at build time (e.g., generateStaticParams) marked as used
- **Test files**: No test files analyzed (none present in repo)

### Files Excluded from Analysis

- `node_modules/`
- `.next/`
- `.turbo/`
- `dist/`
- Configuration files (`*.config.js`, `*.config.ts`)
