import { ClickCountToggle } from "@/lib/components/site/click-count-toggle";
import { DarkModeToggle } from "@/lib/components/site/dark-mode-toggle";
import { PageViews } from "@/lib/components/site/page-views";
import { PortfolioNav } from "@/lib/components/site/portfolio-nav";
import { ThemeToggle } from "@/lib/components/site/theme-toggle";
import type { NavLink } from "@/lib/navigation";

export function AppLayout({
  children,
  navLinks,
}: {
  children: React.ReactNode;
  navLinks: NavLink[];
}) {
  return (
    <div className="w-full border border-border/80 overflow-auto lg:my-8 lg:mr-8 bg-background/95">
      <PortfolioNav navLinks={navLinks} />

      {/* Page Views - absolute so it doesn't shift content */}
      <div className="relative p-2 lg:p-3 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="absolute top-4 right-4 sm:right-5 md:right-6 lg:right-8">
          <PageViews />
        </div>
        {children}
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-end py-6 border-t border-border mx-6 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex items-center gap-4">
          <ClickCountToggle />
          <DarkModeToggle />
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
}
