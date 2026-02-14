"use client";

import { IconArrowRight, IconMessageCircle } from "@tabler/icons-react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

import { Button } from "@/lib/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/lib/components/ui/dropdown-menu";
import { CHAT_MODELS } from "@/lib/hooks/use-chat-session";
import { useChatUI } from "@/lib/hooks/use-chat-ui";

export function HeroContactAskAI() {
  const { setIsDialogOpen, model, setModel } = useChatUI();

  return (
    <div className="inline-flex items-center gap-4">
      {/* Contact button */}
      <Button
        variant="ghost"
        size="lg"
        className="px-4 py-2 h-9 md:text-[0.8rem] shadow-none rounded-4xl bg-background hover:bg-secondary border border-border cursor-pointer"
        asChild
      >
        <Link
          className="text-foreground hover:text-foreground"
          href="/contact"
          data-click-id="hero:contact"
        >
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
          data-click-id="hero:ask-ai"
          className="h-9 md:text-[0.8rem] shadow-none rounded-l-4xl rounded-r-none border-r border-r-primary-foreground/20 cursor-pointer bg-primary! hover:bg-primary/85! text-primary-foreground! px-2"
          onClick={() => setIsDialogOpen(true)}
        >
          <IconMessageCircle className="size-3" />
          Ask OpenClaw
        </Button>

        {/* Dropdown trigger - model selection */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              size="lg"
              data-click-id="hero:model-select"
              className="h-9 px-2.5! shadow-none rounded-r-4xl rounded-l-none cursor-pointer bg-primary! hover:bg-primary/85! text-primary-foreground!"
            >
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-3xl p-2">
            <DropdownMenuRadioGroup value={model} onValueChange={setModel}>
              {CHAT_MODELS.map((m) => (
                <DropdownMenuRadioItem
                  key={m.value}
                  value={m.value}
                  className="rounded-lg pr-4"
                >
                  {m.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
