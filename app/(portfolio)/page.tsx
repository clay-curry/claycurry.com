import { ContributionSection } from "@/lib/components/site/contribution-section";
import { GuestbookCTA } from "@/lib/components/site/guestbook-cta";
import { Hero } from "@/lib/components/site/hero";
import { IntroSection } from "@/lib/components/site/intro-section";
import { RecentActivitySection } from "@/lib/components/site/recent-activity-section";

export default function AboutPage() {
  return (
    <div className="py-8 md:py-12 px-2 md:px-4 space-y-12 md:space-y-14 flex flex-col gap-10">
      <Hero />
      <IntroSection />
      <RecentActivitySection />
      <ContributionSection />
      <GuestbookCTA />
    </div>
  );
}
