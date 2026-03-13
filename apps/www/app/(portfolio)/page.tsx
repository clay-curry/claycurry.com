import { ArrowRight } from "lucide-react";
import { Hero } from "@/lib/components/site/hero";
import { PreservedQueryLink } from "@/lib/components/site/preserved-query-link";
import { SectionHeader } from "@/lib/components/site/section-header";
import { ContributionSection } from "@/lib/resume/contribution-section";

export default function AboutPage() {
  return (
    <div className="py-8 md:py-12 px-2 md:px-4 space-y-12 md:space-y-14 flex flex-col gap-10">
      <Hero />

      <SectionHeader title="Recent Activity" />

      <Bookmarks />

      <ContributionSection />
    </div>
  );
}

const Bookmarks = () => (
  <PreservedQueryLink
    href="/work/x-bookmarks"
    className="bg-secondary rounded-xl md:rounded-2xl border border-border hover:border-accent hover:shadow-lg transition-all p-6 flex items-center gap-4 group"
  >
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-6 fill-foreground shrink-0"
    >
      <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z" />
    </svg>
    <div className="flex-1 min-w-0">
      <h2 className="font-sans font-semibold tracking-wider text-lg md:text-xl">
        X Bookmarks
      </h2>
      <p className="text-muted-foreground text-sm mt-1">
        A better way to browse and search my X bookmarks.
      </p>
    </div>
    <ArrowRight className="size-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
  </PreservedQueryLink>
);
