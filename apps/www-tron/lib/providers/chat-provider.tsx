"use client";

import { createContext, type ReactNode, useContext } from "react";
import { ChatDialog } from "@/lib/components/chat/chat-dialog";
import { ChatDrawer } from "@/lib/components/chat/chat-drawer";
import { useChatUI } from "@/lib/hooks/use-chat-ui";

// Context for suggestions (passed from provider)
const ChatSuggestionsContext = createContext<string[]>([]);

export const useChatSuggestions = () => useContext(ChatSuggestionsContext);

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
  const { isDrawerOpen } = useChatUI();

  return (
    <ChatSuggestionsContext.Provider value={suggestions}>
      {children}
      {isDrawerOpen && <ChatDrawer suggestions={suggestions} />}
      <ChatDialog />
    </ChatSuggestionsContext.Provider>
  );
}
