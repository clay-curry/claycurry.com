"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { PageFeedbackPill } from "@/lib/components/site/page-feedback-pill";

interface AdjacentPost {
  slug: string;
  title: string;
  shortTitle?: string;
}

interface BlogPostFooterProps {
  prev: AdjacentPost | null;
  next: AdjacentPost | null;
}

export function BlogPostFooter({ prev, next }: BlogPostFooterProps) {
  return (
    <footer className="mt-12">
      {/* Separator */}
      <div className="border-t border-border" />

      {/* Prev / Next navigation */}
      {(prev || next) && (
        <nav className="flex items-stretch justify-between gap-4 py-10">
          {prev ? (
            <Link
              href={`/blog/${prev.slug}`}
              className="group flex items-center gap-3 text-left"
            >
              <ChevronLeft className="size-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              <div>
                <span className="text-sm text-muted-foreground">Previous</span>
                <p className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">
                  {prev.shortTitle ?? prev.title}
                </p>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/blog/${next.slug}`}
              className="group flex items-center gap-3 text-right"
            >
              <div>
                <span className="text-sm text-muted-foreground">Next</span>
                <p className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">
                  {next.shortTitle ?? next.title}
                </p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </Link>
          ) : (
            <div />
          )}
        </nav>
      )}

      {/* Inline feedback pill */}
      <PageFeedbackPill />

      {/* Bottom separator */}
      <div className="border-t border-border" />
    </footer>
  );
}
