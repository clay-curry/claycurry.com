"use client";

import type { UIMessage } from "@ai-sdk/react";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useEffect, useRef } from "react";
import { db, type ChatContext } from "@/lib/db";

// Atoms for general chat UI state
export const chatPromptAtom = atom<string>("");
export const chatDrawerOpenAtom = atomWithStorage<boolean>("portfolio:chat-drawer-open", false);
export const chatDialogOpenAtom = atomWithStorage<boolean>("portfolio:chat-dialog-open", false);
export const chatModelAtom = atomWithStorage<string>("portfolio:chat-model", "grok/grok-3-mini");

// Hook to access general chat UI state (open/close, prompt, model)
export const useChatContext = () => {
  const [prompt, setPrompt] = useAtom(chatPromptAtom);
  const [isDrawerOpen, setIsDrawerOpen] = useAtom(chatDrawerOpenAtom);
  const [isDialogOpen, setIsDialogOpen] = useAtom(chatDialogOpenAtom);
  const [model, setModel] = useAtom(chatModelAtom);

  return {
    prompt,
    setPrompt,
    isDrawerOpen,
    setIsDrawerOpen,
    isDialogOpen,
    setIsDialogOpen,
    model,
    setModel
  };
};

// Hook for message persistence in IndexedDB (context-aware)
export const useChatPersistence = (context: ChatContext = 'general') => {
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // Load messages from Dexie with live query, filtered by context
  const storedMessages = useLiveQuery(
    () => db.messages.where("context").equals(context).sortBy("sequence"),
    [context]
  );

  const initialMessages =
    storedMessages?.map(
      ({ timestamp: _timestamp, sequence: _sequence, context: _context, ...message }) => message
    ) ?? [];

  const isLoading = storedMessages === undefined;

  // Save messages to Dexie with debouncing (scoped to context)
  const saveMessages = useCallback((messages: UIMessage[]) => {
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
          context
        }));

        await db.transaction("rw", db.messages, async () => {
          // Only clear messages for this context
          await db.messages.where("context").equals(context).delete();
          await db.messages.bulkAdd(messagesToStore);
        });
      } catch (error) {
        console.error("Failed to save messages:", error);
      }
    }, 300);
  }, [context]);

  // Clear messages for this context only
  const clearMessages = useCallback(async () => {
    try {
      await db.messages.where("context").equals(context).delete();
    } catch (error) {
      console.error("Failed to clear messages:", error);
    }
  }, [context]);

  // Cleanup timeout on unmount
  useEffect(
    () => () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    },
    []
  );

  return {
    initialMessages,
    isLoading,
    saveMessages,
    clearMessages
  };
};
