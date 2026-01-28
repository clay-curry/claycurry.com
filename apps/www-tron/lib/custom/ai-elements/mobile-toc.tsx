'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { List } from 'lucide-react'
import { slugify } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/lib/custom/ui/accordion'
import { SidebarTrigger } from '@/lib/custom/ui/sidebar'

const siteNavLinks = [
  { label: 'About', href: '/about' },
  { label: 'Resume', href: '/resume' },
  { label: 'Writing', href: '/writing' },
  { label: 'Contact', href: '/contact' },
]

export type TocItem = {
  depth: number
  value: string
  id?: string
  href?: string
}

export function MobileToc({ toc }: { toc: TocItem[] }) {
  const [open, setOpen] = useState('')
  const [mounted, setMounted] = useState(false)
  const headings = toc.filter((item) => item.depth === 2)

  // Delay rendering of Radix components to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (headings.length === 0) {
    return null
  }

  // Fixed full-width bar that sticks to top
  const containerStyles = "xl:hidden fixed top-0 left-0 right-0 z-40 py-1 bg-background/95 backdrop-blur-sm border-b border-border px-3 sm:px-4 md:px-6"

  if (!mounted) {
    return (
      <>
        <div className={containerStyles}>
          <div className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <List className="w-4 h-4" />
              On this page
            </span>
            <SidebarTrigger className="-mr-1" />
          </div>
        </div>
        {/* Spacer to prevent content from being hidden behind fixed header */}
        <div className="xl:hidden h-12" />
      </>
    )
  }

  return (
    <>
      <div className={containerStyles}>
        <div className="relative">
          <Accordion type="single" collapsible value={open} onValueChange={setOpen}>
            <AccordionItem value="toc" className="border-none">
              <AccordionTrigger className="py-2 hover:no-underline pr-10">
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <List className="w-4 h-4" />
                  On this page
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="flex justify-center gap-4 py-4 border-b border-border mb-2">
                  {siteNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <ul className="py-4 text-sm">
                  {headings.map((item) => {
                    const id = item.id || (item.value.toLowerCase() === 'footnotes' ? 'footnote-label' : slugify(item.value))
                    return (
                      <li
                        key={id}
                        className="text-muted-foreground hover:text-primary active:text-primary transition-colors py-1.5 pl-6 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpen('')
                          const targetId = id
                          setTimeout(() => {
                            const el = document.getElementById(targetId)
                            if (el) {
                              const y = el.getBoundingClientRect().top + window.scrollY - 80
                              window.scrollTo({ top: y, behavior: 'instant' })
                            }
                          }, 150)
                        }}
                      >
                        {item.value}
                      </li>
                    )
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <SidebarTrigger className="absolute right-0 top-1 -mr-1" />
        </div>
      </div>
      {/* Spacer to prevent content from being hidden behind fixed header */}
      <div className="xl:hidden h-12" />
    </>
  )
}
