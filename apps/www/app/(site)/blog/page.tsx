import { getAllPostsMetadata } from "@/app/(site)/blog/loader";
import { Posts } from "@/lib/ui/components/post";
import { PageViews } from "@/lib/ui/widgets/page-views";

const postMetadata = getAllPostsMetadata();

export default function BlogPage() {
  return (
    <article>
      <PageViews />

      <section className="flex flex-col items-start justify-center py-2 md:py-8 px-4">
        <div className="text-left space-y-4">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Blog
          </h1>
        </div>
      </section>
      <div className="my-8 mx-4">
        <h2 className="text-sm md:text-lg py-4 md:py-8">Pinned</h2>
        <Posts entries={postMetadata} filterEntries={false} pinnedOnly={true} />
      </div>
      <div className="mt-8 mx-4">
        <h2 className="text-sm md:text-lg pt-4 md:pt-8">Recent</h2>
        <Posts entries={postMetadata} nonPinnedOnly={true} />
      </div>
    </article>
  );
}
