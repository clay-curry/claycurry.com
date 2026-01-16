import Link from "next/link";
import {
  getAllPostsMetadata,
  getPost,
  type PostMetadata,
} from "@/app/(site)/blog/loader";
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
  const { metadata: postMeta, Content: BlogArticle, toc } = await getPost(slug);
  const { title } = postMeta;
  console.log("TOC:", toc);

  return (
    <article>
      <PageViews />

      <ArticleContent
        slug={slug}
        title={title}
        aside={<ArticleMeta slug={slug} title={title} postMeta={postMeta} />}
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
  aside,
}: {
  title: string;
  slug: string;
  children: React.ReactNode;
  aside: React.ReactNode;
}) => {
  return (
    <div className="flex max-w-full flex-row gap-14 px-6">
      {/** TODO: generate "On this Page" for blog (may require implementation elsewhere) */}

      <article className="w-full text-pretty md:max-w-2xl">
        <div>
          <BlogBreadcrumb slug={slug} title={title} />
          <div>{children}</div>
        </div>
      </article>

      {aside}
    </div>
  );
};

function ArticleMeta({
  slug,
  title,
  postMeta,
}: {
  slug: string;
  title: string;
  postMeta: PostMetadata;
}) {
  return (
    <aside className="hidden md:block pt-20 max-h-[calc(100vh-10rem)] w-72 shrink-0">
      <div className="flex max-h-[calc(100vh-10rem)] flex-col gap-4 transition-all duration-300">
        <PublishedDate date={postMeta.date} />
        <TagList tags={postMeta.tags} />
        <ShareLinks slug={slug} title={title} />
      </div>
    </aside>
  );
}

const PublishedDate = ({ date }: { date: string }) => {
  return (
    <div className="w-full flex flex-row gap-2">
      <span className="block pb-2 font-semibold">Published:</span>
      <p>{date}</p>
    </div>
  );
};

const TagList = ({ tags }: { tags: string[] }) => {
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
};

const ShareLinks = ({ slug, title }: { slug: string; title: string }) => {
  const postUrl = `https://claycurry.com/blog/${slug}`;

  const shareLinks = [
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
  ];

  return (
    <div className="w-full">
      <span className="block pb-2 font-semibold">Share</span>
      <div className="flex gap-4">
        {shareLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80"
            aria-label={`Share on ${link.name}`}
          >
            {link.icon}
          </Link>
        ))}
      </div>
    </div>
  );
};
