import { Activity as ActivityIcon, ArrowRight } from "lucide-react";
import { ContributionSection } from "@/lib/components/site/contribution-section";
import { Hero } from "@/lib/components/site/hero";
import { PreservedQueryLink } from "@/lib/components/site/preserved-query-link";

export default function AboutPage() {
  return (
    <div className="py-8 md:py-12 px-2 md:px-4 space-y-12 md:space-y-14 flex flex-col gap-10">
      <Hero />

      <RecentActivitySection />

      <ContributionSection />
    </div>
  );
}

function RecentActivitySection() {
  return (
    <section className="w-full mt-10 md:mt-14">
      <div className="flex items-center gap-2 md:gap-3 my-3 border-b border-primary/30 pb-2">
        <ActivityIcon className="w-5 h-5 md:w-6 md:h-6 text-accent" />
        <h2 className="font-tourney font-semibold uppercase tracking-wider text-xl md:text-2xl text-foreground text-shadow-none">
          Recent Activity
        </h2>
      </div>
      <div className="mt-5 md:mt-6">
        <Bookmarks />
      </div>
    </section>
  );
}

const Bookmarks = () => (
  <PreservedQueryLink
    href="/work/y-bookmarks"
    className="bg-secondary rounded-xl md:rounded-2xl border border-border hover:border-accent hover:shadow-lg transition-all p-6 flex items-center gap-4 group"
  >
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-6 fill-foreground shrink-0"
    >
      <g>
        <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path>
      </g>
    </svg>
    <div className="flex-1 min-w-0">
      <h2 className="font-sans font-semibold tracking-wider text-lg md:text-xl">
        Y Bookmarks
      </h2>
      <p className="text-muted-foreground text-sm mt-1">
        reimagined for capturing intent, action items, and threads worth
        sharing.
      </p>
    </div>
    <ArrowRight className="size-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
  </PreservedQueryLink>
);
