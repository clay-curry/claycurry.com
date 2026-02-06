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

export function HeroContactAskAI() {
  const { setIsDialogOpen, model, setModel } = useChatContext()

  return (
    <div className="inline-flex items-center gap-4">
      {/* Contact button */}
      <Button
        variant="ghost"
        size="lg"
        className="px-4 py-2 h-9 md:text-[0.8rem] shadow-none rounded-4xl bg-muted-foreground/30 hover:bg-muted-foreground/40 cursor-pointer"
        asChild
      >
        <Link className="text-white hover:text-white" href="/contact">
          Contact
          <IconArrowRight className="size-4 -rotate-45" />
        </Link>
      </Button>

      {/* Ask AI split button */}
      <div className="inline-flex items-center gap-[0.5px]">
        {/* Main button - opens dialog */}
        <Button
          variant="default"
          size="lg"
          className="h-9 md:text-[0.8rem] shadow-none rounded-l-4xl rounded-r-none border-r border-r-primary-foreground/20 cursor-pointer text-white!"
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
              className="h-9 px-2.5! shadow-none rounded-r-4xl rounded-l-none cursor-pointer text-white!"
            >
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-3xl p-2">
            <DropdownMenuRadioGroup value={model} onValueChange={setModel}>
              {CHAT_MODELS.map((m) => (
                <DropdownMenuRadioItem key={m.value} value={m.value} className="rounded-lg pr-4">
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
