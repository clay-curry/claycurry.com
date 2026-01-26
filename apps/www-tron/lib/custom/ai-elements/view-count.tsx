'use client'

import { Eye } from 'lucide-react'
import { useEffect, useState } from 'react'

type ViewCountProps = {
  slug: string
}

export function ViewCount({ slug }: ViewCountProps) {
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    // Increment view count on mount
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: `/blog/${slug}` }),
    })
      .then((res) => res.json())
      .then((data) => setViews(data.count))
      .catch(() => setViews(0))
  }, [slug])

  return (
    <span className="flex items-center gap-1.5">
      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      {views === null ? (
        <span className="w-8 h-4 bg-muted animate-pulse rounded" />
      ) : (
        <span>{views.toLocaleString()}</span>
      )}
    </span>
  )
}
