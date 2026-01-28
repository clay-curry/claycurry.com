import { Clock, Calendar } from "lucide-react";
import {
  getAllPostsMetadata,
  getPost,
} from "@/app/(portfolio)/blog/loader";
import { MobileToc } from "@/lib/custom/ai-elements/mobile-toc";
import { OnThisPage } from "@/lib/custom/ai-elements/on-this-page";
import { PageActions, ShareOnX, ShareOnLinkedIn, CopyPageButton } from "@/lib/custom/ai-elements/page-actions";
import { ViewCount } from "@/lib/custom/ai-elements/view-count";
import { PageFeedback } from "@/lib/custom/ai-elements/page-feedback";
import { AskQuestionBubble } from "@/lib/custom/ai-elements/ask-question-bubble";

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
      <AskQuestionBubble />
      <MobileToc toc={toc} />

      {/* Sidebar - fixed to right side on desktop */}
      <aside className="hidden xl:block fixed right-4 top-30 w-64 z-10">
        <div>
          <OnThisPage toc={toc} />
          <PageActions slug={slug} />
        </div>
      </aside>

      <div className="mx-auto max-w-4xl w-full">
        <div className="p-3 sm:p-4 md:p-6 lg:p-12 pb-24 sm:pb-28">
          <article className="pt-12 pb-4 md:py-8">
            {/* Header */}
            <header className="mb-14 pb-6 border-b border-border">

              { /* Title and subtitle */ }
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 sm:mb-4 wrap-break-word">
                {title}
              </h1>
              <p className="text-muted-foreground text-md md:text-lg my-6 sm:my-8 wrap-break-word">
                {postMeta.subtitle}
              </p>

              { /* Meta for article */ }
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-3 md:gap-4 text-sm sm:text-sm text-muted-foreground">
                <ViewCount slug={slug} />
                <div className="h-4 w-px bg-border" />
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  {postMeta.publishedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  {readTime} min
                </span>
                <div className="h-4 w-px bg-border" />
                <ShareOnX slug={slug} title={title} />
                <ShareOnLinkedIn slug={slug} />
                <div className="flex-1" />
                <CopyPageButton />
              </div>
            </header>

            {/* Main Content */}
            <div className="prose prose-sm sm:prose-base prose-invert max-w-none prose-headings:scroll-mt-20 [&_pre]:overflow-x-auto [&_.math-display]:overflow-x-auto [&_table]:overflow-x-auto">
              <BlogArticle />
            </div>
          </article>

          {/* Page Feedback */}
          <div className="border-t border-border py-6">
            <PageFeedback />
          </div>
        </div>
      </div>
    </>
  );
}
