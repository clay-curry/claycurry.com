'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { AskAI } from './ask-ai'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/lib/custom/ui/sheet'

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" className={className}>
      <title>GitHub</title>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

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
    <div className='w-full overflow-hidden sticky top-0 z-20 bg-background'>
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
              className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
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
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    {section}
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-4 py-6 px-6 bg-sidebar">
        {sections.map((section) => (
          <Link
            key={section}
            href={`/${section}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${
              activeSection === section
                ? 'text-foreground bg-accent/10'
                : 'text-muted-foreground hover:bg-primary/10'
            }`}
          >
            {section}
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-6">
          <AskAI />
          <Link
            href="https://github.com/claycurry34"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-foreground hover:text-accent hover:bg-secondary transition-colors"
            aria-label="GitHub"
          >
            <GitHubIcon className="size-5" />
          </Link>
        </div>
      </nav>

      {/* Animated dashed border */}
      <div className="relative w-[calc(100%+384px)] h-2 flex items-center mr-20">
        {/* Dashed background line */}
        <div
          className="absolute inset-x-0 h-[1px] bg-sidebar-border"
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
