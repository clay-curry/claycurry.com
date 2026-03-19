import type React from "react";
import { FloatingToolbar } from "@/lib/components/site/floating-toolbar";
import { PageViews } from "@/lib/components/site/page-views";
import { PortfolioNav } from "@/lib/components/site/portfolio-nav";
import { getSiteNavLinks } from "@/lib/portfolio-data";

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh lg:h-dvh lg:overflow-hidden p-0 mx-auto max-w-7xl">
      <div className="flex min-h-dvh flex-col gap-1 sm:gap-4 md:gap-6 lg:h-full lg:flex-row">
        <MainBody>{children}</MainBody>
      </div>
    </div>
  );
}

function MainBody({ children }: { children: React.ReactNode }) {
  const navLinks = getSiteNavLinks();

  return (
    <div className="order-1 w-full border border-border/80 bg-background/95 lg:order-2 lg:my-8 lg:mr-8 lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:overflow-hidden">
      <PortfolioNav navLinks={navLinks} />
      <div className="flex justify-between px-2 lg:px-3 py-2 lg:shrink-0">
        <FloatingToolbar />
        <PageViews />
      </div>
      <div className="p-2 sm:p-6 backdrop-blur supports-backdrop-filter:bg-background/60 lg:overflow-y-auto lg:flex-1">
        {children}
      </div>
    </div>
  );
}
