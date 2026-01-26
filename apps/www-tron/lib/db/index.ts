import type { UIMessage } from "@ai-sdk/react";
import Dexie, { type EntityTable } from "dexie";

export type ChatContext = 'general' | 'blog';

export interface StoredMessage extends UIMessage {
  timestamp: number;
  sequence: number;
  context: ChatContext;
}

class ChatDatabase extends Dexie {
  messages!: EntityTable<StoredMessage, "id">;

  constructor() {
    super("portfolio-chat");
    this.version(1).stores({
      messages: "id, timestamp, sequence"
    });
    this.version(2).stores({
      messages: "id, timestamp, sequence, context"
    }).upgrade(tx => {
      // Migrate existing messages to 'general' context
      return tx.table("messages").toCollection().modify(msg => {
        msg.context = 'general';
      });
    });
  }
}

export const db = new ChatDatabase();
