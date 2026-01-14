"use client";

import { Eye } from "lucide-react";
import { usePathname } from "next/navigation";
import { usePageViews } from "@/lib/hooks/use-page-views";

interface PageViewsProps {
  /** Custom slug to track (defaults to current pathname) */
  slug?: string;
  /** Whether to increment the view count (default: true) */
  increment?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Displays the page view count for the current page or a custom slug.
 * Automatically increments the count on mount.
 */
export function PageViews({
  slug,
  increment = true,
  className = "",
}: PageViewsProps) {
  const pathname = usePathname();
  const effectiveSlug = slug ?? pathname;
  const { count, isLoading, error } = usePageViews(effectiveSlug, {
    increment,
  });

  if (error) {
    return null; // Silently fail - don't break the page for analytics
  }

  return (
    <div className="w-full flex justify-end px-4 pt-4">
      <div
        className={`inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 ${className}`}
      >
        <Eye className="h-4 w-4" />
        {isLoading ? (
          <span className="animate-pulse">—</span>
        ) : (
          <span>{count?.toLocaleString() ?? 0} views</span>
        )}
      </div>
    </div>
  );
}
