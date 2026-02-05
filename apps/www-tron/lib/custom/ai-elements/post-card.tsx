import { Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { PostMetadata } from '@/app/(portfolio)/blog/loader'

export function PostCard({ post }: { post: PostMetadata }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block">
      <article className="group bg-secondary rounded-xl md:rounded-2xl border border-border overflow-hidden hover:border-accent hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 h-full">
        <div className="p-4 md:p-5 flex flex-col h-full">
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
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{post.prefix}</p>

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
          <span className="mt-auto flex items-center gap-2 text-xs md:text-sm text-accent group-hover:gap-3 transition-all font-medium">
            Read More
            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </span>
        </div>
      </article>
    </Link>
  )
}
