export type InternalApiFieldOption = {
  label: string;
  value: string;
};

type InternalApiFieldBase = {
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
};

export type InternalApiField =
  | (InternalApiFieldBase & {
      type: "text" | "textarea";
      defaultValue?: string;
    })
  | (InternalApiFieldBase & {
      type: "select";
      defaultValue?: string;
      options: InternalApiFieldOption[];
    })
  | (InternalApiFieldBase & {
      type: "switch";
      defaultValue?: boolean;
    });

export type InternalApiFormValues = Record<string, string | boolean>;

export type BuiltDebugRequest = {
  url: string;
  init: RequestInit;
  headersPreview: Record<string, string>;
  bodyPreview?: unknown;
};

export type InternalApiDescriptor = {
  id: string;
  label: string;
  method: "GET" | "POST";
  pathTemplate: string;
  description: string;
  warning?: string;
  disabledReason?: string;
  defaultsKey: string;
  fields: InternalApiField[];
  buildRequest: (values: InternalApiFormValues) => BuiltDebugRequest;
};

export type InternalApiResponseState = {
  request: {
    method: "GET" | "POST";
    url: string;
    headers: Record<string, string>;
    body?: string;
  };
  ok: boolean;
  status: number;
  statusText: string;
  durationMs: number;
  contentType: string;
  body: string;
};
