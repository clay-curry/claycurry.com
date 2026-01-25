import type { UIMessage } from "ai";

type MessageMetadata = {
  isPageContext?: boolean;
  pageContext?: {
    title: string;
    url: string;
  };
};

type DataParts = {
  "stream-end": {
    message: string;
  };
  notification: {
    message: string;
  };
};

// Simplified type without the tools inference
export type MyUIMessage = UIMessage<MessageMetadata, DataParts>;
