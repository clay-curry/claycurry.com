import { BookmarksSection } from "@/lib/components/site/bookmarks-section";
import { Hero } from "@/lib/components/site/hero";

export default function AboutPage() {
  return (
    <div className="py-8 md:py-12 space-y-12 md:space-y-14 flex flex-col gap-10">
      <Hero />

      <BookmarksSection />
    </div>
  );
}
