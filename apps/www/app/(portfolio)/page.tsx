import { Hero } from "@/lib/components/site/hero";
import { Thoughts } from "@/lib/components/site/thoughts";

export default function AboutPage() {
  // Page owns data acquisition; WritingsSection stays a pure presentation component.
  // This keeps filesystem loading visible at the server-component boundary, avoids
  // coupling the component to the data source, and allows future reuse with
  // different post sets (filtered, paginated, from a CMS, etc.).

  return (
    <div className="py-8 md:py-12 space-y-12 md:space-y-14 flex flex-col gap-10">
      <Hero />
      <div className="py-16" />
      <div className="px-4">What I do:</div>
      <Thoughts />
    </div>
  );
}
