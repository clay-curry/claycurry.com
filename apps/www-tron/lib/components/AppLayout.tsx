import { PortfolioNav } from '@/lib/components/portfolio-nav'
import { PageViews } from '@/lib/components/page-views'
import { TopBorder5 } from '@/lib/components/layers/TopBorder5'
import { MainFooter5 } from '@/lib/components/layers/MainFooter5'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 bg-card rounded-xl md:rounded-2xl overflow-hidden">
      <TopBorder5 className="w-full h-auto text-border/80 pl-[28.5px]" />

      {/* Main Content */}
      <div className="pl-[38px] pr-10 translate-y-[-137.5px]">
        <PortfolioNav />

        {/* Top Crown Border */}

        {/* Page Views - absolute so it doesn't shift content */}
        <div className="relative p-4 sm:p-5 md:p-6 lg:p-8 border-x-2 border-border/80">
          <div className="absolute top-4 right-4 sm:right-5 md:right-6 lg:right-8">
            <PageViews />
          </div>
          {children}
        </div>
      </div>

      {/* Bottom Crown Border */}

      <MainFooter5 className="w-full h-auto text-border/80 translate-y-[-177px] pr-[28.5px]" />
    </main>
  )
}
