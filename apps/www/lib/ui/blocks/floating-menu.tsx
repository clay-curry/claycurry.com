"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Palette, X } from "lucide-react";

import { Button } from "@/lib/ui/controls/button";
import { ModeToggle } from "@/lib/ui/controls/mode-toggle";
import RightArrow from "@/lib/ui/icons/right-arrow";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "CV", href: "/cv" },
];

const colorPalettes = ["zinc", "stone", "slate", "neutral", "gray"] as const;
type ColorPalette = (typeof colorPalettes)[number];

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
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Thinking
      </h2>
      <div className="flex flex-col gap-3">
        {posts.slice(0, 2).map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            onClick={onNavigate}
            className="group block rounded-lg border border-border p-4 transition-shadow hover:shadow-md bg-background"
          >
            <div className="text-xs text-muted-foreground mb-1">
              {post.publishedDate}
            </div>
            <h3 className="font-semibold text-link transition-colors group-hover:text-link-hover">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {post.subtitle}
            </p>
            <p className="flex items-center gap-1 text-sm mt-2">
              Read More
              <RightArrow />
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ColorPaletteToggle() {
  const [palette, setPalette] = useState<ColorPalette>("zinc");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const html = document.documentElement;

    // First check localStorage
    const stored = localStorage.getItem("color-palette") as ColorPalette | null;
    if (stored && colorPalettes.includes(stored)) {
      // Apply stored palette
      for (const p of colorPalettes) {
        html.classList.remove(`theme-${p}`);
      }
      html.classList.add(`theme-${stored}`);
      setPalette(stored);
      return;
    }

    // Otherwise check existing class on html element
    for (const p of colorPalettes) {
      if (html.classList.contains(`theme-${p}`)) {
        setPalette(p);
        return;
      }
    }

    // Default to zinc if nothing set
    html.classList.add("theme-zinc");
    setPalette("zinc");
  }, []);

  const cyclePalette = () => {
    const currentIndex = colorPalettes.indexOf(palette);
    const nextIndex = (currentIndex + 1) % colorPalettes.length;
    const nextPalette = colorPalettes[nextIndex];

    // Remove all palette classes and add the new one
    const html = document.documentElement;
    for (const p of colorPalettes) {
      html.classList.remove(`theme-${p}`);
    }
    html.classList.add(`theme-${nextPalette}`);
    setPalette(nextPalette);

    // Persist to localStorage
    localStorage.setItem("color-palette", nextPalette);
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Palette className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cyclePalette}
      title={`Current: ${palette}. Click to cycle.`}
    >
      <Palette className="size-4" />
    </Button>
  );
}

function PersonalizeSection() {
  return (
    <section className="mt-8">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Personalize
      </h2>
      <div className="flex flex-col gap-3 py-2 px-3">
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
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
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

export function FloatingMenu({ posts }: { posts: PostEntry[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-popover text-popover-foreground transition-transform duration-300 ease-in-out",
          open ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <DrawerContent posts={posts} onNavigate={() => setOpen(false)} />
      </div>

      <FloatingActionButton open={open} onClick={() => setOpen(!open)} />
    </>
  );
}
