'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, MessagesSquare } from 'lucide-react'

import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { motion } from 'motion/react'
import { useChatUI } from '@/lib/hooks/use-chat-ui'
import { Button } from '@/lib/components/ui/button'
import { InitialsAvatar } from '@/lib/components/ui/initials-avatar'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/lib/components/ui/sheet'
import { profileData } from '@/lib/portfolio-data'
import type { NavLink } from '@/lib/navigation'

export function PortfolioNav({ navLinks }: { navLinks: NavLink[] }) {
  const pathname = usePathname()
  const activeSection = pathname === '/' ? 'about' : pathname.split('/')[1]
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { setIsDialogOpen } = useChatUI()

  // Delay rendering of Radix components to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-20 w-full border-b border-border/40 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="flex h-16 items-center px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <InitialsAvatar name="Clay Curry" size={32} />
          <span className="hidden sm:inline-block font-semibold text-foreground">
            CLAY CURRY
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 ml-6">
          {navLinks.map((section) => (
            <Link
              key={section.label}
              href={section.href}
              data-click-id={`nav:${section.label}`}
              className={`relative px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                activeSection === section.label
                  ? 'text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {activeSection === section.label && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-accent/10 border border-accent/40 rounded-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{section.label}</span>
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Ask AI button */}
          <button
            type="button"
            data-click-id="nav:ask-ai"
            className="inline-flex items-center gap-1.5 h-8 px-2.5 text-sm font-medium rounded-xl border border-border/40 text-foreground/80 bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            onClick={() => setIsDialogOpen(true)}
          >
            <MessagesSquare className="size-3.5" />
            Ask AI
          </button>

          {/* Mobile hamburger menu */}
          {mounted ? (
            <Sheet open={open} onOpenChange={setOpen} modal={false}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-click-id="nav:menu"
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
                    {navLinks.map((section) => (
                      <Link
                        key={section.label}
                        href={section.href}
                        data-click-id={`nav:mobile-${section.label}`}
                        onClick={() => setOpen(false)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                          activeSection === section.label
                            ? 'text-foreground bg-accent/10'
                            : 'text-muted-foreground hover:bg-accent/20'
                        }`}
                      >
                        {section.label}
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
