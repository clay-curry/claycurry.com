import { PortfolioNav } from '@/lib/custom/ai-elements/portfolio-nav'
import { BlogSidebar } from '@/lib/custom/ai-elements/blog-sidebar'
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
