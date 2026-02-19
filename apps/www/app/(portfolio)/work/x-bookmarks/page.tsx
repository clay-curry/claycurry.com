import { BookmarksGallery } from "@/lib/components/site/bookmarks-gallery";

/**
 * 
 * @returns 


["Sports", "Technology", "Art", "Entertainment", "Gaming", "Politics", "Business", "Culture", "Science", "Food", "Animals",
  "Education", "Fashion & Beauty", "Health & Fitness", "News", "Cryptocurrency", "Travel", "X Official"]


Global Trending Carousel

["Technology", "Business & Finance", "Travel", "Relationships", "Music", "Science", "Movies & TV", "Gaming", "Health &
  Fitness", "News", "Sports", "Dance", "Celebrity", "Cryptocurrency", "Cars", "Nature & Outdoors", "Home & Garden", "Pets",
  "Food", "Memes", "Beauty", "Fashion", "Anime", "Religion"]

Inspiration:

  ["Most Likes", "Most Replies", "Most Quotes", "Most Bookmarks", "Most Shares", "Most Video Views"]

 */

export default function XBookmarksPage() {
  return (
    <div className="py-8 md:py-12 px-2 md:px-4">
      <div className="flex items-center gap-3 my-6">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-5 fill-foreground"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <h2 className="font-sans font-semibold tracking-wider text-xl md:text-2xl">
          Bookmarks
        </h2>
        <div className="w-3 h-px bg-foreground rounded-full" />
      </div>
      <BookmarksGallery />
    </div>
  );
}
