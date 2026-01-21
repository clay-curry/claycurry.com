'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/lib/components/ui/sheet'

const sections = [
  'about',
  'resume',
  'writing',
  'contact',
]

export function PortfolioNav() {
  const pathname = usePathname()
  const activeSection = pathname.split('/')[1] || 'about'
  const [open, setOpen] = useState(false)

  return (
    <div className='w-full overflow-hidden'>
      <style jsx>{`
        @keyframes dotTravel {
          0% {
            left: 0;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>

      {/* Mobile Navigation */}
      <nav className="lg:hidden flex items-center justify-end pt-[30px] pb-2 px-3 sm:px-4 md:px-6">
        <Sheet open={open} onOpenChange={setOpen} modal={false}>
          <SheetTrigger asChild>
            <button
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64" showOverlay={false}>
            <VisuallyHidden>
              <SheetTitle>Navigation menu</SheetTitle>
            </VisuallyHidden>
            <div className="flex flex-col gap-6 mt-12">
              <nav className="flex flex-col gap-2">
                {sections.map((section) => (
                  <Link
                    key={section}
                    href={`/${section}`}
                    onClick={() => setOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                      activeSection === section
                        ? 'text-foreground bg-accent/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    {section}
                  </Link>
                ))}
              </nav>
              <div className="px-4">
                <ThemeToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-4 pt-[30px] pb-2 px-6">
        {sections.map((section) => (
          <Link
            key={section}
            href={`/${section}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${
              activeSection === section
                ? 'text-foreground bg-accent/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {section}
          </Link>
        ))}
        <div className="ml-auto mr-4">
          <ThemeToggle />
        </div>
      </nav>

      {/* Animated dashed border */}
      <div className="relative w-[calc(100%+384px)] h-2 flex items-center mr-20">
        {/* Dashed background line */}
        <div
          className="absolute inset-x-0 h-[1px] bg-foreground/30"
          style={{
            maskImage: 'repeating-linear-gradient(to right, black 0, black 12px, transparent 16px, transparent 24px)',
            WebkitMaskImage: 'repeating-linear-gradient(to right, black 0, black 16px, transparent 16px, transparent 24px)',
          }}
        />
        {/* Light Cycle pill */}
        <div
          className="absolute h-1.5 w-3 rounded-full z-10 bg-primary-accent"
          style={{
            animation: 'dotTravel 32s linear infinite',
            boxShadow: '0 0 8px 2px var(--primary-accent)',
          }}
        />
        {/* Lightribbon - solid trail behind pill */}
        <div
          className="absolute h-0.25 w-96 -translate-x-[calc(100%+4px)] bg-primary-accent"
          style={{
            animation: 'dotTravel 32s linear infinite',
            boxShadow: '0 0 2px 1px var(--primary-accent)',
          }}
        />
      </div>
    </div>
  )
}
