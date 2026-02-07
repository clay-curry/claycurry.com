"use client";

import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/lib/components/ui/dialog";
import { useChatContext } from "@/lib/hooks/use-chat";
import ChatBotDemo from "@/lib/components/chat/chat-bot-client";

export function ChatDialog() {
  const { isDialogOpen, setIsDialogOpen } = useChatContext();
  const pathname = usePathname();

  // Detect blog context from URL
  const isBlogContext = pathname?.startsWith('/blog/');
  // Key forces remount when navigating between pages
  const contextKey = pathname || 'default';

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent
        className="h-[80vh] p-0 flex flex-col rounded-3xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          {isBlogContext ? "Ask about this article" : "Ask AI"}
        </DialogTitle>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatBotDemo key={contextKey} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
