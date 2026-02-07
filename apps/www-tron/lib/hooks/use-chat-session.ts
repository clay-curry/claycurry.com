"use client";

import type { UIMessage } from "@ai-sdk/react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type FileUIPart } from "ai";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { db, type ChatContext } from "@/lib/db";

// Models available for chat
export const CHAT_MODELS = [
  { name: "Grok 3 Mini", value: "grok/grok-3-mini" },
  { name: "Claude Haiku", value: "anthropic/claude-3-haiku-20240307" },
  { name: "GPT 4o", value: "openai/gpt-4o" },
] as const;

export type ChatModel = (typeof CHAT_MODELS)[number];

export type ChatSessionConfig = {
  context?: ChatContext;
  basePath?: string;
  slug?: string;
  model?: string;
  onModelChange?: (model: string) => void;
  defaultModel?: string;
  webSearch?: boolean;
  onWebSearchChange?: (webSearch: boolean) => void;
  defaultWebSearch?: boolean;
};

export function useChatSession({
  context = "general",
  basePath,
  slug,
  model: modelProp,
  onModelChange,
  defaultModel = CHAT_MODELS[0].value,
  webSearch: webSearchProp,
  onWebSearchChange,
  defaultWebSearch = false,
}: ChatSessionConfig = {}) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Controllable state: consumers can control model/webSearch or let the hook manage it
  const [model, setModel] = useControllableState({
    prop: modelProp,
    defaultProp: defaultModel,
    onChange: onModelChange,
    caller: "useChatSession",
  });

  const [webSearch, setWebSearch] = useControllableState({
    prop: webSearchProp,
    defaultProp: defaultWebSearch,
    onChange: onWebSearchChange,
    caller: "useChatSession",
  });

  // --- Persistence (IndexedDB via Dexie) ---
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const storedMessages = useLiveQuery(
    () => db.messages.where("context").equals(context).sortBy("sequence"),
    [context]
  );

  const initialMessages =
    storedMessages?.map(
      ({
        timestamp: _timestamp,
        sequence: _sequence,
        context: _context,
        ...message
      }) => message
    ) ?? [];

  const isLoading = storedMessages === undefined;

  const saveMessages = useCallback(
    (messages: UIMessage[]) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const baseTimestamp = Date.now();
          const messagesToStore = messages.map((message, index) => ({
            ...message,
            timestamp: baseTimestamp + index * 1000,
            sequence: index,
            context,
          }));

          await db.transaction("rw", db.messages, async () => {
            await db.messages.where("context").equals(context).delete();
            await db.messages.bulkAdd(messagesToStore);
          });
        } catch (error) {
          console.error("Failed to save messages:", error);
        }
      }, 300);
    },
    [context]
  );

  const clearMessagesFromDB = useCallback(async () => {
    try {
      await db.messages.where("context").equals(context).delete();
    } catch (error) {
      console.error("Failed to clear messages:", error);
    }
  }, [context]);

  useEffect(
    () => () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    },
    []
  );

  // --- AI SDK ---
  const { messages, sendMessage, status, setMessages, stop, regenerate } =
    useChat({
      id: context,
      transport: new DefaultChatTransport({
        api: basePath ? `${basePath}/api/chat` : "/api/chat",
      }),
      onError: (error) => {
        toast.error(error.message, { description: error.message });
      },
    });

  // Initialize from IndexedDB
  useEffect(() => {
    if (!isLoading && !isInitialized) {
      if (initialMessages.length > 0) {
        setMessages(initialMessages);
      }
      setIsInitialized(true);
    }
  }, [isLoading, initialMessages, isInitialized, setMessages]);

  // Persist on change
  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages, saveMessages, isInitialized]);

  // --- Actions (invariants enforced once) ---
  const send = useCallback(
    (text: string, files?: FileUIPart[]) => {
      if (!text && !files?.length) return;
      stop();
      void sendMessage(
        { text: text || "Sent with attachments", files },
        { body: { model, webSearch, slug } }
      );
    },
    [sendMessage, stop, model, webSearch, slug]
  );

  const clear = useCallback(async () => {
    try {
      stop();
      await clearMessagesFromDB();
      setMessages([]);
      toast.success("Chat history cleared");
    } catch (error) {
      toast.error("Failed to clear chat history", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, [stop, clearMessagesFromDB, setMessages]);

  return {
    // State
    messages,
    status,
    model,
    webSearch,
    isLoading,
    isInitialized,

    // Actions
    send,
    clear,
    stop,
    regenerate,
    setModel,
    setWebSearch,
  };
}
