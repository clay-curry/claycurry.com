"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CopyIcon,
  RefreshCcwIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/lib/components/ui/dialog";
import { Button } from "@/lib/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/lib/components/ui/tooltip";
import { Spinner } from "@/lib/components/ui/spinner";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/lib/components/chat/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/lib/components/chat/message";
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/lib/components/chat/attachments";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/lib/components/chat/prompt-input";
import { Suggestion, Suggestions } from "@/lib/components/chat/suggestion";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/lib/components/chat/sources";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/lib/components/chat/reasoning";
import { Loader } from "@/lib/components/chat/loader";
import { GlobeIcon } from "lucide-react";
import { useChatSession, CHAT_MODELS } from "@/lib/hooks/use-chat-session";
import { useChatUI } from "@/lib/hooks/use-chat-ui";
import { useChatSuggestions } from "@/lib/providers/chat-provider";
import { useEffect } from "react";

const BLOG_SUGGESTIONS = [
  "Summarize this article",
  "What are the key takeaways?",
  "Explain the main concepts",
  "What questions does this leave unanswered?",
];

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments();
  if (attachments.files.length === 0) return null;
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
};

const ChatDialogContent = () => {
  const defaultSuggestions = useChatSuggestions();
  const { setIsDialogOpen, prompt, setPrompt, model: sharedModel, setModel: setSharedModel } = useChatUI();
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<
    Record<string, "up" | "down" | null>
  >({});
  const pathname = usePathname();

  const slug = pathname?.startsWith("/blog/")
    ? pathname.replace("/blog/", "")
    : "";
  const isBlogContext = Boolean(slug);
  const suggestions = isBlogContext ? BLOG_SUGGESTIONS : defaultSuggestions;
  const chatContext = isBlogContext ? "blog" : "general";

  const {
    messages,
    status,
    model,
    webSearch,
    isLoading,
    isInitialized,
    send,
    clear,
    stop,
    regenerate,
    setModel,
    setWebSearch,
  } = useChatSession({
    context: chatContext as "general" | "blog",
    slug,
    model: sharedModel,
    onModelChange: setSharedModel,
  });

  // Handle external prompt from AskQuestionBubble
  useEffect(() => {
    if (prompt && isInitialized) {
      send(prompt);
      setPrompt("");
    }
  }, [prompt, isInitialized, setPrompt, send]);

  const handleSuggestionClick = (suggestion: string) => {
    send(suggestion);
  };

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) return;
    send(message.text || "Sent with attachments", message.files);
    setInput("");
  };

  if (isLoading) {
    return (
      <div className="flex size-full items-center justify-center">
        <Spinner />
      </div>
    );
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
                <XIcon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear chat</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsDialogOpen(false)}
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
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === "assistant" &&
                  message.parts.filter((part) => part.type === "source-url")
                    .length > 0 && (
                    <Sources>
                      <SourcesTrigger
                        count={
                          message.parts.filter(
                            (part) => part.type === "source-url"
                          ).length
                        }
                      />
                      {message.parts
                        .filter((part) => part.type === "source-url")
                        .map((part, i) => (
                          <SourcesContent key={`${message.id}-${i}`}>
                            <Source
                              key={`${message.id}-${i}`}
                              href={part.url}
                              title={part.url}
                            />
                          </SourcesContent>
                        ))}
                    </Sources>
                  )}
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <Message
                          key={`${message.id}-${i}`}
                          from={message.role}
                        >
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
                                      prev[message.id] === "down"
                                        ? null
                                        : "down",
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
                                onClick={() =>
                                  navigator.clipboard.writeText(part.text)
                                }
                                label="Copy"
                              >
                                <CopyIcon className="size-3" />
                              </MessageAction>
                              {message.id === messages.at(-1)?.id && (
                                <MessageAction
                                  onClick={() => regenerate()}
                                  label="Retry"
                                >
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
                            i === message.parts.length - 1 &&
                            message.id === messages.at(-1)?.id
                          }
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            ))}
            {status === "submitted" && <Loader />}
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
            <PromptInputAttachmentsDisplay />
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
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
              <PromptInputSelect
                onValueChange={(value) => setModel(value)}
                value={model}
              >
                <PromptInputSelectTrigger>
                  <PromptInputSelectValue />
                </PromptInputSelectTrigger>
                <PromptInputSelectContent>
                  {CHAT_MODELS.map((m) => (
                    <PromptInputSelectItem key={m.value} value={m.value}>
                      {m.name}
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
};

export function ChatDialog() {
  const { isDialogOpen, setIsDialogOpen } = useChatUI();
  const pathname = usePathname();

  const isBlogContext = pathname?.startsWith("/blog/");
  const contextKey = pathname || "default";

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent
        className="h-[80vh] p-0 flex flex-col rounded-3xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          {isBlogContext ? "Ask about this article" : "Ask AI"}
        </DialogTitle>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatDialogContent key={contextKey} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
