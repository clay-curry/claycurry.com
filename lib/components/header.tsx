"use client";

import Link from "next/link";
import { useState } from "react";
import BlueskyIcon from "@/components/icons/bluesky";
import CIcon from "@/components/icons/c";
import GitHubIcon from "@/components/icons/github";
import LinkedInIcon from "@/components/icons/linkedin";
import XIcon from "@/components/icons/x";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle, ModeToggleMobile } from "@/components/ui/mode-toggle";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function Header() {
  // Dropdown open state for mobile menu (for a11y controlled via state)
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header>
      <div className="flex justify-between mt-3 py-2 px-2 w-full border-b">
        <Link
          className="flex items-center gap-2 py-2 px-2 sm:px-12"
          href="/"
          aria-label="Clay Curry"
        >
          <CIcon />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/blog">Blog</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/work">Work</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <div
                className="border-l h-6 mx-2 self-center"
                aria-hidden="true"
              ></div>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <CollaborateButton />
                </NavigationMenuLink>
              </NavigationMenuItem>

              <div
                className="border-l h-6 mx-2 self-center"
                aria-hidden="true"
              ></div>
            </NavigationMenuList>
          </NavigationMenu>
          <span className="px-4">
            <ModeToggle />
          </span>
        </nav>

        {/* Mobile nav, appears on sm: screens */}
        <nav className="flex sm:hidden items-center">
          {/* Hamburger Button */}
          <DropdownMenu open={mobileOpen} onOpenChange={setMobileOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                aria-label="Open navigation menu"
                aria-haspopup="menu"
                aria-expanded={mobileOpen}
                className="p-2"
              >
                {/* Hamburger SVG icon with accessible title */}
                <svg
                  viewBox="0 0 24 24"
                  width={28}
                  height={28}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <title>Menu</title>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-44 mt-2.5 p-1"
              align="end"
              sideOffset={8}
              aria-label="Mobile navigation"
            >
              <DropdownMenuItem>
                <Link
                  href="/blog"
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-accent text-sm"
                  tabIndex={0}
                >
                  Blog
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="/work"
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-accent text-sm"
                  tabIndex={0}
                >
                  Work
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="https://github.com/clay-curry"
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-accent text-sm"
                  tabIndex={0}
                >
                  <GitHubIcon /> GitHub
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="https://linkedin.com/in/clay-curry"
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-accent text-sm"
                  tabIndex={0}
                >
                  <LinkedInIcon /> LinkedIn
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="https://x.com/claycurry_"
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-accent text-sm"
                  tabIndex={0}
                >
                  <XIcon /> Twitter
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="https://bsky.app/profile/claycurry.com"
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-accent text-sm"
                  tabIndex={0}
                >
                  <BlueskyIcon /> Bluesky
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <span>
                  <ModeToggleMobile />
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}

function CollaborateButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="link">
          Collaborate
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-3 p-0 w-32" align="center">
        <DropdownMenuItem asChild>
          <a
            href="https://github.com/clay-curry"
            target="_blank"
            rel="noopener"
            className="flex items-center justify-center gap-2.5 text-left"
          >
            <GitHubIcon /> GitHub
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href="https://linkedin.com/in/clay-curry"
            target="_blank"
            rel="noopener"
            className="flex items-center justify-center gap-2.5 text-left"
          >
            <LinkedInIcon /> LinkedIn
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href="https://x.com/claycurry_"
            target="_blank"
            rel="noopener"
            className="flex items-center justify-center gap-2.5 text-left"
          >
            <XIcon /> Twitter
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href="https://bsky.app/profile/claycurry.com"
            target="_blank"
            rel="noopener"
            className="flex items-center justify-center gap-2.5 text-left"
          >
            <BlueskyIcon /> Bluesky
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
