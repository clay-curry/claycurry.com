import { getAllPostsMetadata } from "@/blog/utils";
import { Posts } from "@/lib/ui/components/post";
import { PageViews } from "@/lib/ui/widgets/page-views";

const postMetadata = getAllPostsMetadata();

export default function BlogPage() {
  return (
    <article>
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
    </article>
  );
}
