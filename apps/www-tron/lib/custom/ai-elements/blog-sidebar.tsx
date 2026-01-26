'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Star, FileText } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/lib/custom/ui/sidebar'
import type { PostMetadata } from '@/app/(portfolio)/blog/loader'

const siteNavLinks = [
  { label: 'About', href: '/about' },
  { label: 'Resume', href: '/resume' },
  { label: 'Writing', href: '/writing' },
  { label: 'Contact', href: '/contact' },
]

interface BlogSidebarProps extends React.ComponentProps<typeof Sidebar> {
  posts: PostMetadata[]
}

export function BlogSidebar({ posts, ...props }: BlogSidebarProps) {
  const pathname = usePathname()
  const starredPosts = posts.filter((post) => post.pinned)
  const otherPosts = posts.filter((post) => !post.pinned)

  return (
    <Sidebar {...props}>
      <SidebarContent>
        {/* Site Navigation */}
        <SidebarGroup>
          <div className="flex justify-center gap-4 py-4">
            {siteNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Starred Section */}
        {starredPosts.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>
              Starred
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {starredPosts.map((post) => (
                  <SidebarMenuItem key={post.slug}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/blog/${post.slug}`}
                    >
                      <Link href={`/blog/${post.slug}`}>
                        <span className="truncate">{post.shortTitle || post.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Other Posts Section */}
        <SidebarGroup>
          <SidebarGroupLabel>
            Posts
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {otherPosts.map((post) => (
                <SidebarMenuItem key={post.slug}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/blog/${post.slug}`}
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <span className="truncate">{post.shortTitle || post.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
