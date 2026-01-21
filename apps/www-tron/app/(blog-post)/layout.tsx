import { PortfolioNav } from '@/lib/components/portfolio-nav'


export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <div className="min-h-screen bg-background w-full">
        <PortfolioNav />
        {children}
      </div>
  )
}
