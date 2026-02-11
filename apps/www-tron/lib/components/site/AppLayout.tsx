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
      <div className="grid grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
        <div className="row-span-2 self-start sticky top-16 z-20 px-2 lg:px-3 py-2">
          <FloatingToolbar />
        </div>
        <div className="flex justify-end px-2 lg:px-3 py-2">
          <PageViews />
        </div>
        <div className="p-2 lg:p-3 backdrop-blur supports-backdrop-filter:bg-background/60">
          {children}
        </div>
      </div>
    </div>
  );
}
