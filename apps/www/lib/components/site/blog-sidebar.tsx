"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PostMetadata } from "@/app/(portfolio)/blog/loader";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/lib/components/ui/sidebar";
import type { NavLink } from "@/lib/navigation";

interface BlogSidebarProps extends React.ComponentProps<typeof Sidebar> {
  posts: PostMetadata[];
  navLinks: NavLink[];
}

export function BlogSidebar({ posts, navLinks, ...props }: BlogSidebarProps) {
  const pathname = usePathname();
  const starredPosts = posts.filter((post) => post.pinned);
  const otherPosts = posts.filter((post) => !post.pinned);

  return (
    <Sidebar {...props}>
      <SidebarContent>
        {/* Site Navigation */}
        <SidebarGroup>
          <div className="flex justify-center gap-4 py-4">
            {navLinks.map((link) => (
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
            <SidebarGroupLabel>Starred</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {starredPosts.map((post) => (
                  <SidebarMenuItem key={post.slug}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/blog/${post.slug}`}
                    >
                      <Link href={`/blog/${post.slug}`}>
                        <span className="truncate">
                          {post.shortTitle || post.title}
                        </span>
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
          <SidebarGroupLabel>Posts</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {otherPosts.map((post) => (
                <SidebarMenuItem key={post.slug}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/blog/${post.slug}`}
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <span className="truncate">
                        {post.shortTitle || post.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
