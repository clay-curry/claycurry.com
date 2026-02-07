"use client";

import { ChevronRightIcon, MessagesSquareIcon } from "lucide-react";
import { Portal } from "radix-ui";
import { useEffect, useState } from "react";
import type { MyUIMessage } from "@/app/api/chat/types";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/lib/components/chat/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/lib/components/chat/message";
import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputProps,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/lib/components/chat/prompt-input";
import { Shimmer } from "@/lib/components/chat/shimmer";
import { Suggestion, Suggestions } from "@/lib/components/chat/suggestion";
import { Button } from "@/lib/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/lib/components/ui/drawer";
import { Kbd, KbdGroup } from "@/lib/components/ui/kbd";
import { Spinner } from "@/lib/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/lib/components/ui/tooltip";
import { useChatSession } from "@/lib/hooks/use-chat-session";
import { useChatUI } from "@/lib/hooks/use-chat-ui";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ChatToolbar } from "./chat-toolbar";
import { MessageMetadata } from "./message-metadata";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/lib/components/chat/reasoning";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "./sources";

type ChatDrawerProps = {
  basePath?: string;
  suggestions: string[];
};

const ChatDrawerContent = ({ basePath, suggestions }: ChatDrawerProps) => {
  const [localPrompt, setLocalPrompt] = useState("");
  const [providerKey, setProviderKey] = useState(0);
  const { prompt, setPrompt, setIsDrawerOpen } = useChatUI();
  const {
    messages,
    status,
    model,
    webSearch,
    isLoading,
    send,
    clear,
    stop,
    setModel,
    setWebSearch,
  } = useChatSession({ context: "general", basePath });

  // Sync external prompt to local state and force provider remount
  useEffect(() => {
    if (prompt && prompt !== localPrompt) {
      setLocalPrompt(prompt);
      setProviderKey((prev) => prev + 1);
    }
  }, [prompt, localPrompt]);

  const handleSuggestionClick = (suggestion: string) => {
    setLocalPrompt("");
    setPrompt("");
    send(suggestion);
  };

  const handleSubmit: PromptInputProps["onSubmit"] = (message, event) => {
    event.preventDefault();
    if (!message.text) return;
    setLocalPrompt("");
    setPrompt("");
    send(message.text);
  };

  if (isLoading) {
    return (
      <div className="flex size-full w-full flex-col items-center justify-center overflow-hidden">
        <Spinner />
      </div>
    );
  }

  return (
    <div
      className="flex size-full w-full flex-col overflow-hidden bg-background"
      data-state={status}
    >
      <ChatToolbar
        messages={messages}
        model={model}
        onModelChange={setModel}
        webSearch={webSearch}
        onWebSearchChange={setWebSearch}
        onClear={clear}
        closeButton={
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
        }
      />

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
                  {isAssistantMessage && sourceParts.length > 0 && (
                    <Sources>
                      <SourcesTrigger count={sourceParts.length} />
                      <SourcesContent>
                        {sourceParts.map((part, i) => (
                          <Source
                            key={`${message.id}-source-${i}`}
                            href={
                              (part as { type: "source-url"; url: string }).url
                            }
                            title={
                              (part as { type: "source-url"; url: string }).url
                            }
                          />
                        ))}
                      </SourcesContent>
                    </Sources>
                  )}

                  {reasoningParts.map((part, i) => (
                    <Reasoning
                      key={`${message.id}-reasoning-${i}`}
                      className="w-full mb-2"
                      isStreaming={
                        isStreaming && i === reasoningParts.length - 1
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
                <Kbd className="border bg-transparent">&#8984;</Kbd>
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

export function ChatDrawer({ basePath, suggestions }: ChatDrawerProps) {
  const { isDrawerOpen, setIsDrawerOpen } = useChatUI();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
    return () => window.removeEventListener("keydown", handleKeyDown);
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
          <ChatDrawerContent basePath={basePath} suggestions={suggestions} />
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
            <ChatDrawerContent
              basePath={basePath}
              suggestions={suggestions}
            />
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
