export const CHAT_MODELS = [
  { name: "Grok 3 Mini", value: "grok/grok-3-mini" },
  { name: "Claude Haiku", value: "anthropic/claude-3-haiku-20240307" },
  { name: "GPT 4o", value: "openai/gpt-4o" },
] as const;

export type ChatModel = (typeof CHAT_MODELS)[number];

export const DEFAULT_CHAT_MODEL = CHAT_MODELS[0].value;
