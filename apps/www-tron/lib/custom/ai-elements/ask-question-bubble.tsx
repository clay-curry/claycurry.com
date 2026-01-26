'use client'

import { useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { useChatContext } from '@/lib/hooks/use-chat'

export function AskQuestionBubble() {
  const [question, setQuestion] = useState('')
  const { setPrompt, setIsDialogOpen } = useChatContext()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    // Set prompt and open dialog - ChatBotDemo reads slug from URL
    setPrompt(question.trim())
    setIsDialogOpen(true)
    setQuestion('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-3 sm:px-4">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          className="w-full pl-4 pr-14 py-3 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted-foreground hover:border-accent hover:scale-[1.02] focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all text-sm shadow-lg cursor-pointer"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <span className="text-xs text-muted-foreground hidden sm:inline">&#8984;I</span>
          <button
            type="submit"
            disabled={!question.trim()}
            className="size-8 flex items-center justify-center bg-accent text-accent-foreground rounded-full hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
