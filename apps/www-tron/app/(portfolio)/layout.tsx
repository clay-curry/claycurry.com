import { ProfileSidebar } from '@/lib/custom/ai-elements/profile-sidebar'
import { profileData } from '@/lib/portfolio-data'
import { AppLayout } from '@/lib/custom/ai-elements/AppLayout'
import { getSiteNavLinks } from '@/lib/navigation'

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navLinks = getSiteNavLinks()

  return (
    <div className="min-h-screen bg-background p-0">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col-reverse lg:flex-row gap-1 sm:gap-4 md:gap-6">
          <ProfileSidebar data={profileData} />
          <AppLayout navLinks={navLinks}>{children}</AppLayout>
        </div>
      </div>
    </div>
  )
}
