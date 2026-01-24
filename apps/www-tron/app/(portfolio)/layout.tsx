import { ProfileSidebar } from '@/lib/components/profile-sidebar'
import { PortfolioNav } from '@/lib/components/portfolio-nav'
import { PageViews } from '@/lib/components/page-views'
import { profileData } from '@/lib/portfolio-data'

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6">
          <ProfileSidebar data={profileData} />

          {/* Main Content */}
          <main className="flex-1 bg-card rounded-xl md:rounded-2xl border border-border overflow-hidden">
            <PortfolioNav />

            <div className="relative p-4 sm:p-5 md:p-6 lg:p-8">
              {/* Page Views - absolute so it doesn't shift content */}
              <div className="absolute top-4 right-4 sm:right-5 md:right-6 lg:right-8">
                <PageViews />
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
