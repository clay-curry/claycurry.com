# Changelog

All notable changes to this project will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 2026-01-20

### Added
- MDX blog support with gray-matter frontmatter
- Syntax highlighting via rehype-pretty-code and shiki
- Table of contents generation via rehype-mdx-toc

## 2026-01-19

### Added
- Resume page components imported from old portfolio
- Tourney display font for headings

## 2026-01-18

### Added
- www-tron app with TRON Legacy inspired design system
- Vercel React best practices agent skills
- Web design guidelines skill

### Removed
- next-tex package (consolidated into main app)

## 2026-01-17

### Changed
- Reorganized monorepo: moved link-checker to packages/

## 2026-01-15

### Added
- Stitch decorative component

## 2026-01-14

### Changed
- Cleaned up page index and excluded experimental pages

## 2026-01-13

### Added
- Combobox-style navigation component
- Color palette system

### Changed
- Extracted theme toggle into standalone component
- Improved OG image and spacing

## 2026-01-12

### Added
- Table of contents sidebar for blog posts

### Changed
- Refactored navigation and file structure

### Removed
- Unused blog posts

## 2026-01-11

### Added
- Link checker package for validating documentation links
- Linkinator submodule integration

## 2026-01-10

### Added
- Turborepo monorepo configuration with pnpm workspaces
- turbo.json with build, check, and test task pipelines

### Changed
- Migrated app files into apps/ directory structure

## 2026-01-09

### Added
- Blog summary section on homepage
- GitHub and blog links below hero section

## 2026-01-08

### Added
- LICENSE.md with WTFPL license
- Unit tests for MDX frontmatter parsing
- Copyright 2026 notice

## 2026-01-07

### Added
- Sitemap generation
- Page view tracking
- Syntax highlighting for code blocks
- Dynamic OG image generation

### Changed
- Revised mathematical typography in blog posts

## 2026-01-06

### Added
- Playwright test infrastructure
- MDX publish flag for draft posts

### Changed
- Moved blog content to src directory
- Refactored blog architecture

## 2026-01-05

### Fixed
- Mobile layout responsiveness

### Removed
- TODO.md and stale .env files

## 2026-01-04

### Added
- MathJax/KaTeX rendering support for blog posts

## 2026-01-03

### Changed
- Moved blog post metadata from page.tsx to MDX frontmatter

## 2026-01-02

### Changed
- Redesigned hero section with new copy

## 2026-01-01

### Added
- Clickable MDX section headings

## 2025-12-31

### Added
- Expanded resume page with detailed experience

## 2025-12-29

### Fixed
- Blog post rendering and import issues

## 2025-12-28

### Changed
- Fixed hardcoded sidebar data in blog post pages

## 2025-12-27

### Removed
- Dead code and unused exports

## 2025-12-26

### Changed
- Reindexed UI components

## 2025-12-25

### Added
- Email contact functionality
- Resume section with education and experience

### Changed
- Homepage styling and layout improvements

## 2025-12-24

### Added
- Server deployment configuration for AWS Fargate and Lambda

## 2025-12-23

### Added
- Homepage with hero section and portfolio content

## 2025-12-22

### Fixed
- Theme styling issues

## 2025-12-21

### Added
- Biome for linting and formatting (replacing ESLint)

## 2025-12-20

### Added
- Next.js app with dark theme and shadcn/ui component library
