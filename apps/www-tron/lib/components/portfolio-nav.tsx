'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'

const sections = [
  'about', 
  'resume',
  'writing', 
  'contact', 
]

export function PortfolioNav() {
  const pathname = usePathname()
  const activeSection = pathname.split('/')[1] || 'about'

  return (
    <div className='w-full overflow-hidden'>
      <style jsx>{`
        @keyframes dotTravel {
          0% {
            left: 0;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav className="flex items-center gap-1 sm:gap-2 md:gap-4 pt-[30px] pb-2 px-3 sm:px-4 md:px-6 overflow-x-auto scrollbar-hide">
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
        <div className="ml-auto flex-shrink-0">
          <ThemeToggle />
        </div>
      </nav>

      {/* Animated dashed border */}
      <div className="relative w-[calc(100%+384px)] h-2 flex items-center mr-20">
        {/* Dashed background line */}
        <div
          className="absolute inset-x-0 h-[1px] bg-foreground/30"
          style={{
            maskImage: 'repeating-linear-gradient(to right, black 0, black 12px, transparent 16px, transparent 24px)',
            WebkitMaskImage: 'repeating-linear-gradient(to right, black 0, black 16px, transparent 16px, transparent 24px)',
          }}
        />
        {/* Light Cycle pill */}
        <div
          className="absolute h-1.5 w-3 rounded-full z-10 bg-primary-accent"
          style={{
            animation: 'dotTravel 32s linear infinite',
            boxShadow: '0 0 8px 2px var(--primary-accent)',
          }}
        />
        {/* Lightribbon - solid trail behind pill */}
        <div
          className="absolute h-0.25 w-96 -translate-x-[calc(100%+4px)] bg-primary-accent"
          style={{
            animation: 'dotTravel 32s linear infinite',
            boxShadow: '0 0 2px 1px var(--primary-accent)',
          }}
        />
      </div>
    </div>
  )
}
