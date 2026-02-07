import Link from 'next/link'
import { BlogSidebar } from '@/lib/components/site/blog-sidebar'
import { SidebarProvider, SidebarInset } from '@/lib/components/ui/sidebar'
import { getAllPostsMetadata } from '../(portfolio)/blog/loader'
import { getSiteNavLinks } from '@/lib/navigation'

import { AskAI } from '@/lib/components/chat/ask-ai'


export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const posts = getAllPostsMetadata()
  const navLinks = getSiteNavLinks()

  return (
    <div className="min-h-screen w-full">
      <SidebarProvider>
        <BlogSidebar posts={posts} navLinks={navLinks} />
        <SidebarInset>
          {/* Desktop-only top navigation */}
          <nav className="hidden xl:flex items-center gap-4 py-6 px-6 bg-sidebar sticky top-0 z-20">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors text-muted-foreground hover:bg-primary/10"
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-auto flex items-center gap-6">
              <AskAI mode="dialog" />
            </div>
          </nav>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
