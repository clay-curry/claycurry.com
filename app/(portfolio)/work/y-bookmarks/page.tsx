import { ExternalLink } from "lucide-react";
import { BookmarksGallery } from "@/lib/components/site/bookmarks-gallery";

export default function XBookmarksPage() {
  return (
    <div className="py-18 md:py-24 px-2 md:px-4">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3 mb-[calc(3/8*100vh)] md:mb-32">
        <h1 className="font-sans font-bold tracking-tight text-3xl md:text-5xl">
          Y Bookmarks - Bookmark Archive
        </h1>
        <p className="text-accent text-sm md:text-base">
          Personal Project — January 2026
        </p>
      </div>

      {/* Role / Team / Timeline + Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              My Role
            </h3>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">UI Lead</span> —
              Interaction Design, Visual Design, User Flows, Rapid Prototyping
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Team</h3>
            <p className="text-sm text-muted-foreground">
              Clay Curry, Product Engineer
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Timeline
            </h3>
            <p className="text-sm text-muted-foreground">
              February 2026 — Present
            </p>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Demo Link
            </h3>
            <a
              href="https://x-bookmarks.claycurry.com/"
              target="_blank"
              rel="noopener noreferrer"
              data-click-id="work:y-bookmarks-demo"
              className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors"
            >
              x-bookmarks.claycurry.com <ExternalLink className="size-3.5" />
            </a>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Overview
            </h3>
            <div className="space-y-3 text-sm text-foreground">
              <p>
                If you’ve used Bookmark Folders for a while, you will notice the
                pains of its age. As collections grow, rediscovering content
                requires active keyword recall or scrolling through hundreds of
                unused bookmarks. One contributor to this accumulation is that
                removing bookmarks is irreversible, which discourages cleanup
                and leads to ever-expanding, unengaging content..
              </p>
              <p>
                Bookmark Archive introduces a reversible stage to bookmark
                management, allowing users to remove items from their active
                view without permanently losing them. This reduces friction
                around cleanup, encourages pruning low-value bookmarks, and
                keeps primary collections focused on relevant, high-signal
                content.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <BookmarksGallery />
    </div>
  );
}
