"use client";

import dynamic from "next/dynamic";
import { createContext, type ReactNode, useContext } from "react";
import { useChatUI } from "@/lib/hooks/use-chat-ui";

// Context for suggestions (passed from provider)
const ChatSuggestionsContext = createContext<string[]>([]);

export const useChatSuggestions = () => useContext(ChatSuggestionsContext);

const ChatDialog = dynamic(
  () =>
    import("@/lib/components/chat/chat-dialog").then((mod) => mod.ChatDialog),
  { ssr: false },
);

const ChatDrawer = dynamic(
  () =>
    import("@/lib/components/chat/chat-drawer").then((mod) => mod.ChatDrawer),
  { ssr: false },
);

const DEFAULT_SUGGESTIONS = [
  "What are Clay's skills?",
  "Favorite 5 ice cream flavors?",
  "Meaning of life?",
];

// Pure context provider for suggestions + chat surface mounting
export function ChatProvider({
  children,
  suggestions = DEFAULT_SUGGESTIONS,
}: {
  children: ReactNode;
  suggestions?: string[];
}) {
  const { isDrawerOpen, isDialogOpen } = useChatUI();

  return (
    <ChatSuggestionsContext.Provider value={suggestions}>
      {children}
      {isDrawerOpen && <ChatDrawer suggestions={suggestions} />}
      {isDialogOpen && <ChatDialog />}
    </ChatSuggestionsContext.Provider>
  );
}
