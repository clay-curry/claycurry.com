import { PostCard } from '@/lib/components/site/post-card'
import { getAllPostsMetadata } from './loader'

const posts = getAllPostsMetadata()

export default function BlogPage() {
  const pinnedPosts = posts.filter((post) => post.pinned)
  const recentPosts = posts.filter((post) => !post.pinned)

  return (
    <div className="py-8 md:py-12 space-y-12 md:space-y-14">
      {/* Pinned Posts */}
      {pinnedPosts.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-tourney font-semibold uppercase tracking-wider text-xl md:text-2xl">Pinned</span>
            <div className="w-3 h-px bg-foreground rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {pinnedPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Posts */}
      <div className="mt-10 mb-20">
        <div className="flex items-center gap-4 mb-12">
          <span className="font-tourney font-semibold uppercase tracking-wider text-xl md:text-2xl">Recent</span>
          <div className="w-3 h-px bg-foreground rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {recentPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </div>
  )
}
