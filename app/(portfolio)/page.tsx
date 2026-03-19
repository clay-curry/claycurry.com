import { ContributionSection } from "@/lib/components/site/contribution-section";

import { Hero } from "@/lib/components/site/hero";
import { IntroSection } from "@/lib/components/site/intro-section";
import { NAV_MAP, PageNav } from "@/lib/components/site/page-nav";
import { RecentActivitySection } from "@/lib/components/site/recent-activity-section";

export default function AboutPage() {
  const { prev, next } = NAV_MAP["/"];
  return (
    <div className="py-8 md:py-12 px-2 md:px-4 space-y-12 md:space-y-14 flex flex-col gap-10">
      <Hero />
      <IntroSection />
      <RecentActivitySection />
      <ContributionSection />

      <PageNav prev={prev} next={next} />
    </div>
  );
}
