'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { ThumbsUp, ThumbsDown, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/lib/components/ui/button'

type Sentiment = 'positive' | 'negative' | null

interface PageFeedbackProps {
  label?: string
}

export function PageFeedback({ label = 'Was this page helpful?' }: PageFeedbackProps) {
  const pathname = usePathname()
  const [sentiment, setSentiment] = useState<Sentiment>(null)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSentimentClick = (value: Sentiment) => {
    setSentiment(value)
  }

  const handleSubmit = async () => {
    if (!sentiment) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: pathname,
          sentiment,
          message: message.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      toast.success('Thanks for your feedback!')
      setIsSubmitted(true)
    } catch {
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <p className="text-sm text-muted-foreground">Thanks for your feedback!</p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center sm:justify-start gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-center gap-3">
          <Button
            variant={sentiment === 'positive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSentimentClick('positive')}
            className="gap-1.5"
          >
            <ThumbsUp className="size-4" />
            Yes
          </Button>
          <Button
            variant={sentiment === 'negative' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSentimentClick('negative')}
            className="gap-1.5"
          >
            <ThumbsDown className="size-4" />
            No
          </Button>
        </div>
      </div>

      {sentiment && (
        <div className="max-w-md sm:ml-auto space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Any additional feedback? (optional)"
            rows={3}
            className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all resize-none text-sm"
          />
          <div className="flex sm:justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="sm"
              className="gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {isSubmitting ? 'Sending...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
