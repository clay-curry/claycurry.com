"use client";

import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/lib/ui/components/navigation-menu";
import { ModeToggle } from "@/lib/ui/controls/mode-toggle";
import CIcon from "@/lib/ui/icons/c";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "CV", href: "/cv" },
];

export function Header({ className }: { className?: string }) {
  return (
    <header className={className}>
      <div className="flex justify-between mt-3 py-2 px-2 w-full border-b">
        {/* Logo */}
        <Link
          className="flex items-center gap-2 py-2 px-2 sm:px-12"
          href="/"
          aria-label="Clay Curry"
        >
          <CIcon />
        </Link>

        {/* Desktop nav - hidden on mobile (handled by floating menu) */}
        <nav className="hidden sm:flex items-center">
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <span className="px-4">
            <ModeToggle />
          </span>
        </nav>
      </div>
    </header>
  );
}
