"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/lib/ui/controls/button";
import { ColorPaletteToggle } from "@/lib/ui/controls/color-palette-toggle";
import { ModeToggle } from "@/lib/ui/controls/mode-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Resume", href: "/resume" },
  { label: "Blog", href: "/blog" },
];

type PostEntry = {
  slug: string;
  title: string;
  subtitle: string;
  publishedDate: string;
};

function ThinkingSection({
  posts,
  onNavigate,
}: {
  posts: PostEntry[];
  onNavigate: () => void;
}) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
        Thinking
      </h2>
      <div className="flex flex-col gap-3">
        {posts.slice(0, 2).map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            onClick={onNavigate}
            className="block p-4 transition-shadow border rounded-lg group border-border hover:shadow-md bg-background"
          >
            <div className="mb-1 text-xs text-muted-foreground">
              {post.publishedDate}
            </div>
            <h3 className="font-semibold transition-colors text-link group-hover:text-link-hover">
              {post.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {post.subtitle}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PersonalizeSection() {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
        Personalize
      </h2>
      <div className="flex flex-col gap-3 px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">Dark Mode</span>
          <ModeToggle />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Color Palette</span>
          <ColorPaletteToggle />
        </div>
      </div>
    </section>
  );
}

function NavigationSection({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
        Navigation
      </h2>
      <nav className="flex flex-col gap-1">
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
    </section>
  );
}

function DrawerContent({
  posts,
  onNavigate,
}: {
  posts: PostEntry[];
  onNavigate: () => void;
}) {
  return (
    <div className="flex flex-col h-full p-8 pt-16 overflow-y-auto">
      <ThinkingSection posts={posts} onNavigate={onNavigate} />
      <PersonalizeSection />
      <NavigationSection onNavigate={onNavigate} />
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
        "fixed bottom-6 right-6 z-50 size-12 rounded-md shadow-lg transition-colors sm:hidden",
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

export function FloatingMenu({ posts }: { posts: PostEntry[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Drawer - only visible on mobile when open */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-popover text-popover-foreground transition-transform duration-300 ease-in-out sm:hidden",
          open ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <DrawerContent posts={posts} onNavigate={() => setOpen(false)} />
      </div>

      {/* FAB - only visible on mobile */}
      <FloatingActionButton open={open} onClick={() => setOpen(!open)} />
    </>
  );
}
