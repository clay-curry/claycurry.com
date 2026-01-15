"use client";

import { Eye } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface PageViewsProps {
  /** Custom slug to track (defaults to current pathname) */
  slug?: string;
  /** Whether to increment the view count (default: true) */
  increment?: boolean;
  /** Additional CSS classes */
  className?: string;
}

interface UsePageViewsOptions {
  /** Whether to increment the view count (default: true) */
  increment?: boolean;
}

interface UsePageViewsReturn {
  count: number | null;
  isLoading: boolean;
  error: Error | null;
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

/**
 * Hook to track and display page view counts.
 * Automatically increments the count on mount (can be disabled).
 */
export function usePageViews(
  slug: string,
  options: UsePageViewsOptions = {},
): UsePageViewsReturn {
  const { increment = true } = options;
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Prevent double-incrementing in React Strict Mode
  const hasTracked = useRef(false);

  useEffect(() => {
    // Skip if we've already tracked this slug in this component instance
    if (increment && hasTracked.current) {
      return;
    }

    const trackView = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check localStorage to see if tracking is enabled
        const trackingEnabled = localStorage.getItem("track-views") !== "false";
        const shouldIncrement = increment && trackingEnabled;

        if (shouldIncrement) {
          hasTracked.current = true;

          // Increment and get count
          const response = await fetch("/api/views", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug }),
          });

          if (!response.ok) {
            throw new Error("Failed to track page view");
          }

          const data = await response.json();
          setCount(data.count);
        } else {
          // Just get count without incrementing
          const response = await fetch(
            `/api/views?slug=${encodeURIComponent(slug)}`,
          );

          if (!response.ok) {
            throw new Error("Failed to fetch page views");
          }

          const data = await response.json();
          setCount(data.count);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };

    trackView();
  }, [slug, increment]);

  return { count, isLoading, error };
}
