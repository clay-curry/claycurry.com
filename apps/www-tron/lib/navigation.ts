import fs from 'node:fs'
import path from 'node:path'

export type NavLink = { label: string; href: string }

// Presentation config: maps filesystem segments to nav display.
// Order here = order in nav. Only listed segments appear.
const navRoutes = [
  { segment: '',        label: 'about',   href: '/' },
  { segment: 'resume',  label: 'resume'  },
  { segment: 'blog',    label: 'writing', href: '/writing' },
  { segment: 'contact', label: 'contact' },
]

const PORTFOLIO_DIR = path.join(process.cwd(), 'app/(portfolio)')

export function getSiteNavLinks(): NavLink[] {
  return navRoutes
    .filter(route => {
      const dir = route.segment === ''
        ? PORTFOLIO_DIR
        : path.join(PORTFOLIO_DIR, route.segment)
      return ['page.tsx', 'page.ts', 'page.jsx', 'page.js']
        .some(f => fs.existsSync(path.join(dir, f)))
    })
    .map(route => ({
      label: route.label,
      href: route.href ?? `/${route.segment}`,
    }))
}
