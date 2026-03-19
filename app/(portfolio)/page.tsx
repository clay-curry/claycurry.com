import { ContributionSection } from "@/lib/components/site/contribution-section";

import { Hero } from "@/lib/components/site/hero";
import { IntroSection } from "@/lib/components/site/intro-section";
import { NAV_MAP, PageNav } from "@/lib/components/site/page-nav";
import { RecentActivitySection } from "@/lib/components/site/recent-activity-section";
import { SectionIndicator } from "@/lib/components/site/section-indicator";

export default function AboutPage() {
  const { prev, next } = NAV_MAP["/"];
  return (
    <div className="py-8 md:py-12 px-2 md:px-4 flex flex-col gap-12 md:gap-14">
      <SectionIndicator />
      <Hero />
      <IntroSection />
      <RecentActivitySection />
      <ContributionSection />

      <PageNav prev={prev} next={next} />
    </div>
  );
}
