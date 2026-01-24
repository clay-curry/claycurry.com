"use client";

import { createContext, useContext, type ReactNode } from "react";
import { ChatDrawer } from "@/lib/custom/ai-elements/chat";
import { ChatDialog } from "@/lib/custom/ai-elements/chat-dialog";
import { useChatContext } from "@/lib/hooks/use-chat";

// Models available for chat
export const CHAT_MODELS = [
  { name: "Grok 3 Mini", value: "grok/grok-3-mini" },
  { name: "Claude Haiku", value: "anthropic/claude-3-haiku-20240307" },
  { name: "GPT 4o", value: "openai/gpt-4o" },
] as const;

export type ChatModel = (typeof CHAT_MODELS)[number];

// Context for suggestions (passed from provider)
const ChatSuggestionsContext = createContext<string[]>([]);

export const useChatSuggestions = () => useContext(ChatSuggestionsContext);

const DEFAULT_SUGGESTIONS = [
  "What are Clay's skills?",
  "Tell me about his experience",
  "What projects has he worked on?"
];

// Provider component that renders Chat when open
export function ChatProvider({
  children,
  suggestions = DEFAULT_SUGGESTIONS
}: {
  children: ReactNode;
  suggestions?: string[];
}) {
  const { isDrawerOpen } = useChatContext();

  return (
    <ChatSuggestionsContext.Provider value={suggestions}>
      {children}
      {isDrawerOpen && <ChatDrawer suggestions={suggestions} />}
      <ChatDialog />
    </ChatSuggestionsContext.Provider>
  );
}
