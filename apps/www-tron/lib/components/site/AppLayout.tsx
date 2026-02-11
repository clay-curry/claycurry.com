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
      <div className="relative">
        <div className="flex items-center justify-between px-2 lg:px-3">
          <div className="h-10" aria-hidden="true" />
          <PageViews />
        </div>
        <FloatingToolbar className="sticky top-16 z-20 -mt-10 w-fit px-2 lg:px-3" />
        <div className="p-2 lg:p-3 backdrop-blur supports-backdrop-filter:bg-background/60">
          {children}
        </div>
      </div>
    </div>
  );
}
