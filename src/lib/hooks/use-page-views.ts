"use client";

import { useEffect, useRef, useState } from "react";

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
 * Hook to track and display page view counts.
 * Automatically increments the count on mount (can be disabled).
 */
export function usePageViews(
  slug: string,
  options: UsePageViewsOptions = {}
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

        if (increment) {
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
          const response = await fetch(`/api/views?slug=${encodeURIComponent(slug)}`);

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
