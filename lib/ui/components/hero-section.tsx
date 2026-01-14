import { type ReactNode } from "react";

// Hero section for page header
export const HeroSection = ({ children }: { children: ReactNode }) => (
  <section className="hero-section flex flex-col items-start justify-center px-4">
    <div className="text-left pl-4 space-y-4 animate-fade-in-left min-h-[30vh] pt-24">
      {children}
    </div>
  </section>
);
