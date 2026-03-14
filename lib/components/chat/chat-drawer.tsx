"use client";

import { MessagesSquareIcon } from "lucide-react";
import { Portal } from "radix-ui";
import { useEffect } from "react";
import { Button } from "@/lib/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/lib/components/ui/drawer";
import { useChatUI } from "@/lib/hooks/use-chat-ui";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ChatSurface } from "./chat-surface";

type ChatDrawerProps = {
  basePath?: string;
  suggestions: string[];
};

export function ChatDrawer({ basePath, suggestions }: ChatDrawerProps) {
  const { isDrawerOpen, setIsDrawerOpen, prompt, setPrompt } = useChatUI();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "i"
      ) {
        event.preventDefault();
        setIsDrawerOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsDrawerOpen]);

  return (
    <>
      <Button
        className="hidden shrink-0 shadow-none md:flex"
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        size="sm"
        variant="outline"
      >
        <MessagesSquareIcon className="size-3.5 text-muted-foreground" />
        <span>Ask AI</span>
      </Button>

      <Portal.Root>
        <div
          className={cn(
            "fixed z-50 flex flex-col gap-4 bg-background transition-all",
            "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
            "translate-x-full data-[state=open]:translate-x-0",
            "hidden md:flex",
          )}
          data-state={isDrawerOpen ? "open" : "closed"}
        >
          <ChatSurface
            variant="drawer"
            basePath={basePath}
            suggestions={suggestions}
            prompt={prompt}
            setPrompt={setPrompt}
            onClose={() => setIsDrawerOpen(false)}
          />
        </div>
      </Portal.Root>

      <div className="md:hidden">
        <Drawer
          onOpenChange={isMobile ? setIsDrawerOpen : undefined}
          open={isMobile ? isDrawerOpen : false}
        >
          <DrawerTrigger asChild>
            <Button className="shadow-none" size="sm" variant="outline">
              <MessagesSquareIcon className="size-3.5 text-muted-foreground" />
              Ask AI
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[80dvh]">
            <ChatSurface
              variant="drawer"
              basePath={basePath}
              suggestions={suggestions}
              prompt={prompt}
              setPrompt={setPrompt}
              onClose={() => setIsDrawerOpen(false)}
            />
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
