"use client"

import { IconArrowRight, IconMessageCircle } from "@tabler/icons-react"
import Link from "next/link"

import { Button } from "@/lib/components/ui/button"
import { useChatContext } from "@/lib/hooks/use-chat"

export function HeroAskAI() {
  const { setIsOpen } = useChatContext()

  return (
    <div className="inline-flex items-center gap-4">
      {/* Contact button */}
      <Button
        variant="outline"
        size="lg"
        className="px-4 py-2 h-6 md:h-8 md:text-[0.8rem] shadow-none rounded-4xl bg-muted-foreground/30 hover:bg-muted-foreground/40"
        asChild
      >
        <Link href="/contact">
          Contact
          <IconArrowRight className="size-4 -rotate-45" />
        </Link>
      </Button>

      {/* Ask AI button - opens the global chat panel */}
      <Button
        variant="default"
        size="lg"
        className="h-5 md:h-7 md:text-[0.8rem] shadow-none rounded-4xl"
        onClick={() => setIsOpen(true)}
      >
        <IconMessageCircle className="size-3" />
        Ask AI
      </Button>
    </div>
  )
}
