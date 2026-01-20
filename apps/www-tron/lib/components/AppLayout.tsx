import { PortfolioNav } from '@/lib/components/portfolio-nav'
import { PageViews } from '@/lib/components/page-views'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 w-full h-full border border-border/80 pb-16 bg-card overflow-auto">
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
