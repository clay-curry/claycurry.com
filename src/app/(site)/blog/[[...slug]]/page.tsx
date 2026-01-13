import Link from "next/link";
import { BlogBreadcrumb } from "@/src/lib/ui/components/blog-breadcrumb";
import { PageViews } from "@/src/lib/ui/widgets/page-views";
import { Posts } from "@/src/lib/ui/components/posts";
import { getAllPostsMetadata } from "@/src/app/(site)/blog/_lib/metadata";

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
    const { default: BlogArticle } = await import(`@/src/app/(site)/blog/_content/${slug}.mdx`);
    const { title } = postMeta;

    return (
      <main className="flex-1">
        <div className="w-full flex justify-end px-4 pt-4">
          <PageViews />
        </div>

        <div className="flex max-w-full flex-row justify-between md:items-start">
          <article className="w-full text-pretty m-6 md:max-w-xl">
            <div>
              <BlogBreadcrumb slug={slug[0]} title={title || "title missing"} />
              <div>
                <BlogArticle />
              </div>
            </div>
          </article>
          <aside className="sticky top-40 hidden max-h-[calc(100vh-10rem)] w-72 md:block">
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
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fab"
                      data-icon="x-twitter"
                      className="svg-inline--fa fa-x-twitter h-5 w-5 dark:text-neutral-300"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                    >
                      <path
                        fill="currentColor"
                        d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
                      ></path>
                    </svg>
                  </Link>
                  <Link
                    href={`https://bsky.app/intent/compose?text=${encodeURIComponent(`"${title}"\n\nhttps://claycurry.com/blog/${slug[0]}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80"
                    aria-label="Share on Bluesky"
                  >
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fab"
                      data-icon="bluesky"
                      className="svg-inline--fa fa-bluesky h-5 w-5 text-[#0085ff] dark:text-neutral-300"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                    >
                      <path
                        fill="currentColor"
                        d="M111.8 62.2C170.2 105.9 233 194.7 256 242.4c23-47.6 85.8-136.4 144.2-180.2c42.1-31.6 110.3-56 110.3 21.8c0 15.5-8.9 130.5-14.1 149.2C478.2 298 412 314.6 353.1 304.5c102.9 17.5 129.1 75.5 72.5 133.5c-107.4 110.2-154.3-27.6-166.3-62.9l0 0c-1.7-4.9-2.6-7.8-3.3-7.8s-1.6 3-3.3 7.8l0 0c-12 35.3-59 173.1-166.3 62.9c-56.5-58-30.4-116 72.5-133.5C100 314.6 33.8 298 15.7 233.1C10.4 214.4 1.5 99.4 1.5 83.9c0-77.8 68.2-53.4 110.3-21.8z"
                      ></path>
                    </svg>
                  </Link>
                  <Link
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://claycurry.com/blog/${slug[0]}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80"
                    aria-label="Share on LinkedIn"
                  >
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fab"
                      data-icon="linkedin"
                      className="svg-inline--fa fa-linkedin h-5 w-5 text-[#0077b5] dark:text-neutral-300"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="currentColor"
                        d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"
                      ></path>
                    </svg>
                  </Link>
                  <Link
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://claycurry.com/blog/${slug[0]}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80"
                    aria-label="Share on Facebook"
                  >
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fab"
                      data-icon="facebook-f"
                      className="svg-inline--fa fa-facebook-f h-5 w-5 text-[#1877f2] dark:text-neutral-300"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 320 512"
                    >
                      <path
                        fill="currentColor"
                        d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z"
                      ></path>
                    </svg>
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
