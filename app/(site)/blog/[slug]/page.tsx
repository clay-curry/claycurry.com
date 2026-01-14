import Link from "next/link";
import { getAllPostsMetadata, getPost, type PostMetadata } from "@/blog/utils";
import { BlogBreadcrumb } from "@/lib/ui/components/blog-breadcrumb";
import BlueskyIcon from "@/lib/ui/icons/bluesky";
import FacebookIcon from "@/lib/ui/icons/facebook";
import LinkedInIcon from "@/lib/ui/icons/linkedin";
import XIcon from "@/lib/ui/icons/x";
import { PageViews } from "@/lib/ui/widgets/page-views";

export const dynamicParams = false;

export function generateStaticParams() {
  const postMetadata = getAllPostsMetadata();
  return postMetadata.map((o) => ({ slug: o.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { metadata: postMeta, Content: BlogArticle } = await getPost(slug);
  const { title } = postMeta;

  return (
    <article>
      <PageViews />

      <div className="flex max-w-full flex-row gap-14 md:items-start px-6">
        <ArticleContent slug={slug} title={title}>
          <BlogArticle />
        </ArticleContent>

        <ArticleAside slug={slug} title={title} postMeta={postMeta} />
      </div>
    </article>
  );
}

function ArticleContent({
  title,
  slug,
  children,
}: {
  title: string;
  slug: string;
  children: React.ReactNode;
}) {
  return (
    <article className="w-full text-pretty md:max-w-2xl">
      <div>
        <BlogBreadcrumb slug={slug} title={title} />
        <div>{children}</div>
      </div>
    </article>
  );
}

function ArticleAside({
  slug,
  title,
  postMeta,
}: {
  slug: string;
  title: string;
  postMeta: PostMetadata;
}) {
  return (
    <aside className="sticky top-40 hidden max-h-[calc(100vh-10rem)] w-72 shrink-0 md:block">
      <div className="flex max-h-[calc(100vh-10rem)] flex-col gap-4 transition-all duration-300">
        <PublishedDate date={postMeta.date} />
        <TagList tags={postMeta.tags} />
        <ShareLinks slug={slug} title={title} />
      </div>
    </aside>
  );
}

function PublishedDate({ date }: { date: string }) {
  return (
    <div className="w-full flex flex-row gap-2">
      <span className="block pb-2 font-semibold">Published:</span>
      <p>{date}</p>
    </div>
  );
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <div>
      <span className="block pb-2 font-semibold">Tags</span>
      <div className="flex flex-wrap gap-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-gray-200 px-2 py-1.5 text-sm font-semibold text-gray-800 dark:bg-neutral-800 dark:text-neutral-200"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function ShareLinks({ slug, title }: { slug: string; title: string }) {
  return (
    <div className="w-full">
      <span className="block pb-2 font-semibold">Share</span>
      <div className="flex gap-4">
        <Link
          href={`https://x.com/intent/tweet?text=${encodeURIComponent(`"${title}"`)}&url=${encodeURIComponent(`https://claycurry.com/blog/${slug}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80"
          aria-label="Share on X (Twitter)"
        >
          <XIcon />
        </Link>
        <Link
          href={`https://bsky.app/intent/compose?text=${encodeURIComponent(`"${title}"\n\nhttps://claycurry.com/blog/${slug}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80"
          aria-label="Share on Bluesky"
        >
          <BlueskyIcon />
        </Link>
        <Link
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://claycurry.com/blog/${slug}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80"
          aria-label="Share on LinkedIn"
        >
          <LinkedInIcon />
        </Link>
        <Link
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://claycurry.com/blog/${slug}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80"
          aria-label="Share on Facebook"
        >
          <FacebookIcon />
        </Link>
      </div>
    </div>
  );
}
