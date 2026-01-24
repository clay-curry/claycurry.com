'use client'

import { MessagesSquare } from 'lucide-react'
import { Button } from '@/lib/custom/ui/button'
import { useChatContext } from '@/lib/hooks/use-chat'

export function AskAI() {
  const { setIsDrawerOpen } = useChatContext()

  return (
    <Button
      variant="outline"
      size="lg"
      className="flex items-center gap-1.5 h-8 shrink-0 shadow-none"
      onClick={() => setIsDrawerOpen(true)}
    >
      <MessagesSquare className="size-4" />
      <span>Ask AI</span>
    </Button>
  )
}
