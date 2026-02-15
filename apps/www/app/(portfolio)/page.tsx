import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Hero } from "@/lib/components/site/hero";
import { SectionHeader } from "@/lib/components/site/section-header";
import { ContributionSection } from "@/lib/resume";

export default function AboutPage() {
  return (
    <div className="py-8 md:py-12 px-2 md:px-4 space-y-12 md:space-y-14 flex flex-col gap-10">
      <Hero />

      <SectionHeader title="Recent Activity" />
      <Link
        href="/work/x-bookmarks"
        className="bg-secondary rounded-xl md:rounded-2xl border border-border hover:border-accent hover:shadow-lg transition-all p-6 flex items-center gap-4 group"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-6 fill-foreground shrink-0"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <div className="flex-1 min-w-0">
          <h2 className="font-sans font-semibold tracking-wider text-lg md:text-xl">
            X Bookmarks
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            I love using this product. But if it had just one thing, I might
            marry it.
          </p>
        </div>
        <ArrowRight className="size-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
      </Link>

      {/* Activity */}
      <ContributionSection />
    </div>
  );
}
