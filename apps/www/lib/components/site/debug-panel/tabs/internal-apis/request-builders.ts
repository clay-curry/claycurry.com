import type { BuiltDebugRequest } from "./types";

type JsonRequestConfig = {
  method: "GET" | "POST";
  pathTemplate: string;
  pathParams?: Record<string, string>;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  body?: unknown;
};

const DEBUG_BASE_URL = "https://debug.local";

function omitEmptyEntries(entries: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(entries).filter(([, value]) => value.trim() !== ""),
  );
}

export function replacePathParams(
  pathTemplate: string,
  pathParams: Record<string, string> = {},
) {
  return pathTemplate.replace(/\{([^}]+)\}/g, (_, key: string) =>
    encodeURIComponent(pathParams[key]?.trim() ?? ""),
  );
}

export function buildDebugUrl(
  pathTemplate: string,
  query: Record<string, string> = {},
  pathParams: Record<string, string> = {},
) {
  const url = new URL(
    replacePathParams(pathTemplate, pathParams),
    DEBUG_BASE_URL,
  );

  for (const [key, value] of Object.entries(query)) {
    const trimmed = value.trim();
    if (trimmed) {
      url.searchParams.set(key, trimmed);
    }
  }

  return `${url.pathname}${url.search}`;
}

export function buildJsonRequest({
  method,
  pathTemplate,
  pathParams = {},
  query = {},
  headers = {},
  body,
}: JsonRequestConfig): BuiltDebugRequest {
  const normalizedHeaders = omitEmptyEntries(headers);

  if (body !== undefined) {
    normalizedHeaders["Content-Type"] ??= "application/json";
  }

  return {
    url: buildDebugUrl(pathTemplate, query, pathParams),
    init: {
      method,
      headers: normalizedHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    headersPreview: normalizedHeaders,
    bodyPreview: body,
  };
}

export function splitListValue(value: string) {
  return value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function buildChatRequest(config: {
  prompt: string;
  model: string;
  webSearch: boolean;
  slug?: string;
}) {
  const body = {
    messages: [
      {
        id: "debug-panel-message",
        role: "user" as const,
        parts: [
          {
            type: "text" as const,
            text: config.prompt.trim(),
          },
        ],
      },
    ],
    model: config.model,
    webSearch: config.webSearch,
    ...(config.slug?.trim() ? { slug: config.slug.trim() } : {}),
  };

  return buildJsonRequest({
    method: "POST",
    pathTemplate: "/api/chat",
    body,
  });
}
