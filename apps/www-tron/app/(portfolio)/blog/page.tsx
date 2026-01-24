import { Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getAllPostsMetadata, type PostMetadata } from './loader'

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

function PostCard({ post }: { post: PostMetadata }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block">
      <article className="group bg-secondary rounded-xl md:rounded-2xl border border-border overflow-hidden hover:border-accent hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 h-full">
        <div className="p-4 md:p-5">
          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
              {post.publishedDate}
            </span>
          </div>
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-2 leading-tight group-hover:text-accent transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-1">{post.subtitle}</p>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4">{post.prefix}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 md:py-1 bg-background rounded text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Read More */}
          <span className="flex items-center gap-2 text-xs md:text-sm text-accent group-hover:gap-3 transition-all font-medium">
            Read More
            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </span>
        </div>
      </article>
    </Link>
  )
}
