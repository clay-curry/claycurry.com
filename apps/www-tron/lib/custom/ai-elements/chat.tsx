"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChevronRightIcon, GlobeIcon, MessagesSquareIcon, Trash } from "lucide-react";
import { Portal } from "radix-ui";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { MyUIMessage } from "@/app/api/chat/types";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton
} from "@/lib/custom/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse
} from "@/lib/custom/ai-elements/message";
import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputProps,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea
} from "@/lib/custom/ai-elements/prompt-input";
import { Shimmer } from "@/lib/custom/ai-elements/shimmer";
import { Suggestion, Suggestions } from "@/lib/custom/ai-elements/suggestion";
import { Button } from "@/lib/custom/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/lib/custom/ui/drawer";
import { useChatContext, useChatPersistence } from "@/lib/hooks/use-chat";
import { CHAT_MODELS } from "@/lib/providers/chat-provider";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "@/lib/custom/ui/button-group";
import { Kbd, KbdGroup } from "@/lib/custom/ui/kbd";
import { Spinner } from "@/lib/custom/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/custom/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/lib/custom/ui/select";
import { CopyChat } from "./copy-chat";
import { MessageMetadata } from "./message-metadata";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger
} from "@/lib/components/ai-elements/reasoning";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger
} from "./sources";

type ChatProps = {
  basePath?: string;
  suggestions: string[];
};

const ChatInner = ({ basePath, suggestions }: ChatProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [localPrompt, setLocalPrompt] = useState("");
  const [providerKey, setProviderKey] = useState(0);
  const [model, setModel] = useState<string>(CHAT_MODELS[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const { prompt, setPrompt, setIsDrawerOpen } = useChatContext();
  const { initialMessages, isLoading, saveMessages, clearMessages } =
    useChatPersistence();

  const { messages, sendMessage, status, setMessages, stop } = useChat({
    transport: new DefaultChatTransport({
      api: basePath ? `${basePath}/api/chat` : "/api/chat"
    }),
    onError: (error) => {
      toast.error(error.message, {
        description: error.message
      });
    }
  });

  // Sync external prompt changes to local state and force provider remount
  useEffect(() => {
    if (prompt && prompt !== localPrompt) {
      setLocalPrompt(prompt);
      setProviderKey((prev) => prev + 1);
    }
  }, [prompt, localPrompt]);

  // Set initial messages once loaded from IndexedDB
  useEffect(() => {
    if (!(isLoading || isInitialized) && initialMessages.length > 0) {
      setMessages(initialMessages);
      setIsInitialized(true);
    } else if (!(isLoading || isInitialized)) {
      // Mark as initialized even if no messages to avoid infinite re-runs
      setIsInitialized(true);
    }
  }, [isLoading, initialMessages, isInitialized, setMessages]);

  // Save messages to IndexedDB whenever they change (but only after initialization)
  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages, saveMessages, isInitialized]);

  const handleSuggestionClick = (suggestion: string) => {
    stop();
    setLocalPrompt("");
    setPrompt("");
    void sendMessage({ text: suggestion }, { body: { model, webSearch } });
  };

  const handleSubmit: PromptInputProps["onSubmit"] = (message, event) => {
    event.preventDefault();

    const { text } = message;

    if (!text) {
      return;
    }

    stop();
    setLocalPrompt("");
    setPrompt("");
    void sendMessage({ text }, { body: { model, webSearch } });
  };

  const handleClearChat = async () => {
    try {
      // Cancel any active stream first
      stop();
      await clearMessages();
      setMessages([]);
      toast.success("Chat history cleared");
    } catch (error) {
      toast.error("Failed to clear chat history", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  // Show loading state while initial messages are being loaded
  if (isLoading) {
    return (
      <div className="flex size-full w-full flex-col items-center justify-center overflow-hidden rounded-xl xl:max-w-md xl:border xl:bg-background">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex size-full w-full flex-col overflow-hidden bg-background">
      <div className="flex items-center justify-between px-4 py-2.5 border-b">
        <div className="flex items-center gap-2">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="h-7 w-auto gap-1 text-xs border-none shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHAT_MODELS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant={webSearch ? "default" : "ghost"}
                onClick={() => setWebSearch(!webSearch)}
              >
                <GlobeIcon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {webSearch ? "Web search enabled" : "Enable web search"}
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-3">
          <ButtonGroup orientation="horizontal">
            <CopyChat messages={messages} />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={messages.length === 0}
                  onClick={handleClearChat}
                  size="icon-sm"
                  variant="ghost"
                >
                  <Trash className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear chat</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsDrawerOpen(false)}
                  size="icon-sm"
                  variant="ghost"
                >
                  <ChevronRightIcon className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Close chat</TooltipContent>
            </Tooltip>
          </ButtonGroup>
        </div>
      </div>

      <Conversation>
        <ConversationContent>
          {messages
            .filter((message, index, arr) => {
              const isLastMessage = index === arr.length - 1;
              const isStreaming =
                isLastMessage &&
                message.role === "assistant" &&
                (status === "streaming" || status === "submitted");
              const hasText = message.parts.some(
                (part) => part.type === "text" && part.text
              );
              // Include message if it has text OR if it's actively streaming
              return hasText || isStreaming;
            })
            .map((message, index, filteredMessages) => {
              const isLastMessage = index === filteredMessages.length - 1;
              const isAssistantMessage = message.role === "assistant";
              const isStreaming =
                isLastMessage &&
                isAssistantMessage &&
                (status === "streaming" || status === "submitted");
              const hasTextContent = message.parts.some(
                (part) => part.type === "text"
              );

              const sourceParts = message.parts.filter(
                (part) => part.type === "source-url"
              );
              const reasoningParts = message.parts.filter(
                (part) => part.type === "reasoning"
              );

              return (
                <div key={message.id}>
                  {/* Sources display */}
                  {isAssistantMessage && sourceParts.length > 0 && (
                    <Sources>
                      <SourcesTrigger count={sourceParts.length} />
                      <SourcesContent>
                        {sourceParts.map((part, i) => (
                          <Source
                            key={`${message.id}-source-${i}`}
                            href={(part as { type: "source-url"; url: string }).url}
                            title={(part as { type: "source-url"; url: string }).url}
                          />
                        ))}
                      </SourcesContent>
                    </Sources>
                  )}

                  {/* Reasoning display */}
                  {reasoningParts.map((part, i) => (
                    <Reasoning
                      key={`${message.id}-reasoning-${i}`}
                      className="w-full mb-2"
                      isStreaming={
                        isStreaming &&
                        i === reasoningParts.length - 1
                      }
                    >
                      <ReasoningTrigger />
                      <ReasoningContent>
                        {(part as { type: "reasoning"; text: string }).text}
                      </ReasoningContent>
                    </Reasoning>
                  ))}

                  <Message from={message.role}>
                    {isAssistantMessage && (
                      <MessageMetadata
                        messageId={message.id}
                        inProgress={status === "submitted"}
                        isStreaming={isStreaming}
                        parts={message.parts as MyUIMessage["parts"]}
                      />
                    )}
                    {isStreaming && !hasTextContent && (
                      <div className="flex items-center gap-2">
                        <Spinner />
                        <Shimmer>
                          {sourceParts.length > 0
                            ? "Generating response..."
                            : "Looking up sources..."}
                        </Shimmer>
                      </div>
                    )}
                    {message.parts
                      .filter((part) => part.type === "text")
                      .map((part, partIndex) => (
                        <MessageContent
                          key={`${message.id}-${part.type}-${partIndex}`}
                        >
                          {isAssistantMessage ? (
                            <MessageResponse className="text-wrap">
                              {part.text}
                            </MessageResponse>
                          ) : (
                            part.text
                          )}
                        </MessageContent>
                      ))}
                  </Message>
                </div>
              );
            })}
          {(status === "submitted" || status === "streaming") &&
            !messages.some((m) => m.role === "assistant") && (
              <Message from="assistant">
                <div className="flex items-center gap-2">
                  <Spinner />
                  <Shimmer>Looking up sources...</Shimmer>
                </div>
              </Message>
            )}
        </ConversationContent>
        <ConversationScrollButton className="border-none bg-foreground text-background hover:bg-foreground/80 hover:text-background" />
      </Conversation>

      <div className="relative grid w-auto shrink-0 gap-4 p-4">
        {!messages.length && (
          <>
            <Suggestions className="flex-col items-start gap-px">
              {suggestions.map((text) => (
                <Suggestion
                  className="rounded-none p-0"
                  key={text}
                  onClick={handleSuggestionClick}
                  suggestion={text}
                  variant="link"
                />
              ))}
            </Suggestions>
            <p className="text-muted-foreground text-sm">
              Tip: You can open and close chat with{" "}
              <KbdGroup>
                <Kbd className="border bg-transparent">⌘</Kbd>
                <Kbd className="border bg-transparent">I</Kbd>
              </KbdGroup>
            </p>
          </>
        )}
        <PromptInputProvider initialInput={localPrompt} key={providerKey}>
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputBody>
              <PromptInputTextarea
                maxLength={1000}
                onChange={(e) => {
                  setLocalPrompt(e.target.value);
                  setPrompt(e.target.value);
                }}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <p className="text-muted-foreground text-xs">
                {localPrompt.length} / 1000
              </p>
              <PromptInputSubmit onStop={stop} status={status} />
            </PromptInputFooter>
          </PromptInput>
        </PromptInputProvider>
      </div>
    </div>
  );
};

export const ChatDrawer = ({ basePath, suggestions }: ChatProps) => {
  const { isDrawerOpen, setIsDrawerOpen } = useChatContext();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Meta (⌘ on Mac, Windows key on Windows) + "i" (ignore case)
      if (
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "i"
      ) {
        event.preventDefault();

        setIsDrawerOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsDrawerOpen]);

  return (
    <>
      <Button
        className="hidden shrink-0 shadow-none md:flex"
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        size="sm"
        variant="outline"
      >
        <MessagesSquareIcon className="size-3.5 text-muted-foreground" />
        <span>Ask AI</span>
      </Button>

      <Portal.Root>
        <div
          className={cn(
            "fixed z-50 flex flex-col gap-4 bg-background transition-all",
            "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
            "translate-x-full data-[state=open]:translate-x-0",
            "hidden md:flex"
          )}
          data-state={isDrawerOpen ? "open" : "closed"}
        >
          <ChatInner basePath={basePath} suggestions={suggestions} />
        </div>
      </Portal.Root>
      <div className="md:hidden">
        <Drawer
          onOpenChange={isMobile ? setIsDrawerOpen : undefined}
          open={isMobile ? isDrawerOpen : false}
        >
          <DrawerTrigger asChild>
            <Button className="shadow-none" size="sm" variant="outline">
              <MessagesSquareIcon className="size-3.5 text-muted-foreground" />
              Ask AI
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[80dvh]">
            <ChatInner basePath={basePath} suggestions={suggestions} />
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};
