'use client'

import { useEffect, useState } from 'react'
import { slugify } from '@/lib/utils'

export type TocItem = {
  value: string
  depth: number
  id?: string
  href?: string
}

export function OnThisPage({ toc }: { toc: TocItem[] }) {
  const headings = toc.filter((item) => item.depth === 2)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (headings.length === 0) return

    const headingIds = headings.map((item) =>
      item.id || (item.value.toLowerCase() === 'footnotes' ? 'footnote-label' : slugify(item.value))
    )

    const firstHeadingId = headingIds[0]

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          } else if (entry.target.id === firstHeadingId) {
            // If first heading leaves viewport from bottom (scrolled above it), clear active
            const rect = entry.boundingClientRect
            if (rect.top > 0) {
              setActiveId(null)
            }
          }
        })
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    )

    headingIds.forEach((id) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  return (
    <nav className="p-4 bg-sidebar rounded-t-xl border border-b-0 border-sidebar-border">
      <h3 className="font-medium text-sm text-sidebar-foreground mb-3">On this page</h3>
      <ul className="space-y-2 text-sm">
        {headings.map((item) => {
          const id = item.id || (item.value.toLowerCase() === 'footnotes' ? 'footnote-label' : slugify(item.value))
          const href = item.href || `#${id}`
          const isActive = activeId === id

          return (
            <li key={id}>
              <a
                href={href}
                className={`block transition-colors ${
                  isActive
                    ? 'text-sidebar-foreground font-medium'
                    : 'text-muted-foreground hover:text-sidebar-foreground'
                }`}
              >
                {item.value}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
