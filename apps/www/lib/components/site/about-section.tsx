import { aboutData } from "@/lib/portfolio-data";
import { SectionHeader } from "./section-header";

export function AboutSection() {
  const data = aboutData;

  return (
    <div className="mx-4">
      <SectionHeader title="About" />
      <div className="space-y-4 text-md md:text-md text-card-foreground leading-relaxed">
        {data.description.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
