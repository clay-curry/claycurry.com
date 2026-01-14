import Link from "next/link";
import { getAllPostsMetadata } from "@/src/app/(site)/blog/metadata";
import { BlogBreadcrumb } from "@/src/lib/ui/components/blog-breadcrumb";
import { Posts } from "@/src/lib/ui/components/post";
import BlueskyIcon from "@/src/lib/ui/icons/bluesky";
import FacebookIcon from "@/src/lib/ui/icons/facebook";
import LinkedInIcon from "@/src/lib/ui/icons/linkedin";
import XIcon from "@/src/lib/ui/icons/x";
import { PageViews } from "@/src/lib/ui/widgets/page-views";

export const dynamicParams = false;

const postMetadata = getAllPostsMetadata();

export function generateStaticParams() {
  // Include base route with empty array for /blog
  const params: Array<{ slug: string[] }> = [{ slug: [] }];
  // Include each blog post with slug as array
  return params.concat(postMetadata.map((o) => ({ slug: [o.slug] })));
}

export default async function BlogSlugPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  if (!Array.isArray(slug) || slug.length === 0) {
    return (
      <main className="flex-1">
        <div className="w-full flex justify-end px-4 pt-4">
          <PageViews />
        </div>
        <section className="hero-section flex flex-col items-start justify-center min-h-[30vh] py-8 px-4">
          <div className="text-left space-y-4 animate-fade-in-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Blog
            </h1>
          </div>
        </section>
        <div className="my-8 mx-4">
          <h2 className="text-lg py-8">Pinned</h2>
          <Posts
            entries={postMetadata}
            filterEntries={false}
            pinnedOnly={true}
          />
        </div>
        <div className="my-8 mx-4">
          <h2 className="text-lg py-4">Recent</h2>
          <Posts entries={postMetadata} nonPinnedOnly={true} />
        </div>
      </main>
    );
  } else {
    const postMeta = postMetadata.filter((o) => o.slug === slug[0])[0];
    const { default: BlogArticle } = await import(`@/src/blog/${slug}.mdx`);
    const { title } = postMeta;

    return (
      <main className="flex-1">
        <div className="w-full flex justify-end px-4 pt-4">
          <PageViews />
        </div>

        <div className="flex max-w-full flex-row gap-14 md:items-start px-6">
          <article className="w-full text-pretty md:max-w-2xl">
            <div>
              <BlogBreadcrumb slug={slug[0]} title={title || "title missing"} />
              <div>
                <BlogArticle />
              </div>
            </div>
          </article>
          <aside className="sticky top-40 hidden max-h-[calc(100vh-10rem)] w-72 shrink-0 md:block">
            <div className="flex max-h-[calc(100vh-10rem)] flex-col gap-4 transition-all duration-300">
              <div className="w-full flex flex-row gap-2">
                <span className="block pb-2 font-semibold">Published:</span>
                <p>{postMeta.date}</p>
              </div>
              <div>
                <span className="block pb-2 font-semibold">Tags</span>
                <div className="flex flex-wrap gap-4">
                  {postMeta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-gray-200 px-2 py-1.5 text-sm font-semibold text-gray-800 dark:bg-neutral-800 dark:text-neutral-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-full">
                <span className="block pb-2 font-semibold">Share</span>
                <div className="flex gap-4">
                  <Link
                    href={`https://x.com/intent/tweet?text=${encodeURIComponent(`"${title}"`)}&url=${encodeURIComponent(`https://claycurry.com/blog/${slug[0]}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80"
                    aria-label="Share on X (Twitter)"
                  >
                    <XIcon />
                  </Link>
                  <Link
                    href={`https://bsky.app/intent/compose?text=${encodeURIComponent(`"${title}"\n\nhttps://claycurry.com/blog/${slug[0]}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80"
                    aria-label="Share on Bluesky"
                  >
                    <BlueskyIcon />
                  </Link>
                  <Link
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://claycurry.com/blog/${slug[0]}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80"
                    aria-label="Share on LinkedIn"
                  >
                    <LinkedInIcon />
                  </Link>
                  <Link
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://claycurry.com/blog/${slug[0]}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80"
                    aria-label="Share on Facebook"
                  >
                    <FacebookIcon />
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    );
  }
}
