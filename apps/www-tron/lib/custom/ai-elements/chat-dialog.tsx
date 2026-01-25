"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/lib/custom/ui/dialog";
import { useChatContext } from "@/lib/hooks/use-chat";
import ChatBotDemo from "@/lib/custom/chat-bot-client";

export function ChatDialog() {
  const { isDialogOpen, setIsDialogOpen } = useChatContext();

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent
        className="h-[80vh] p-0 flex flex-col"
        showCloseButton
      >
        <DialogTitle className="sr-only">Ask AI</DialogTitle>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatBotDemo />
        </div>
      </DialogContent>
    </Dialog>
  );
}
