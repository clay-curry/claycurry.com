'use client';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/lib/components/chat/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from '@/lib/components/chat/message';
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from '@/lib/components/chat/attachments';
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
} from '@/lib/components/chat/prompt-input';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { CopyIcon, GlobeIcon, RefreshCcwIcon, Trash, XIcon, ThumbsUpIcon, ThumbsDownIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useChatPersistence, useChatContext } from '@/lib/hooks/use-chat';
import { CopyChat } from '@/lib/components/chat/copy-chat';
import { Button } from '@/lib/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/lib/components/ui/tooltip';
import { useChatSuggestions, CHAT_MODELS } from '@/lib/providers/chat-provider';
import { Spinner } from '@/lib/components/ui/spinner';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/lib/components/chat/sources';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/lib/components/chat/reasoning';
import { Loader } from '@/lib/components/chat/loader';
import { Suggestion, Suggestions } from '@/lib/components/chat/suggestion';
const PromptInputAttachmentsDisplay = () => {
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
};

const BLOG_SUGGESTIONS = [
  "Summarize this article",
  "What are the key takeaways?",
  "Explain the main concepts",
  "What questions does this leave unanswered?",
];

const ChatBotDemo = () => {
  const defaultSuggestions = useChatSuggestions();
  const { model, setModel, setIsDialogOpen, prompt, setPrompt } = useChatContext();
  const [input, setInput] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down' | null>>({});
  const pathname = usePathname();

  // Extract slug from pathname - if on a blog page, use blog context
  const slug = pathname?.startsWith('/blog/') ? pathname.replace('/blog/', '') : '';
  const isBlogContext = Boolean(slug);
  const suggestions = isBlogContext ? BLOG_SUGGESTIONS : defaultSuggestions;
  const chatContext = isBlogContext ? 'blog' : 'general';

  const { initialMessages, isLoading, saveMessages, clearMessages } = useChatPersistence(chatContext);
  const { messages, sendMessage, status, regenerate, setMessages, stop } = useChat({ id: chatContext });

  // Handle external prompt from AskQuestionBubble - automatically send the message
  useEffect(() => {
    if (prompt && isInitialized) {
      sendMessage({ text: prompt }, { body: { model, webSearch, slug } });
      setPrompt('');
    }
  }, [prompt, isInitialized, setPrompt, sendMessage, model, webSearch, slug]);

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
    sendMessage({ text: suggestion }, { body: { model, webSearch, slug } });
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
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) {
      return;
    }
    sendMessage(
      {
        text: message.text || 'Sent with attachments',
        files: message.files
      },
      {
        body: {
          model: model,
          webSearch: webSearch,
          slug: slug,
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
    <div className="max-w-4xl mx-auto p-6 relative size-full">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-start gap-2 mb-4">
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
                    {isBlogContext ? "Ask about this article" : "Ask me anything"}
                  </h2>
                  <p className="text-muted-foreground text-sm">Try one of these suggestions:</p>
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
                {message.role === 'assistant' && message.parts.filter((part) => part.type === 'source-url').length > 0 && (
                  <Sources>
                    <SourcesTrigger
                      count={
                        message.parts.filter(
                          (part) => part.type === 'source-url',
                        ).length
                      }
                    />
                    {message.parts.filter((part) => part.type === 'source-url').map((part, i) => (
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
                    case 'text':
                      return (
                        <Message key={`${message.id}-${i}`} from={message.role}>
                          <MessageContent>
                            <MessageResponse>
                              {part.text}
                            </MessageResponse>
                          </MessageContent>
                          {message.role === 'assistant' && (
                            <MessageActions>
                              <MessageAction
                                onClick={() => {
                                  setFeedback(prev => ({
                                    ...prev,
                                    [message.id]: prev[message.id] === 'up' ? null : 'up'
                                  }));
                                  toast.success('Thanks for your feedback!');
                                }}
                                label="Good response"
                                className={feedback[message.id] === 'up' ? 'text-green-500' : ''}
                              >
                                <ThumbsUpIcon className="size-3" />
                              </MessageAction>
                              <MessageAction
                                onClick={() => {
                                  setFeedback(prev => ({
                                    ...prev,
                                    [message.id]: prev[message.id] === 'down' ? null : 'down'
                                  }));
                                  toast.success('Thanks for your feedback!');
                                }}
                                label="Bad response"
                                className={feedback[message.id] === 'down' ? 'text-red-500' : ''}
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
                    case 'reasoning':
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
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
            {status === 'submitted' && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <PromptInput onSubmit={handleSubmit} className="mt-4" globalDrop multiple>
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
};
export default ChatBotDemo;