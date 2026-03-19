import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { GuestbookCTA } from "@/lib/components/site/guestbook-cta";
import { PageFeedbackPill } from "@/lib/components/site/page-feedback-pill";

interface PageNavLink {
  href: string;
  label: string;
}

interface PageNavProps {
  prev: PageNavLink;
  next: PageNavLink;
}

const NAV_MAP: Record<string, { prev: PageNavLink; next: PageNavLink }> = {
  "/": {
    prev: { href: "/random", label: "Random" },
    next: { href: "/work", label: "Work" },
  },
  "/random": {
    prev: { href: "/writing", label: "Writing" },
    next: { href: "/", label: "Home" },
  },
  "/writing": {
    prev: { href: "/work", label: "Work" },
    next: { href: "/random", label: "Random" },
  },
  "/work": {
    prev: { href: "/", label: "Home" },
    next: { href: "/writing", label: "Writing" },
  },
};

export function PageNav({ prev, next }: PageNavProps) {
  return (
    <footer className="mt-12 flex flex-col items-center gap-8 border-t border-border pt-16">
      <nav className="flex w-full items-center justify-between gap-4">
        <Link
          href={prev.href}
          className="group flex items-center gap-3 text-left shrink-0"
        >
          <ChevronLeft className="size-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          <div>
            <span className="text-sm text-muted-foreground">Previous</span>
            <p className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">
              {prev.label}
            </p>
          </div>
        </Link>
        <PageFeedbackPill />
        <Link
          href={next.href}
          className="group flex items-center gap-3 text-right shrink-0"
        >
          <div>
            <span className="text-sm text-muted-foreground">Next</span>
            <p className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">
              {next.label}
            </p>
          </div>
          <ChevronRight className="size-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
        </Link>
      </nav>
      <GuestbookCTA />
    </footer>
  );
}

export { NAV_MAP };
