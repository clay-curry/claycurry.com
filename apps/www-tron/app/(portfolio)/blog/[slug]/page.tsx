import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Tag, Share2 } from "lucide-react";
import { Linkedin, Twitter } from "lucide-react";
import {
  getAllPostsMetadata,
  getPost,
  type PostMetadata,
} from "@/app/(portfolio)/blog/loader";
import { slugify } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  const postMetadata = getAllPostsMetadata();
  return postMetadata.map((o) => ({ slug: o.slug }));
}

type TocItem = {
  depth: number;
  value: string;
  id?: string;
  href?: string;
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { metadata: postMeta, Content: BlogArticle, toc, readTime } = await getPost(slug);
  const { title } = postMeta;

  return (
    <article className="py-8 md:py-12">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blog
      </Link>

      {/* Header */}
      <header className="mb-8 pb-8 border-b border-border">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground mb-6">{postMeta.subtitle}</p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {postMeta.publishedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {readTime} min read
          </span>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="prose prose-invert max-w-none">
            <BlogArticle />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="lg:sticky lg:top-8 space-y-6">
            {/* On This Page */}
            <OnThisPage toc={toc} />

            {/* Post Meta */}
            <ArticleMeta slug={slug} title={title} postMeta={postMeta} readTime={readTime} />
          </div>
        </aside>
      </div>
    </article>
  );
}

function OnThisPage({ toc }: { toc: TocItem[] }) {
  const headings = toc.filter((item) => item.depth === 2);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="p-4 bg-secondary rounded-xl border border-border">
      <h3 className="font-semibold text-sm text-foreground mb-3">On this page</h3>
      <ul className="space-y-2 text-sm">
        {headings.map((item) => {
          const id = item.id || (item.value.toLowerCase() === "footnotes" ? "footnote-label" : slugify(item.value));
          const href = item.href || `#${id}`;
          return (
            <li key={id}>
              <a
                href={href}
                className="text-muted-foreground hover:text-primary transition-colors block"
              >
                {item.value}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ArticleMeta({
  slug,
  title,
  postMeta,
  readTime,
}: {
  slug: string;
  title: string;
  postMeta: PostMetadata;
  readTime: number;
}) {
  const postUrl = `https://claycurry.com/blog/${slug}`;

  return (
    <div className="p-4 bg-secondary rounded-xl border border-border space-y-4">
      {/* Tags */}
      <div>
        <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {postMeta.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 bg-background rounded text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Share */}
      <div>
        <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </h3>
        <div className="flex gap-2">
          <a
            href={`https://x.com/intent/tweet?text=${encodeURIComponent(`"${title}"`)}&url=${encodeURIComponent(postUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-lg bg-background hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center"
            aria-label="Share on X"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-lg bg-background hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center"
            aria-label="Share on LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Updated */}
      {postMeta.updatedDate && (
        <div className="text-xs text-muted-foreground">
          Updated: {postMeta.updatedDate}
        </div>
      )}
    </div>
  );
}
