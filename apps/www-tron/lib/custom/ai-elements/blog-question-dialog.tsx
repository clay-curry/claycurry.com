'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { CopyIcon, GlobeIcon, RefreshCcwIcon, Trash, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/lib/custom/ui/dialog";
import { useChatPersistence, useBlogChatContext } from '@/lib/hooks/use-chat';
import { Button } from '@/lib/custom/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/lib/custom/ui/tooltip';
import { CHAT_MODELS } from '@/lib/providers/chat-provider';
import { Spinner } from '@/lib/custom/ui/spinner';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/lib/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from '@/lib/components/ai-elements/message';
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
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
} from '@/lib/components/ai-elements/prompt-input';
import { CopyChat } from '@/lib/custom/ai-elements/copy-chat';
import { Loader } from '@/lib/components/ai-elements/loader';
import { Suggestion, Suggestions } from '@/lib/custom/ai-elements/suggestion';

const BLOG_SUGGESTIONS = [
  "Summarize this article",
  "What are the key takeaways?",
  "Explain the main concepts",
  "What questions does this leave unanswered?",
];

function BlogChatContent() {
  const { model, setModel, prompt, setPrompt } = useBlogChatContext();
  const [input, setInput] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { initialMessages, isLoading, saveMessages, clearMessages } = useChatPersistence('blog');
  const { messages, sendMessage, status, regenerate, setMessages, stop } = useChat();

  // Handle external prompt from AskQuestionBubble
  useEffect(() => {
    if (prompt && isInitialized) {
      setInput(prompt);
      setPrompt('');
    }
  }, [prompt, isInitialized, setPrompt]);

  const handleClearChat = async () => {
    try {
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

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({ text: suggestion }, { body: { model, webSearch } });
  };

  // Load initial messages from IndexedDB
  useEffect(() => {
    if (!isLoading && !isInitialized && initialMessages.length > 0) {
      setMessages(initialMessages);
      setIsInitialized(true);
    } else if (!isLoading && !isInitialized) {
      setIsInitialized(true);
    }
  }, [isLoading, initialMessages, isInitialized, setMessages]);

  // Save messages to IndexedDB whenever they change
  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages, saveMessages, isInitialized]);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    if (!hasText) {
      return;
    }
    sendMessage(
      { text: message.text || '' },
      {
        body: {
          model: model,
          webSearch: webSearch,
        },
      },
    );
    setInput('');
  };

  if (isLoading) {
    return (
      <div className="flex size-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 relative size-full">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-end gap-2 mb-4">
          <CopyChat messages={messages} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={messages.length === 0}
                onClick={handleClearChat}
                size="icon"
                variant="ghost"
              >
                <Trash className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear chat</TooltipContent>
          </Tooltip>
        </div>
        <Conversation className="flex-1 min-h-0">
          <ConversationContent>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">Ask about this article</h2>
                  <p className="text-muted-foreground text-sm">Try one of these suggestions:</p>
                </div>
                <Suggestions className="flex-wrap justify-center gap-2">
                  {BLOG_SUGGESTIONS.map((text) => (
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
                {message.parts.map((part, i) => {
                  if (part.type === 'text') {
                    return (
                      <Message key={`${message.id}-${i}`} from={message.role}>
                        <MessageContent>
                          <MessageResponse>
                            {part.text}
                          </MessageResponse>
                        </MessageContent>
                        {message.role === 'assistant' && i === message.parts.length - 1 && (
                          <MessageActions>
                            <MessageAction
                              onClick={() => regenerate()}
                              label="Retry"
                            >
                              <RefreshCcwIcon className="size-3" />
                            </MessageAction>
                            <MessageAction
                              onClick={() =>
                                navigator.clipboard.writeText(part.text)
                              }
                              label="Copy"
                            >
                              <CopyIcon className="size-3" />
                            </MessageAction>
                          </MessageActions>
                        )}
                      </Message>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
            {status === 'submitted' && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder="Ask a question about this article..."
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputButton
                variant={webSearch ? 'default' : 'ghost'}
                onClick={() => setWebSearch(!webSearch)}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <PromptInputSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
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
}

export function BlogQuestionDialog() {
  const { isDialogOpen, setIsDialogOpen } = useBlogChatContext();

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent
        className="h-dvh sm:h-[80vh] max-h-dvh sm:max-h-[80vh] w-full sm:max-w-2xl p-0 flex flex-col"
        showCloseButton
      >
        <DialogTitle className="sr-only">Ask about this article</DialogTitle>
        <div className="flex-1 min-h-0 overflow-hidden">
          <BlogChatContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}
