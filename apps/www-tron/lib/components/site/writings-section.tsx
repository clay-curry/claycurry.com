import type { PostMetadata } from "@/app/(portfolio)/blog/loader";
import { PostCard } from "./post-card";
import { SectionHeader } from "./section-header";

export function WritingsSection({ posts }: { posts: PostMetadata[] }) {
  const recentPosts = posts.slice(0, 3);

  return (
    <div className="mx-4">
      <SectionHeader title="Writings" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {recentPosts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
