"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/lib/ui/controls/button";
import { ModeToggle } from "@/lib/ui/controls/mode-toggle";
import GithubIcon from "@/lib/ui/icons/github";
import LinkedinIcon from "@/lib/ui/icons/linkedin";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "CV", href: "/cv" },
];

function NavigationSection({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex flex-col gap-1">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Navigation
      </h2>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center py-2 px-3 text-lg rounded-md transition-colors",
            isActive(item.href)
              ? "text-link border-l-2 border-link bg-highlight"
              : "hover:bg-accent"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function SettingsSection() {
  return (
    <div className="mt-8">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Settings
      </h2>
      <div className="flex items-center gap-2 py-2 px-3">
        <span className="text-sm">Theme</span>
        <ModeToggle />
      </div>
    </div>
  );
}

function ConnectSection() {
  return (
    <div className="mt-8">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Connect
      </h2>
      <div className="flex items-center gap-4 py-2 px-3">
        <a
          href="https://github.com/clay-curry"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="hover:opacity-70 transition-opacity"
        >
          <GithubIcon />
        </a>
        <a
          href="https://linkedin.com/in/claycurry"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="hover:opacity-70 transition-opacity"
        >
          <LinkedinIcon />
        </a>
      </div>
    </div>
  );
}

function DrawerContent({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex flex-col h-full p-8 pt-16 overflow-y-auto">
      <NavigationSection onNavigate={onNavigate} />
      <SettingsSection />
      <ConnectSection />
    </div>
  );
}

function FloatingActionButton({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50 size-12 rounded-md shadow-lg transition-colors",
        open
          ? "bg-muted text-muted-foreground hover:bg-muted/80"
          : "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
      size="icon"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
    >
      {open ? <X className="size-6" /> : <Menu className="size-6" />}
    </Button>
  );
}

export function FloatingMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-popover text-popover-foreground transition-transform duration-300 ease-in-out",
          open ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <DrawerContent onNavigate={() => setOpen(false)} />
      </div>

      <FloatingActionButton open={open} onClick={() => setOpen(!open)} />
    </>
  );
}
