import { PortfolioNav } from '@/lib/components/portfolio-nav'
import { PageViews } from '@/lib/components/page-views'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full bg-card border border-border/80 pb-16 overflow-auto lg:my-8 lg:mr-8">
      <PortfolioNav />

      {/* Page Views - absolute so it doesn't shift content */}
      <div className="relative p-2 lg:p-3">
        <div className="absolute top-4 right-4 sm:right-5 md:right-6 lg:right-8">
          <PageViews />
        </div>
        {children}
      </div>
    </div>
  )
}
