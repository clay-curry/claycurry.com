import Link from "next/link";
import { useState } from "react";
import {
  getAllPostsMetadata,
  getPost,
  type PostMetadata,
} from "@/app/(site)/blog/loader";
import { BlogBreadcrumb } from "@/lib/ui/components/blog-breadcrumb";
import BackToTop from "@/lib/ui/components/back-to-top";
import BlueskyIcon from "@/lib/ui/icons/bluesky";
import LinkedInIcon from "@/lib/ui/icons/linkedin";
import XIcon from "@/lib/ui/icons/x";
import { slugify } from "@/lib/utils";
import { PageViews } from "@/lib/ui/widgets/page-views";

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
    <article>
      <PageViews />
      <BlogBreadcrumb slug={slug} title={title} />
      
      <ArticleContent
        slug={slug}
        title={title}
        left={<OnThisPage toc={toc} />}
        right={<ArticleMeta slug={slug} title={title} postMeta={postMeta} readTime={readTime} />}
      >
      
        <BlogArticle />
      
      </ArticleContent>

    </article>
  );
}

const ArticleContent = ({
  title,
  slug,
  children,
  left,
  right: right,
}: {
  title: string;
  slug: string;
  children: React.ReactNode;
  left: React.ReactNode;
  right: React.ReactNode;
}) => {
  return (
    <div className="flex max-w-full flex-row">
      {left}

          <article className="text-pretty w-full md:max-w-2xl">
            {children}
          </article>

      {right}
    </div>
  );
};

function OnThisPage({ toc }: { toc: TocItem[] }) {
  // Filter to only show h2 headings (depth 2) for cleaner navigation
  const headings = toc.filter((item) => item.depth === 2);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="hidden md:block py-20 shrink-0 pr-1.5 w-fit max-w-50">
      <div className="sticky top-20 flex flex-col gap-4 transition-all duration-300">
        <span className="block pb-3 font-semibold text-sm">On this page</span>
        <ul className="flex flex-col gap-3 text-sm text-muted-foreground tracking-tight">
          {headings.map((item) => {
            // remark-gfm uses "footnote-label" as the ID for the Footnotes heading
            const id = item.id || (item.value.toLowerCase() === "footnotes" ? "footnote-label" : slugify(item.value));
            const href = item.href || `#${id}`;
            return (
              <li key={id}>
                <a
                  href={href}
                  className="hover:text-foreground transition-colors leading-0"
                >
                  {item.value}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setCopied(false);
    }
  };

  return (
    <aside className="hidden md:block pt-20 w-48 shrink-0 text-sm pl-1 md:pl-6">
      <div className="sticky top-20 flex flex-col gap-4 transition-all duration-300">
        <div className="flex flex-col gap-2 border border-border rounded-lg p-3">
          <div className="w-full gap-2">
            <span className="block pb-2 font-semibold">Read time:</span>
            <p className="text-center">{readTime} min</p>
          </div>
          {postMeta.updatedDate && (
            <div className="w-full gap-2">
              <span className="block pb-2 font-semibold">Updated:</span>
              <p className="text-center">{postMeta.updatedDate}</p>
            </div>
          )}
          <div className="w-full gap-2">
            <span className="block pb-2 font-semibold">Published:</span>
            <p className="text-center">{postMeta.publishedDate}</p>
          </div>
          <div>
            <span className="block pb-2 font-semibold">Tags</span>
            <div className="flex flex-wrap gap-2 justify-center">
              {postMeta.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-secondary px-2 py-1.5 text-sm font-semibold text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="w-full">
            <span className="block pb-2 font-semibold">Share</span>
            <div className="flex justify-around py-1 px-4 gap-2">
              {[
                  {
                    name: "X (Twitter)",
                    href: `https://x.com/intent/tweet?text=${encodeURIComponent(`"${title}"`)}&url=${encodeURIComponent(postUrl)}`,
                    icon: <XIcon />, 
                  },
                  {
                    name: "Bluesky",
                    href: `https://bsky.app/intent/compose?text=${encodeURIComponent(`"${title}"\n\n${postUrl}`)}`,
                    icon: <BlueskyIcon />, 
                  },
                  {
                    name: "LinkedIn",
                    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
                    icon: <LinkedInIcon />, 
                  }
                ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 [&_svg]:w-6 [&_svg]:h-6"
                  aria-label={`Share on ${link.name}`}
                >
                  {link.icon}
                </Link>
              ))}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-xs border border-gray-300"
                aria-label="Copy link to clipboard"
                type="button"
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <BackToTop />
        </div>
      </div>
    </aside>
  );
}
