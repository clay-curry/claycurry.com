"use client";

import Link from "next/link";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/lib/ui/components/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/lib/ui/components/navigation-menu";
import { Button } from "@/lib/ui/controls/button";
import { ModeToggle } from "@/lib/ui/controls/mode-toggle";
import CIcon from "@/lib/ui/icons/c";

export function Header({ className }: { className?: string }) {
  // Dropdown open state for mobile menu (for a11y controlled via state)
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className={className}>
      <div className="flex justify-between mt-3 py-2 px-2 w-full border-b">
        <Link
          className="flex items-center gap-2 py-2 px-2 sm:px-12"
          href="/"
          aria-label="Clay Curry"
        >
          <CIcon />
        </Link>

        {/* Desktop nav 
          TODO: consider refactoring to a loop over nav items
        */}
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
                  <Link href="/cv">CV</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <span className="px-4">
            <ModeToggle />
          </span>
        </nav>

        {/* Mobile nav, appears on sm: screens */}
        <nav className="flex sm:hidden items-center gap-2">
          <ModeToggle />
          {/* Hamburger Button */}
          <DropdownMenu open={mobileOpen} onOpenChange={setMobileOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open navigation menu"
                aria-haspopup="menu"
                aria-expanded={mobileOpen}
              >
                {/* Hamburger SVG icon with accessible title */}
                <svg
                  viewBox="0 0 24 24"
                  className="h-[1.2rem] w-[1.2rem]"
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
                  href="/"
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-accent text-sm"
                  tabIndex={0}
                >
                  Home
                </Link>
              </DropdownMenuItem>
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
                  href="/cv"
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-accent text-sm"
                  tabIndex={0}
                >
                  CV
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
