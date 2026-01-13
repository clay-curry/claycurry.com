"use client";
import Link from "next/link";
import { HeroSection } from "@/lib/ui/components/hero-section";
import { PrimaryLink } from "@/lib/ui/components/link";
import { PageViews } from "@/lib/ui/widgets/page-views";
import BlueskyIcon from "@/lib/ui/icons/bluesky";
import GitHubIcon from "@/lib/ui/icons/github";
import LinkedInIcon from "@/lib/ui/icons/linkedin";
import XIcon from "@/lib/ui/icons/x";

const ContactLink = PrimaryLink;

const socialLinks = [
  { name: "GitHub", href: "https://github.com/clay-curry", icon: <GitHubIcon /> },
  { name: "LinkedIn", href: "https://linkedin.com/in/clay-curry", icon: <LinkedInIcon /> },
  { name: "Twitter", href: "https://x.com/claycurry_", icon: <XIcon /> },
  { name: "Bluesky", href: "https://bsky.app/profile/claycurry.com", icon: <BlueskyIcon /> },
];

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
      <h1 className="text-2xl md:text-2xl lg:text-3xl font-bold tracking-tight">
        Clay Curry
      </h1>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full dark:text-green-400 dark:bg-green-900/30">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Available for hire
      </span>
      <p className="text-lg text-muted-foreground">
        <ContactLink href="mailto:me@claycurry.com">
          me@claycurry.com
        </ContactLink>
      </p>
      <div className="flex items-center gap-4 mt-4">
        {socialLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors [&_svg]:w-6 [&_svg]:h-6"
            aria-label={link.name}
          >
            {link.icon}
          </Link>
        ))}
      </div>
    </HeroSection>
  </article>
);
