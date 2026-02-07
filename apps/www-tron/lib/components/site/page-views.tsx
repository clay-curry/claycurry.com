'use client'

import { Eye } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface PageViewsProps {
  /** Custom slug to track (defaults to current pathname) */
  slug?: string
  /** Whether to increment the view count (default: true) */
  increment?: boolean
  /** Additional CSS classes */
  className?: string
}

interface UsePageViewsOptions {
  /** Whether to increment the view count (default: true) */
  increment?: boolean
}

interface UsePageViewsReturn {
  count: number | null
  isLoading: boolean
  error: Error | null
}

/**
 * Displays the page view count for the current page or a custom slug.
 * Automatically increments the count on mount.
 */
export function PageViews({
  slug,
  increment = true,
  className = '',
}: PageViewsProps) {
  const pathname = usePathname()
  const effectiveSlug = slug ?? pathname
  const { count, isLoading, error } = usePageViews(effectiveSlug, {
    increment,
  })

  if (error) {
    return null // Silently fail - don't break the page for analytics
  }

  return (
    <div
      className={`relative top-0 flex items-center gap-1.5 text-sm text-muted-foreground ${className}`}
    >
      <style jsx>{`
        @keyframes blink3 {
          0%, 100% { transform: scaleY(1); }
          30% { transform: scaleY(1); }
          43% { transform: scaleY(0.1); }
          53% { transform: scaleY(1); }
          76% { transform: scaleY(0.1); }
          86% { transform: scaleY(1); }
        }
      `}</style>

      {isLoading ? (
        <span className="animate-pulse">—</span>
      ) : (
        <>
              <Eye
        className="h-4 w-4"
        style={{ animation: 'blink3 0.7s ease-in-out forwards' }}
      />
        <span>{count?.toLocaleString() ?? 0} views</span>
        </>
      )}
    </div>
  )
}

/**
 * Hook to track and display page view counts.
 * Automatically increments the count on mount (can be disabled).
 */
export function usePageViews(
  slug: string,
  options: UsePageViewsOptions = {},
): UsePageViewsReturn {
  const { increment = true } = options
  const [count, setCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Track which slug was last incremented to prevent Strict Mode double-fires
  // while still allowing updates when the slug changes across navigations
  const trackedSlug = useRef<string | null>(null)

  useEffect(() => {
    if (increment && trackedSlug.current === slug) {
      return
    }

    const trackView = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (increment) {
          trackedSlug.current = slug

          const response = await fetch('/api/views', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug }),
          })

          if (!response.ok) {
            throw new Error('Failed to track page view')
          }

          const data = await response.json()
          setCount(data.count)
        } else {
          const response = await fetch(
            `/api/views?slug=${encodeURIComponent(slug)}`,
          )

          if (!response.ok) {
            throw new Error('Failed to fetch page views')
          }

          const data = await response.json()
          setCount(data.count)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    trackView()
  }, [slug, increment])

  return { count, isLoading, error }
}
