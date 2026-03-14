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
          <g>
            <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path>
          </g>
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
