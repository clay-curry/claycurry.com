import { FloatingToolbar } from "@/lib/components/site/floating-toolbar";
import { PageViews } from "@/lib/components/site/page-views";
import { PortfolioNav } from "@/lib/components/site/portfolio-nav";
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
      <FloatingToolbar />

      <div className="relative p-2 lg:p-3 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="absolute top-4 right-4 sm:right-5 md:right-6 lg:right-8">
          <PageViews />
        </div>
        {children}
      </div>
    </div>
  );
}
