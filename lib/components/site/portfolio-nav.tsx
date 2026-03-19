"use client";

import { Menu, MessagesSquare, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GitHubIcon, LinkedInIcon, XIcon } from "@/lib/components/icons";
import { FeedbackPopover } from "@/lib/components/site/feedback-popover";
import { PreservedQueryLink } from "@/lib/components/site/preserved-query-link";
import { Button } from "@/lib/components/ui/button";
import { InitialsAvatar } from "@/lib/components/ui/initials-avatar";
import { useChatUI } from "@/lib/hooks/use-chat-ui";
import type { NavLink } from "@/lib/portfolio-data";
import { profileData } from "@/lib/portfolio-data";

export function PortfolioNav({ navLinks }: { navLinks: NavLink[] }) {
  const pathname = usePathname();
  const activeSection = pathname === "/" ? "about" : pathname.split("/")[1];
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setIsDialogOpen } = useChatUI();

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setOpen(false), []);
  const prefetchChat = useCallback(() => {
    void Promise.all([
      import("@/lib/components/chat/chat-dialog"),
      import("@/lib/components/chat/chat-drawer"),
    ]);
  }, []);

  return (
    <header className="sticky top-0 z-20 w-full border-b border-border/40 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="flex h-16 items-center px-4 md:px-6">
        {/* Logo */}
        <PreservedQueryLink href="/" className="flex items-center gap-3">
          <InitialsAvatar name="Clay Curry" size={32} />
          <span className="hidden sm:inline-block font-semibold text-foreground font-[var(--font-pp-neue-montreal)]">
            CLAY CURRY
          </span>
        </PreservedQueryLink>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 ml-6">
          {navLinks.map((section) => (
            <PreservedQueryLink
              key={section.label}
              href={section.href}
              data-click-id={`nav:${section.label}`}
              className={`relative px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                activeSection === section.label
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
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
            </PreservedQueryLink>
          ))}
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Social links */}
          {[
            {
              href: profileData.social.x,
              label: "X",
              icon: XIcon,
              clickId: "nav:x",
            },
            {
              href: profileData.social.github,
              label: "GitHub",
              icon: GitHubIcon,
              clickId: "nav:github",
            },
            {
              href: profileData.social.linkedin,
              label: "LinkedIn",
              icon: LinkedInIcon,
              clickId: "nav:linkedin",
            },
          ].map(({ href, label, icon: Icon, clickId }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              data-click-id={clickId}
              aria-label={label}
              className="inline-flex items-center justify-center size-8 rounded-xl border border-border/40 text-foreground/80 bg-muted/50 hover:bg-muted transition-colors"
            >
              <Icon className="size-3.5" />
            </a>
          ))}

          <div className="h-4 w-px bg-border/40 mx-0.5" />

          {/* Ask AI button */}
          <button
            type="button"
            data-click-id="nav:ask-ai"
            className="inline-flex items-center gap-1.5 h-8 px-2.5 text-sm font-medium rounded-xl border border-border/40 text-foreground/80 bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            onClick={() => setIsDialogOpen(true)}
            onMouseEnter={prefetchChat}
            onFocus={prefetchChat}
          >
            <MessagesSquare className="size-3.5" />
            Ask AI
          </button>

          <FeedbackPopover />

          {/* Mobile hamburger menu */}
          <Button
            variant="ghost"
            size="icon"
            data-click-id="nav:menu"
            className="md:hidden h-8 w-8"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          {mounted &&
            createPortal(
              <AnimatePresence>
                {open && (
                  <>
                    <motion.div
                      key="backdrop"
                      className="fixed inset-0 z-50 bg-black/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      onClick={close}
                    />
                    <motion.div
                      key="drawer"
                      role="dialog"
                      aria-label="Navigation menu"
                      className="fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col gap-4 border-r bg-background shadow-lg will-change-transform"
                      initial={{ x: "-100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "-100%" }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <button
                        type="button"
                        onClick={close}
                        className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100"
                        aria-label="Close menu"
                      >
                        <X className="size-4" />
                      </button>
                      <div className="flex flex-col gap-6 mt-12">
                        <nav className="flex flex-col gap-1">
                          {navLinks.map((section) => (
                            <PreservedQueryLink
                              key={section.label}
                              href={section.href}
                              data-click-id={`nav:mobile-${section.label}`}
                              onClick={close}
                              className={`px-4 py-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                                activeSection === section.label
                                  ? "text-foreground bg-accent/10"
                                  : "text-muted-foreground hover:bg-accent/20"
                              }`}
                            >
                              {section.label}
                            </PreservedQueryLink>
                          ))}
                        </nav>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>,
              document.body,
            )}
        </div>
      </nav>
    </header>
  );
}
