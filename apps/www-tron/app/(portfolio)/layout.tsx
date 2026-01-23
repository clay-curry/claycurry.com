'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ProfileSidebar } from '@/lib/components/profile-sidebar'
import { ThemeToggle } from '@/lib/components/theme-toggle'
import { profileData } from '@/lib/portfolio-data'

const sections = ['about', 'resume', 'portfolio', 'blog', 'contact']

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const activeSection = pathname.split('/')[1] || 'about'

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-12">
      <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6">
          <ProfileSidebar data={profileData} />

          {/* Main Content */}
          <main className="flex-1 bg-card rounded-xl md:rounded-2xl border border-border overflow-hidden">
            {/* Navigation */}
            <nav className="flex gap-1 sm:gap-2 md:gap-4 p-3 sm:p-4 md:p-6 border-b border-border overflow-x-auto scrollbar-hide">
              {sections.map((section) => (
                <Link
                  key={section}
                  href={`/${section}`}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeSection === section
                      ? 'text-foreground bg-accent/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {section}
                </Link>
              ))}
            </nav>

            <div className="p-4 sm:p-5 md:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
