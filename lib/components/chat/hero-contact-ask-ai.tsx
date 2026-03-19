"use client";

import { IconMessageCircle } from "@tabler/icons-react";
import { ChevronDown } from "lucide-react";

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

interface HeroContactAskAIProps {
  getPrompt?: () => string;
}

export function HeroContactAskAI({ getPrompt }: HeroContactAskAIProps) {
  const { setIsDialogOpen, setPrompt, model, setModel } = useChatUI();
  const prefetchChat = () => {
    void Promise.all([
      import("@/lib/components/chat/chat-dialog"),
      import("@/lib/components/chat/chat-drawer"),
    ]);
  };

  return (
    <div className="inline-flex items-center gap-[0.5px]">
      {/* Main button - opens dialog */}
      <Button
        variant="default"
        data-click-id="hero:ask-ai"
        className="h-auto! px-6! md:px-8! py-3! md:py-3.5! shadow-none rounded-l-xl! rounded-r-none! border-r border-r-primary-foreground/20 cursor-pointer bg-primary! hover:bg-primary/85! text-primary-foreground! font-medium text-sm md:text-base"
        onClick={() => {
          if (getPrompt) setPrompt(getPrompt());
          setIsDialogOpen(true);
        }}
        onMouseEnter={prefetchChat}
        onFocus={prefetchChat}
      >
        <IconMessageCircle className="w-4 h-4" />
        Ask AI
      </Button>

      {/* Dropdown trigger - model selection */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            data-click-id="hero:model-select"
            className="h-[stretch] px-4! md:px-5! shadow-none rounded-r-xl! rounded-l-none! cursor-pointer bg-primary! hover:bg-primary/85! text-primary-foreground!"
            onMouseEnter={prefetchChat}
            onFocus={prefetchChat}
          >
            <ChevronDown className="w-4 h-4" />
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
  );
}
