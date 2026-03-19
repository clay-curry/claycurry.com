import { BookmarksGallery } from "@/lib/components/site/bookmarks-gallery";

export default function XBookmarksPage() {
  return (
    <div className="py-18 md:py-24 px-2 md:px-4">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3 mb-[calc(3/8*100vh)] md:mb-32">
        <h1 className="font-sans font-bold tracking-tight text-3xl md:text-5xl">
          Y Bookmarks
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
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Overview
          </h3>
          <div className="space-y-3 text-sm text-foreground">
            <p>
              A high-fidelity clone of X (Twitter) Bookmarks with enhanced
              navigation tools — folder filtering, multi-field sorting,
              full-text search, and view history tracking.
            </p>
            <p>
              Built with Next.js, Effect-TS, and the X API v2. Bookmarks sync
              via a cache-first strategy backed by Redis, with real-time
              client-side filtering and sorting powered by Jotai atoms.
            </p>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <BookmarksGallery />
    </div>
  );
}
