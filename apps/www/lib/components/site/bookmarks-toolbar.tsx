"use client";

import { useAtom } from "jotai";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/components/ui/select";
import { Switch } from "@/lib/components/ui/switch";
import {
  bookmarkFolderAtom,
  bookmarkSearchAtom,
  bookmarkSortFieldAtom,
  bookmarkSortOrderAtom,
  bookmarkViewedAtom,
  type SortField,
  type SortOrder,
} from "@/lib/x/atoms";
import type { XBookmarkFolder } from "@/lib/x/client";

export function BookmarksToolbar({
  folders,
  dimViewed,
  onToggleDimViewed,
}: {
  folders: XBookmarkFolder[];
  dimViewed: boolean;
  onToggleDimViewed: () => void;
}) {
  const [sortField, setSortField] = useAtom(bookmarkSortFieldAtom);
  const [sortOrder, setSortOrder] = useAtom(bookmarkSortOrderAtom);
  const [folder, setFolder] = useAtom(bookmarkFolderAtom);
  const [search, setSearch] = useAtom(bookmarkSearchAtom);
  const [viewed] = useAtom(bookmarkViewedAtom);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Sort field */}
      <Select
        value={sortField}
        onValueChange={(v) => setSortField(v as SortField)}
      >
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Date</SelectItem>
          <SelectItem value="likes">Likes</SelectItem>
          <SelectItem value="retweets">Retweets</SelectItem>
          <SelectItem value="impressions">Impressions</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort order toggle */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() =>
          setSortOrder((prev: SortOrder) => (prev === "asc" ? "desc" : "asc"))
        }
      >
        {sortOrder === "asc" ? (
          <ArrowUp className="size-3.5" />
        ) : (
          <ArrowDown className="size-3.5" />
        )}
      </Button>

      {/* Folder select */}
      {folders.length > 0 && (
        <Select
          value={folder || "all"}
          onValueChange={(v) => setFolder(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue placeholder="All Bookmarks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bookmarks</SelectItem>
            {folders.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* History toggle */}
      <div className="flex items-center gap-1.5">
        <label
          htmlFor="bookmark-history"
          className="text-xs text-muted-foreground cursor-pointer select-none"
        >
          History{viewed.length > 0 && ` (${viewed.length})`}
        </label>
        <Switch
          id="bookmark-history"
          size="sm"
          checked={dimViewed}
          onCheckedChange={onToggleDimViewed}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="h-8 w-[140px] pl-7 text-xs"
        />
      </div>
    </div>
  );
}
