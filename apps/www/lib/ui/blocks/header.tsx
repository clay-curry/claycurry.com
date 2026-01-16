"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/lib/ui/components/navigation-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/lib/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/lib/ui/components/popover";
import { Button } from "@/lib/ui/controls/button";
import { ModeToggle } from "@/lib/ui/controls/mode-toggle";
import CIcon from "@/lib/ui/icons/c";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "CV", href: "/cv" },
];

export function Header({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Find current page label for the combobox
  const currentPage = navItems.find((item) => {
    if (item.href === "/") return pathname === "/";
    return pathname.startsWith(item.href);
  });

  return (
    <header className={className}>
      <div className="flex justify-between mt-3 py-2 px-2 w-full border-b">
        {/* Left side: Logo + mobile combobox */}
        <div className="flex items-center gap-2">
          <Link
            className="flex items-center gap-2 py-2 px-2 sm:px-12"
            href="/"
            aria-label="Clay Curry"
          >
            <CIcon />
          </Link>

          {/* Mobile combobox - next to logo */}
          <div className="sm:hidden">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-28 justify-between"
                >
                  {currentPage?.label ?? "Navigate"}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-28 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search..." />
                  <CommandList>
                    <CommandEmpty>No page found.</CommandEmpty>
                    <CommandGroup>
                      {navItems.map((item) => (
                        <CommandItem
                          key={item.href}
                          value={item.label}
                          onSelect={() => {
                            router.push(item.href);
                            setOpen(false);
                          }}
                        >
                          {item.label}
                          <Check
                            className={cn(
                              "ml-auto",
                              currentPage?.href === item.href
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Right side: Desktop nav OR mobile theme toggle */}
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

        {/* Mobile theme toggle - right side */}
        <div className="flex sm:hidden items-center">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
