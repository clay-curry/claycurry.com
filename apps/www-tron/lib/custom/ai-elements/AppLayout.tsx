import { PortfolioNav } from '@/lib/custom/ai-elements/portfolio-nav'
import { PageViews } from '@/lib/custom/ai-elements/page-views'
import { ThemeToggle } from '@/lib/custom/ai-elements/theme-toggle'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full bg-card border border-border/80 overflow-auto lg:my-8 lg:mr-8">
      <PortfolioNav />

      {/* Page Views - absolute so it doesn't shift content */}
      <div className="relative p-2 lg:p-3">
        <div className="absolute top-4 right-4 sm:right-5 md:right-6 lg:right-8">
          <PageViews />
        </div>
        {children}
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-center py-6 border-t border-border mx-6">
        <ThemeToggle />
      </footer>
    </div>
  )
}
