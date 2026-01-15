"use client";
import Link from "next/link";
import { HeroSection } from "@/lib/ui/components/hero-section";
import { PrimaryLink } from "@/lib/ui/components/link";
import { PageViews } from "@/lib/ui/widgets/page-views";

const ContactLink = PrimaryLink;

export default () => (
  <article>
    <style jsx>{`
      @keyframes fadeInEffect {
        to {
          opacity: 1;
        }
      }
    `}</style>

    <section className="w-full flex flex-col items-center px-4">
      <PageViews />
    </section>

    <HeroSection>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
        Clay Curry
      </h1>
      <p className="mt-4 text-lg text-gray-700 dark:text-gray-200">
        Seattle, WA •{" "}
        <ContactLink href="mailto:me@claycurry.com">
          me@claycurry.com
        </ContactLink>
      </p>
      <div className="flex gap-4 mt-2">
        <Link
          href="/blog"
          className="text-black dark:text-white underline-offset-4 hover:underline"
        >
          Blog
        </Link>
        <a
          href="https://github.com/clay-curry"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black dark:text-white underline-offset-4 hover:underline"
        >
          GitHub
        </a>
      </div>
    </HeroSection>
  </article>
);
