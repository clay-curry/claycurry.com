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
} from '@/lib/custom/ui/sidebar'
import type { PostMetadata } from '@/app/(portfolio)/blog/loader'

interface BlogSidebarProps extends React.ComponentProps<typeof Sidebar> {
  posts: PostMetadata[]
}

export function BlogSidebar({ posts, ...props }: BlogSidebarProps) {
  const pathname = usePathname()
  const starredPosts = posts.filter((post) => post.pinned)
  const allPosts = posts

  return (
    <Sidebar {...props}>
      <SidebarContent>
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

        {/* All Posts Section */}
        <SidebarGroup>
          <SidebarGroupLabel>
            All Posts
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allPosts.map((post) => (
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
