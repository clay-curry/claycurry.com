"use client";
import type { ReactNode } from "react";
import { PageViews } from "@/src/lib/ui/widgets/page-views";

export default () => (
  <>
    <style jsx>{`
      @keyframes fadeInEffect {
        to {
          opacity: 1;
        }
      }
    `}</style>

    <section className="w-full flex flex-col items-center px-4">
      <div className="w-full max-w-6xl flex justify-end mt-4">
        <PageViews />
      </div>
    </section>

    <HeroSection>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
        Clay Curry
      </h1>
      <p className="mt-4 text-lg text-gray-700 dark:text-gray-200">
        Seattle, WA •{" "}
        <SocialLink href="mailto:me@claycurry.com">me@claycurry.com</SocialLink>
      </p>
    </HeroSection>
  </>
);

// Hero section for page header
const HeroSection = ({ children }: { children: ReactNode }) => (
  <section className="hero-section flex flex-col items-start justify-center px-4">
    <div className="text-left pl-4 space-y-4 animate-fade-in-left min-h-[30vh] pt-24">
      {children}
    </div>
  </section>
);

// Social/contact link (no underline by default, shows on hover)
const SocialLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a
    href={href}
    className="text-blue-600 dark:text-blue-400 hover:underline"
  >
    {children}
  </a>
);
