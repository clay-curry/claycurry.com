"use client";

import { useAtom } from "jotai";
import {
  BadgeCheck,
  ExternalLink,
  Heart,
  MessageCircle,
  Repeat2,
} from "lucide-react";
import Image from "next/image";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/lib/components/ui/avatar";
import { cn } from "@/lib/utils";
import { bookmarkViewedAtom } from "@/lib/x/atoms";
import type { NormalizedBookmark } from "@/lib/x/client";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

export function BookmarkCard({
  bookmark,
  dimViewed,
}: {
  bookmark: NormalizedBookmark;
  dimViewed: boolean;
}) {
  const [viewed, setViewed] = useAtom(bookmarkViewedAtom);
  const isViewed = viewed.includes(bookmark.id);

  const handleClick = () => {
    if (!isViewed) {
      setViewed((prev) => [...prev, bookmark.id]);
    }
  };

  const tweetUrl = `https://x.com/${bookmark.author.username}/status/${bookmark.id}`;

  return (
    <a
      href={tweetUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      data-click-id={`bookmark:${bookmark.id}`}
      className="block"
    >
      <article
        className={cn(
          "group bg-secondary rounded-xl md:rounded-2xl border border-border overflow-hidden hover:border-accent hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 h-full",
          dimViewed && isViewed && "opacity-60",
        )}
      >
        <div className="p-4 md:p-5 flex flex-col h-full">
          {/* Author */}
          <div className="flex items-center gap-2 mb-3">
            <Avatar size="sm">
              {bookmark.author.profileImageUrl && (
                <AvatarImage
                  src={bookmark.author.profileImageUrl}
                  alt={bookmark.author.name}
                />
              )}
              <AvatarFallback>
                {bookmark.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-sm font-medium text-foreground truncate">
                <span className="truncate">{bookmark.author.name}</span>
                {bookmark.author.verified && (
                  <BadgeCheck className="size-3.5 text-accent shrink-0" />
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                @{bookmark.author.username}
              </div>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatDate(bookmark.createdAt)}
            </span>
          </div>

          {/* Tweet text */}
          <p className="text-sm text-foreground leading-relaxed mb-3 line-clamp-4 whitespace-pre-line">
            {bookmark.text}
          </p>

          {/* Media preview */}
          {bookmark.media.length > 0 && bookmark.media[0].url && (
            <div className="mb-3 rounded-lg overflow-hidden border border-border">
              <Image
                src={bookmark.media[0].url}
                alt=""
                className="w-full h-40 object-cover"
                width={400}
                height={160}
                unoptimized
              />
            </div>
          )}

          {/* Engagement metrics */}
          <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="size-3.5" />
              {formatCount(bookmark.metrics.likes)}
            </span>
            <span className="flex items-center gap-1">
              <Repeat2 className="size-3.5" />
              {formatCount(bookmark.metrics.retweets)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="size-3.5" />
              {formatCount(bookmark.metrics.replies)}
            </span>
            <ExternalLink className="size-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </article>
    </a>
  );
}
