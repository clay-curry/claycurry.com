import { PortfolioNav } from '@/lib/components/portfolio-nav'
import { BlogSidebar } from '@/lib/components/blog-sidebar'
import { SidebarProvider, SidebarInset } from '@/lib/components/ui/sidebar'
import { getAllPostsMetadata } from '../(portfolio)/blog/loader'

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const posts = getAllPostsMetadata()

  return (
    <div className="min-h-screen bg-background w-full">
      <PortfolioNav />
      <SidebarProvider>
        <BlogSidebar posts={posts} />
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
