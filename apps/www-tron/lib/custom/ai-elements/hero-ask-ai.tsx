"use client"

import { IconArrowRight, IconMessageCircle } from "@tabler/icons-react"
import { ChevronDown } from "lucide-react"
import Link from "next/link"

import { Button } from "@/lib/custom/ui/button"
import { useChatContext } from "@/lib/hooks/use-chat"
import { CHAT_MODELS } from "@/lib/providers/chat-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/lib/custom/ui/dropdown-menu"

export function HeroAskAI() {
  const { setIsDialogOpen, model, setModel } = useChatContext()

  return (
    <div className="inline-flex items-center gap-4">
      {/* Contact button */}
      <Button
        variant="ghost"
        size="lg"
        className="px-4 py-2 h-6 md:h-8 md:text-[0.8rem] shadow-none rounded-4xl bg-muted-foreground/30 hover:bg-muted-foreground/40"
        asChild
      >
        <Link className="text-white" href="/contact">
          Contact
          <IconArrowRight className="size-4 -rotate-45" />
        </Link>
      </Button>

      {/* Ask AI split button */}
      <div className="inline-flex items-center">
        {/* Main button - opens dialog */}
        <Button
          variant="default"
          size="lg"
          className="h-6 md:h-8 md:text-[0.8rem] shadow-none rounded-l-4xl rounded-r-none border-r border-r-primary-foreground/20"
          onClick={() => setIsDialogOpen(true)}
        >
          <IconMessageCircle className="size-3" />
          Ask AI
        </Button>

        {/* Dropdown trigger - model selection */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              size="lg"
              className="h-6 md:h-8 pl-1! pr-1.5! shadow-none rounded-r-4xl rounded-l-none"
            >
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={model} onValueChange={setModel}>
              {CHAT_MODELS.map((m) => (
                <DropdownMenuRadioItem key={m.value} value={m.value}>
                  {m.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
