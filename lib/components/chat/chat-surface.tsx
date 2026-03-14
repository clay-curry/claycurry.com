"use client";

import type { UIMessage } from "ai";
import {
  ChevronRightIcon,
  CopyIcon,
  GlobeIcon,
  RefreshCcwIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { MyUIMessage } from "@/app/api/chat/types";
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/lib/components/chat/attachments";
import { ChatToolbar } from "@/lib/components/chat/chat-toolbar";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/lib/components/chat/conversation";
import { Loader } from "@/lib/components/chat/loader";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/lib/components/chat/message";
import { MessageMetadata } from "@/lib/components/chat/message-metadata";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  type PromptInputMessage,
  type PromptInputProps,
  PromptInputProvider,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/lib/components/chat/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/lib/components/chat/reasoning";
import { Shimmer } from "@/lib/components/chat/shimmer";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/lib/components/chat/sources";
import { Suggestion, Suggestions } from "@/lib/components/chat/suggestion";
import { Button } from "@/lib/components/ui/button";
import { Kbd, KbdGroup } from "@/lib/components/ui/kbd";
import { Spinner } from "@/lib/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/lib/components/ui/tooltip";
import { CHAT_MODELS, useChatSession } from "@/lib/hooks/use-chat-session";

type ChatSurfaceBaseProps = {
  suggestions: string[];
  prompt: string;
  setPrompt: (value: string) => void;
  onClose: () => void;
};

type DialogChatSurfaceProps = ChatSurfaceBaseProps & {
  variant: "dialog";
  isBlogContext: boolean;
  slug: string;
  sharedModel: string;
  setSharedModel: (model: string) => void;
};

type DrawerChatSurfaceProps = ChatSurfaceBaseProps & {
  variant: "drawer";
  basePath?: string;
};

export type ChatSurfaceProps = DialogChatSurfaceProps | DrawerChatSurfaceProps;

type Part = {
  type: string;
  text?: string;
  url?: string;
};

function getSourceParts(parts: Part[]) {
  return parts.filter(
    (part): part is Part & { type: "source-url"; url: string } =>
      part.type === "source-url" && typeof part.url === "string",
  );
}

function getReasoningParts(parts: Part[]) {
  return parts.filter(
    (part): part is Part & { type: "reasoning"; text: string } =>
      part.type === "reasoning" && typeof part.text === "string",
  );
}

function getTextParts(parts: Part[]) {
  return parts.filter(
    (part): part is Part & { type: "text"; text: string } =>
      part.type === "text" && Boolean(part.text),
  );
}

function isSubmittedOrStreaming(status: string) {
  return status === "submitted" || status === "streaming";
}

function SurfaceLoading({ fullWidth = false }: { fullWidth?: boolean }) {
  return (
    <div
      className={`flex size-full flex-col items-center justify-center${fullWidth ? " w-full overflow-hidden" : ""}`}
    >
      <Spinner />
    </div>
  );
}

function DialogPromptInputAttachmentsDisplay() {
  const attachments = usePromptInputAttachments();

  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <Attachments variant="inline">
      {attachments.files.map((attachment) => (
        <Attachment
          data={attachment}
          key={attachment.id}
          onRemove={() => attachments.remove(attachment.id)}
        >
          <AttachmentPreview />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  );
}

function DialogMessages({
  messages,
  status,
  feedback,
  setFeedback,
  onRegenerate,
}: {
  messages: UIMessage[];
  status: string;
  feedback: Record<string, "up" | "down" | null>;
  setFeedback: React.Dispatch<
    React.SetStateAction<Record<string, "up" | "down" | null>>
  >;
  onRegenerate: () => void;
}) {
  return (
    <>
      {messages.map((message) => {
        const parts = message.parts as Part[];
        const sourceParts = getSourceParts(parts);

        return (
          <div key={message.id}>
            {message.role === "assistant" && sourceParts.length > 0 && (
              <Sources>
                <SourcesTrigger count={sourceParts.length} />
                {sourceParts.map((part, i) => (
                  <SourcesContent key={`${message.id}-${part.url}-${i}`}>
                    <Source href={part.url} title={part.url} />
                  </SourcesContent>
                ))}
              </Sources>
            )}
            {parts.map((part, i) => {
              switch (part.type) {
                case "text":
                  return (
                    <Message key={`${message.id}-${i}`} from={message.role}>
                      <MessageContent>
                        <MessageResponse>{part.text}</MessageResponse>
                      </MessageContent>
                      {message.role === "assistant" && (
                        <MessageActions>
                          <MessageAction
                            onClick={() => {
                              setFeedback((prev) => ({
                                ...prev,
                                [message.id]:
                                  prev[message.id] === "up" ? null : "up",
                              }));
                              toast.success("Thanks for your feedback!");
                            }}
                            label="Good response"
                            className={
                              feedback[message.id] === "up"
                                ? "text-green-500"
                                : ""
                            }
                          >
                            <ThumbsUpIcon className="size-3" />
                          </MessageAction>
                          <MessageAction
                            onClick={() => {
                              setFeedback((prev) => ({
                                ...prev,
                                [message.id]:
                                  prev[message.id] === "down" ? null : "down",
                              }));
                              toast.success("Thanks for your feedback!");
                            }}
                            label="Bad response"
                            className={
                              feedback[message.id] === "down"
                                ? "text-red-500"
                                : ""
                            }
                          >
                            <ThumbsDownIcon className="size-3" />
                          </MessageAction>
                          <MessageAction
                            onClick={() => {
                              if (part.text) {
                                void navigator.clipboard.writeText(part.text);
                              }
                            }}
                            label="Copy"
                          >
                            <CopyIcon className="size-3" />
                          </MessageAction>
                          {message.id === messages.at(-1)?.id && (
                            <MessageAction onClick={onRegenerate} label="Retry">
                              <RefreshCcwIcon className="size-3" />
                            </MessageAction>
                          )}
                        </MessageActions>
                      )}
                    </Message>
                  );
                case "reasoning":
                  return (
                    <Reasoning
                      key={`${message.id}-${i}`}
                      className="w-full"
                      isStreaming={
                        status === "streaming" &&
                        i === parts.length - 1 &&
                        message.id === messages.at(-1)?.id
                      }
                    >
                      <ReasoningTrigger />
                      <ReasoningContent>{part.text ?? ""}</ReasoningContent>
                    </Reasoning>
                  );
                default:
                  return null;
              }
            })}
          </div>
        );
      })}
      {status === "submitted" && <Loader />}
    </>
  );
}

function DrawerMessages({
  messages,
  status,
}: {
  messages: UIMessage[];
  status: string;
}) {
  return (
    <>
      {messages
        .filter((message, index, arr) => {
          const isLastMessage = index === arr.length - 1;
          const isStreaming =
            isLastMessage &&
            message.role === "assistant" &&
            isSubmittedOrStreaming(status);
          const hasText = getTextParts(message.parts as Part[]).length > 0;
          return hasText || isStreaming;
        })
        .map((message, index, filteredMessages) => {
          const parts = message.parts as Part[];
          const isLastMessage = index === filteredMessages.length - 1;
          const isAssistantMessage = message.role === "assistant";
          const isStreaming =
            isLastMessage &&
            isAssistantMessage &&
            isSubmittedOrStreaming(status);
          const textParts = getTextParts(parts);
          const sourceParts = getSourceParts(parts);
          const reasoningParts = getReasoningParts(parts);

          return (
            <div key={message.id}>
              {isAssistantMessage && sourceParts.length > 0 && (
                <Sources>
                  <SourcesTrigger count={sourceParts.length} />
                  <SourcesContent>
                    {sourceParts.map((part, i) => (
                      <Source
                        key={`${message.id}-source-${i}`}
                        href={part.url}
                        title={part.url}
                      />
                    ))}
                  </SourcesContent>
                </Sources>
              )}

              {reasoningParts.map((part, i) => (
                <Reasoning
                  key={`${message.id}-reasoning-${i}`}
                  className="w-full mb-2"
                  isStreaming={isStreaming && i === reasoningParts.length - 1}
                >
                  <ReasoningTrigger />
                  <ReasoningContent>{part.text}</ReasoningContent>
                </Reasoning>
              ))}

              <Message from={message.role}>
                {isAssistantMessage && (
                  <MessageMetadata
                    messageId={message.id}
                    inProgress={status === "submitted"}
                    isStreaming={isStreaming}
                    parts={parts as MyUIMessage["parts"]}
                  />
                )}
                {isStreaming && textParts.length === 0 && (
                  <div className="flex items-center gap-2">
                    <Spinner />
                    <Shimmer>
                      {sourceParts.length > 0
                        ? "Generating response..."
                        : "Looking up sources..."}
                    </Shimmer>
                  </div>
                )}
                {textParts.map((part, partIndex) => (
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
      {isSubmittedOrStreaming(status) &&
        !messages.some((message) => message.role === "assistant") && (
          <Message from="assistant">
            <div className="flex items-center gap-2">
              <Spinner />
              <Shimmer>Looking up sources...</Shimmer>
            </div>
          </Message>
        )}
    </>
  );
}

function DialogChatSurface({
  suggestions,
  prompt,
  setPrompt,
  onClose,
  isBlogContext,
  slug,
  sharedModel,
  setSharedModel,
}: Omit<DialogChatSurfaceProps, "variant">) {
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<
    Record<string, "up" | "down" | null>
  >({});

  const {
    messages,
    status,
    model,
    webSearch,
    isLoading,
    isInitialized,
    send,
    clear,
    regenerate,
    setModel,
    setWebSearch,
  } = useChatSession({
    context: isBlogContext ? "blog" : "general",
    slug,
    model: sharedModel,
    onModelChange: setSharedModel,
  });

  useEffect(() => {
    if (prompt && isInitialized) {
      send(prompt);
      setPrompt("");
    }
  }, [prompt, isInitialized, send, setPrompt]);

  const handleSuggestionClick = (suggestion: string) => {
    send(suggestion);
  };

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    send(message.text || "Sent with attachments", message.files);
    setInput("");
  };

  if (isLoading) {
    return <SurfaceLoading />;
  }

  return (
    <div
      className="max-w-4xl mx-auto p-6 relative size-full"
      data-state={status}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-start gap-2 mb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={messages.length === 0}
                onClick={clear}
                size="icon"
                variant="ghost"
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear chat</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onClose}
                size="icon"
                variant="ghost"
                className="ml-auto text-red-700 hover:text-red-800"
              >
                <XIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close</TooltipContent>
          </Tooltip>
        </div>
        <Conversation className="flex-1 min-h-0">
          <ConversationContent>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">
                    {isBlogContext
                      ? "Ask about this article"
                      : "Ask me anything"}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Try one of these suggestions:
                  </p>
                </div>
                <Suggestions className="flex-wrap justify-center gap-2">
                  {suggestions.map((text) => (
                    <Suggestion
                      key={text}
                      onClick={handleSuggestionClick}
                      suggestion={text}
                    />
                  ))}
                </Suggestions>
              </div>
            )}
            <DialogMessages
              messages={messages}
              status={status}
              feedback={feedback}
              setFeedback={setFeedback}
              onRegenerate={regenerate}
            />
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput
          onSubmit={handleSubmit}
          className="mt-4"
          globalDrop
          multiple
        >
          <PromptInputHeader>
            <DialogPromptInputAttachmentsDisplay />
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(event) => setInput(event.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputButton
                variant={webSearch ? "default" : "ghost"}
                onClick={() => setWebSearch(!webSearch)}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <PromptInputSelect onValueChange={setModel} value={model}>
                <PromptInputSelectTrigger>
                  <PromptInputSelectValue />
                </PromptInputSelectTrigger>
                <PromptInputSelectContent>
                  {CHAT_MODELS.map((chatModel) => (
                    <PromptInputSelectItem
                      key={chatModel.value}
                      value={chatModel.value}
                    >
                      {chatModel.name}
                    </PromptInputSelectItem>
                  ))}
                </PromptInputSelectContent>
              </PromptInputSelect>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input && !status} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

function DrawerChatSurface({
  suggestions,
  prompt,
  setPrompt,
  onClose,
  basePath,
}: Omit<DrawerChatSurfaceProps, "variant">) {
  const [localPrompt, setLocalPrompt] = useState("");
  const [providerKey, setProviderKey] = useState(0);

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

    if (!message.text) {
      return;
    }

    setLocalPrompt("");
    setPrompt("");
    send(message.text);
  };

  if (isLoading) {
    return <SurfaceLoading fullWidth />;
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
              <Button onClick={onClose} size="icon-sm" variant="ghost">
                <ChevronRightIcon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close chat</TooltipContent>
          </Tooltip>
        }
      />

      <Conversation>
        <ConversationContent>
          <DrawerMessages messages={messages} status={status} />
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
                onChange={(event) => {
                  setLocalPrompt(event.target.value);
                  setPrompt(event.target.value);
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
}

export function ChatSurface(props: ChatSurfaceProps) {
  if (props.variant === "dialog") {
    const { variant: _variant, ...rest } = props;
    return <DialogChatSurface {...rest} />;
  }

  const { variant: _variant, ...rest } = props;
  return <DrawerChatSurface {...rest} />;
}
