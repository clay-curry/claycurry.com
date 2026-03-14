import { BookmarksGallery } from "./bookmarks-gallery";
import { SectionHeader } from "./section-header";

export function BookmarksSection() {
  return (
    <div className="mx-4">
      <SectionHeader title="X Bookmarks -" />
      <BookmarksGallery />
    </div>
  );
}
