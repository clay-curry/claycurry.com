import { SectionHeader } from "./section-header";

export function Thoughts() {
  return (
    <div className="mx-4">
      <SectionHeader title="Thoughts" />
      <div className="space-y-4 text-md md:text-md text-card-foreground leading-relaxed">
        <p>Steve Jobs</p>
        <p>
          Creativity is just connecting things. When you ask creative people how
          they did something, they feel a little guilty because they didn't
          really do it, they just saw something.
        </p>
      </div>
    </div>
  );
}
