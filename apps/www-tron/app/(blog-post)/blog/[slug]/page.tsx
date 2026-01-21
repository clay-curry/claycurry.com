import { Clock, Calendar } from "lucide-react";
import {
  getAllPostsMetadata,
  getPost,
} from "@/app/(portfolio)/blog/loader";
import { MobileToc } from "@/lib/components/mobile-toc";
import { OnThisPage } from "@/lib/components/on-this-page";
import { PageActions, ShareOnX, ShareOnLinkedIn, CopyPageButton } from "@/lib/components/page-actions";
import { ViewCount } from "@/lib/components/view-count";

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
  const { metadata: postMeta, Content: BlogArticle, toc, readTime } = await getPost(slug);
  const { title } = postMeta;

  return (
    <>
      <MobileToc toc={toc} />

      {/* Sidebar - fixed to right side on desktop */}
      <aside className="hidden lg:block fixed right-8 top-30 w-64 z-10">
        <div>
          <OnThisPage toc={toc} />
          <PageActions slug={slug} />
        </div>
      </aside>

      <div className="mx-auto max-w-4xl">
        <div className="p-3 sm:p-4 md:p-6 lg:p-12">
          <article className="py-4 md:py-8">
            {/* Header */}
            <header className="mb-6 pb-6 border-b border-border">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {title}
              </h1>
              <div className="flex items-start justify-between gap-4 mb-4">
                <p className="text-base md:text-lg text-muted-foreground">{postMeta.subtitle}</p>
                <CopyPageButton />
              </div>

              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm text-muted-foreground">
                <ViewCount slug={slug} />
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {postMeta.publishedDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {readTime} min read
                </span>
                <div className="h-4 w-px bg-border" />
                <ShareOnX slug={slug} title={title} />
                <ShareOnLinkedIn slug={slug} />
              </div>
            </header>

            {/* Main Content */}
            <div className="prose prose-invert max-w-none">
              <BlogArticle />
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
