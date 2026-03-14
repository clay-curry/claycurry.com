"use client";

import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { DEFAULT_CHAT_MODEL } from "@/lib/chat/models";

// Atoms for cross-component UI coordination (open/close surfaces, external prompt, shared model)
export const chatPromptAtom = atom<string>("");
export const chatDrawerOpenAtom = atomWithStorage<boolean>(
  "portfolio:chat-drawer-open",
  false,
);
export const chatDialogOpenAtom = atomWithStorage<boolean>(
  "portfolio:chat-dialog-open",
  false,
);
// Shared model atom: allows hero to pre-select model before dialog opens
export const chatModelAtom = atomWithStorage<string>(
  "portfolio:chat-model",
  DEFAULT_CHAT_MODEL,
);

// Hook for UI coordination state: which surface is open, external prompt injection, shared model
export const useChatUI = () => {
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
    setModel,
  };
};
