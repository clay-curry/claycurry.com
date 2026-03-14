"use client";

import type { UIMessage } from "ai";
import { GlobeIcon, Trash } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/lib/components/ui/button";
import { ButtonGroup } from "@/lib/components/ui/button-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/lib/components/ui/tooltip";
import { CHAT_MODELS } from "@/lib/hooks/use-chat-session";
import { cn } from "@/lib/utils";
import { CopyChat } from "./copy-chat";

export type ChatToolbarProps = ComponentProps<"div"> & {
  messages: UIMessage[];
  model: string;
  onModelChange: (model: string) => void;
  webSearch: boolean;
  onWebSearchChange: (webSearch: boolean) => void;
  onClear: () => void;
  closeButton: ReactNode;
};

export function ChatToolbar({
  messages,
  model,
  onModelChange,
  webSearch,
  onWebSearchChange,
  onClear,
  closeButton,
  className,
  ...props
}: ChatToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-2.5 border-b",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <Select value={model} onValueChange={onModelChange}>
          <SelectTrigger className="h-7 w-auto gap-1 text-xs border-none shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHAT_MODELS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant={webSearch ? "default" : "ghost"}
              onClick={() => onWebSearchChange(!webSearch)}
            >
              <GlobeIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {webSearch ? "Web search enabled" : "Enable web search"}
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex items-center gap-3">
        <ButtonGroup orientation="horizontal">
          <CopyChat messages={messages} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={messages.length === 0}
                onClick={onClear}
                size="icon-sm"
                variant="ghost"
              >
                <Trash className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear chat</TooltipContent>
          </Tooltip>
          {closeButton}
        </ButtonGroup>
      </div>
    </div>
  );
}
