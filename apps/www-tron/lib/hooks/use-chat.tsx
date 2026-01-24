"use client";

import type { UIMessage } from "@ai-sdk/react";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useEffect, useRef } from "react";
import { db } from "@/lib/db";

// Atoms for global chat UI state
export const chatPromptAtom = atom<string>("");
export const chatDrawerOpenAtom = atomWithStorage<boolean>("portfolio:chat-drawer-open", false);
export const chatDialogOpenAtom = atomWithStorage<boolean>("portfolio:chat-dialog-open", false);

// Hook to access chat UI state (open/close, prompt)
export const useChatContext = () => {
  const [prompt, setPrompt] = useAtom(chatPromptAtom);
  const [isDrawerOpen, setIsDrawerOpen] = useAtom(chatDrawerOpenAtom);
  const [isDialogOpen, setIsDialogOpen] = useAtom(chatDialogOpenAtom);

  return {
    prompt,
    setPrompt,
    isDrawerOpen,
    setIsDrawerOpen,
    isDialogOpen,
    setIsDialogOpen
  };
};

// Hook for message persistence in IndexedDB
export const useChatPersistence = () => {
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // Load messages from Dexie with live query
  const storedMessages = useLiveQuery(() =>
    db.messages.orderBy("sequence").toArray()
  );

  const initialMessages =
    storedMessages?.map(
      ({ timestamp: _timestamp, sequence: _sequence, ...message }) => message
    ) ?? [];

  const isLoading = storedMessages === undefined;

  // Save messages to Dexie with debouncing
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
          sequence: index
        }));

        await db.transaction("rw", db.messages, async () => {
          await db.messages.clear();
          await db.messages.bulkAdd(messagesToStore);
        });
      } catch (error) {
        console.error("Failed to save messages:", error);
      }
    }, 300);
  }, []);

  // Clear all messages from Dexie
  const clearMessages = useCallback(async () => {
    try {
      await db.messages.clear();
    } catch (error) {
      console.error("Failed to clear messages:", error);
    }
  }, []);

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
