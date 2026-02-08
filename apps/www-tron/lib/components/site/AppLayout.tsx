import Link from "next/link";
import { GitHubIcon, LinkedInIcon, XIcon } from "@/lib/components/icons";
import { ClickCountToggle } from "@/lib/components/site/click-count-toggle";
import { DarkModeToggle } from "@/lib/components/site/dark-mode-toggle";
import { PageViews } from "@/lib/components/site/page-views";
import { PortfolioNav } from "@/lib/components/site/portfolio-nav";
import { ThemeToggle } from "@/lib/components/site/theme-toggle";
import { WeatherEffects } from "@/lib/components/site/weather-effects";
import { WeatherToggle } from "@/lib/components/site/weather-toggle";
import type { NavLink } from "@/lib/navigation";
import { profileData } from "@/lib/portfolio-data";

const socialLinks = [
  { href: profileData.social.x, icon: XIcon, label: "X" },
  { href: profileData.social.github, icon: GitHubIcon, label: "GitHub" },
  { href: profileData.social.linkedin, icon: LinkedInIcon, label: "LinkedIn" },
];

export function AppLayout({
  children,
  navLinks,
}: {
  children: React.ReactNode;
  navLinks: NavLink[];
}) {
  return (
    <div
      data-weather-container
      className="w-full bg-card border border-border/80 overflow-auto lg:my-8 lg:mr-8"
    >
      <WeatherEffects />
      <PortfolioNav navLinks={navLinks} />

      {/* Page Views - absolute so it doesn't shift content */}
      <div className="relative p-2 lg:p-3">
        <div className="absolute top-4 right-4 sm:right-5 md:right-6 lg:right-8">
          <PageViews />
        </div>
        {children}
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between py-6 border-t border-border mx-6">
        <div className="flex items-center gap-4">
          {socialLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              data-click-id={`footer:${link.label.toLowerCase()}`}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors"
              aria-label={link.label}
            >
              <link.icon className="size-5" />
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <ClickCountToggle />
          <WeatherToggle />
          <DarkModeToggle />
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
}
