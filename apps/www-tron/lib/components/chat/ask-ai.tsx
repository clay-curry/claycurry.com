'use client'

import { MessagesSquare } from 'lucide-react'
import { Button } from '@/lib/components/ui/button'
import { useChatUI } from '@/lib/hooks/use-chat-ui'

interface AskAIProps {
  mode?: 'drawer' | 'dialog'
}

export function AskAI({ mode = 'drawer' }: AskAIProps) {
  const { setIsDrawerOpen, setIsDialogOpen } = useChatUI()

  const handleClick = () => {
    if (mode === 'dialog') {
      setIsDialogOpen(true)
    } else {
      setIsDrawerOpen(true)
    }
  }

  return (
    <Button
      variant="outline"
      size="lg"
      className="flex items-center gap-1.5 h-8 shrink-0 shadow-none"
      onClick={handleClick}
    >
      <MessagesSquare className="size-4" />
      <span>Ask AI</span>
    </Button>
  )
}
