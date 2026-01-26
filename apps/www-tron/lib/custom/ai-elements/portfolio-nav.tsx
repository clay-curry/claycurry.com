'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, MessagesSquare, Github } from 'lucide-react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { motion } from 'motion/react'
import { useChatContext } from '@/lib/hooks/use-chat'
import { Button } from '@/lib/custom/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/lib/custom/ui/sheet'

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
  const [mounted, setMounted] = useState(false)
  const { setIsDialogOpen } = useChatContext()

  // Delay rendering of Radix components to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="flex h-16 items-center px-4 md:px-6">
        {/* Logo */}
        <Link href="/about" className="flex items-center gap-3">
          <Image
            src="/favicon-dark.svg"
            alt="Clay Curry"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="hidden sm:inline-block font-semibold text-foreground">
            CLAY CURRY
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 ml-6">
          {sections.map((section) => (
            <Link
              key={section}
              href={`/${section}`}
              className={`relative px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                activeSection === section
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {activeSection === section && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-muted rounded-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{section}</span>
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Ask AI button */}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-8 px-2.5 text-sm font-medium rounded-xl border border-border/40 text-foreground/80 bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            onClick={() => setIsDialogOpen(true)}
          >
            <MessagesSquare className="size-3.5" />
            Ask AI
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com/clay-curry"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-8 w-8 rounded-xl text-black dark:text-foreground/80 bg-muted/50 hover:bg-muted transition-colors"
            aria-label="GitHub"
          >
            <Github className="size-4" />
          </a>

          {/* Mobile hamburger menu */}
          {mounted ? (
            <Sheet open={open} onOpenChange={setOpen} modal={false}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-8 w-8"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <VisuallyHidden>
                  <SheetTitle>Navigation menu</SheetTitle>
                </VisuallyHidden>
                <div className="flex flex-col gap-6 mt-12">
                  <nav className="flex flex-col gap-1">
                    {sections.map((section) => (
                      <Link
                        key={section}
                        href={`/${section}`}
                        onClick={() => setOpen(false)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                          activeSection === section
                            ? 'text-foreground bg-accent/10'
                            : 'text-muted-foreground hover:bg-accent/50'
                        }`}
                      >
                        {section}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}
