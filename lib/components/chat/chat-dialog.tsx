"use client";

import { usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/lib/components/ui/dialog";
import { useChatUI } from "@/lib/hooks/use-chat-ui";
import { useChatSuggestions } from "@/lib/providers/chat-provider";
import { ChatSurface } from "./chat-surface";

const BLOG_SUGGESTIONS = [
  "Summarize this article",
  "What are the key takeaways?",
  "Explain the main concepts",
  "What questions does this leave unanswered?",
];

export function ChatDialog() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    prompt,
    setPrompt,
    model: sharedModel,
    setModel: setSharedModel,
  } = useChatUI();
  const defaultSuggestions = useChatSuggestions();
  const pathname = usePathname();

  const slug = pathname?.startsWith("/blog/")
    ? pathname.replace("/blog/", "")
    : "";
  const isBlogContext = Boolean(slug);
  const suggestions = isBlogContext ? BLOG_SUGGESTIONS : defaultSuggestions;
  const contextKey = pathname || "default";

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
          <ChatSurface
            key={contextKey}
            variant="dialog"
            suggestions={suggestions}
            isBlogContext={isBlogContext}
            slug={slug}
            sharedModel={sharedModel}
            setSharedModel={setSharedModel}
            prompt={prompt}
            setPrompt={setPrompt}
            onClose={() => setIsDialogOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
