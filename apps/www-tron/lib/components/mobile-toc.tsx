'use client'

import { useState } from 'react'
import { List } from 'lucide-react'
import { slugify } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/lib/components/ui/accordion'

export type TocItem = {
  depth: number
  value: string
  id?: string
  href?: string
}

export function MobileToc({ toc }: { toc: TocItem[] }) {
  const [open, setOpen] = useState('')
  const headings = toc.filter((item) => item.depth === 2)

  if (headings.length === 0) {
    return null
  }

  return (
    <div className="lg:hidden sticky top-0 z-40 py-1 bg-background/95 backdrop-blur-sm border-b border-border px-3 sm:px-4 md:px-6">
      <Accordion type="single" collapsible value={open} onValueChange={setOpen}>
        <AccordionItem value="toc" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <List className="w-4 h-4" />
              On this page
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
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
    </div>
  )
}
