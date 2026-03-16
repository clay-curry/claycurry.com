import { CHAT_MODELS, DEFAULT_CHAT_MODEL } from "@/lib/hooks/use-chat-session";
import { BOOKMARKS_LIVE_SOURCE } from "@/lib/x/debug";
import { MOCK_SCENARIOS } from "@/lib/x/mock-bookmarks";
import {
  buildChatRequest,
  buildJsonRequest,
  splitListValue,
} from "./request-builders";
import type { InternalApiDescriptor, InternalApiFormValues } from "./types";

const NO_MOCK_VALUE = "__none__";
const DEFAULT_BOOKMARKS_SOURCE_VALUE = "__default__";

function getString(
  values: InternalApiFormValues,
  key: string,
  fallback = "",
): string {
  const value = values[key];
  return typeof value === "string" ? value : fallback;
}

function getBoolean(values: InternalApiFormValues, key: string) {
  return values[key] === true;
}

export function getInternalApiDescriptors(
  activeBookmarksMock: string,
  activeBookmarksSource: string,
): InternalApiDescriptor[] {
  return [
    {
      id: "chat",
      label: "POST /api/chat",
      method: "POST",
      pathTemplate: "/api/chat",
      description:
        "Sends a single test prompt through the AI gateway route with the selected model settings.",
      defaultsKey: "chat",
      fields: [
        {
          name: "prompt",
          label: "Prompt",
          type: "textarea",
          required: true,
          defaultValue: "Give me a one-sentence debug status update.",
        },
        {
          name: "model",
          label: "Model",
          type: "select",
          defaultValue: DEFAULT_CHAT_MODEL,
          options: CHAT_MODELS.map((model) => ({
            label: model.name,
            value: model.value,
          })),
        },
        {
          name: "webSearch",
          label: "Web search",
          type: "switch",
          defaultValue: false,
        },
        {
          name: "slug",
          label: "Article slug",
          type: "text",
          placeholder: "Optional blog slug for article context",
        },
      ],
      buildRequest: (values) =>
        buildChatRequest({
          prompt: getString(values, "prompt"),
          model: getString(values, "model", DEFAULT_CHAT_MODEL),
          webSearch: getBoolean(values, "webSearch"),
          slug: getString(values, "slug"),
        }),
    },
    {
      id: "bookmarks",
      label: "GET /api/x/bookmarks",
      method: "GET",
      pathTemplate: "/api/x/bookmarks",
      description:
        "Calls the bookmarks endpoint with the same source and mock controls exposed in the Bookmarks tab.",
      defaultsKey: `bookmarks:${activeBookmarksSource || "default"}:${activeBookmarksMock || "none"}`,
      fields: [
        {
          name: "folder",
          label: "Folder ID",
          type: "text",
          placeholder: "Optional folder ID",
        },
        {
          name: "source",
          label: "Source",
          type: "select",
          defaultValue: activeBookmarksSource || DEFAULT_BOOKMARKS_SOURCE_VALUE,
          options: [
            { label: "Default", value: DEFAULT_BOOKMARKS_SOURCE_VALUE },
            { label: "Live X API", value: BOOKMARKS_LIVE_SOURCE },
          ],
        },
        {
          name: "mock",
          label: "Mock scenario",
          type: "select",
          defaultValue: activeBookmarksMock || NO_MOCK_VALUE,
          description: "Only applies when Source is set to Default.",
          options: [
            { label: "None", value: NO_MOCK_VALUE },
            ...MOCK_SCENARIOS.map((scenario) => ({
              label: scenario.label,
              value: scenario.value,
            })),
          ],
        },
      ],
      buildRequest: (values) => {
        const source =
          getString(values, "source") === DEFAULT_BOOKMARKS_SOURCE_VALUE
            ? ""
            : getString(values, "source");
        const isLiveSource = source === BOOKMARKS_LIVE_SOURCE;

        return buildJsonRequest({
          method: "GET",
          pathTemplate: "/api/x/bookmarks",
          query: {
            folder: getString(values, "folder"),
            source,
            mock: isLiveSource
              ? ""
              : getString(values, "mock") === NO_MOCK_VALUE
                ? ""
                : getString(values, "mock"),
          },
        });
      },
    },
    {
      id: "bookmarks-status",
      label: "GET /api/x/bookmarks/status",
      method: "GET",
      pathTemplate: "/api/x/bookmarks/status",
      description:
        "Reads the bookmarks sync status route using the owner secret.",
      defaultsKey: "bookmarks-status",
      fields: [
        {
          name: "secret",
          label: "Owner secret",
          type: "text",
          required: true,
          placeholder: "X owner secret",
        },
      ],
      buildRequest: (values) =>
        buildJsonRequest({
          method: "GET",
          pathTemplate: "/api/x/bookmarks/status",
          query: {
            secret: getString(values, "secret"),
          },
        }),
    },
    {
      id: "views-get",
      label: "GET /api/views",
      method: "GET",
      pathTemplate: "/api/views",
      description: "Returns the current view count for a slug.",
      defaultsKey: "views-get",
      fields: [
        {
          name: "slug",
          label: "Slug",
          type: "text",
          required: true,
          defaultValue: "/blog/debug-panel",
        },
      ],
      buildRequest: (values) =>
        buildJsonRequest({
          method: "GET",
          pathTemplate: "/api/views",
          query: {
            slug: getString(values, "slug"),
          },
        }),
    },
    {
      id: "views-post",
      label: "POST /api/views",
      method: "POST",
      pathTemplate: "/api/views",
      description: "Records a page view and updates the dedupe cookie.",
      warning: "This mutates analytics data for the provided slug.",
      defaultsKey: "views-post",
      fields: [
        {
          name: "slug",
          label: "Slug",
          type: "text",
          required: true,
          defaultValue: "/blog/debug-panel",
        },
      ],
      buildRequest: (values) =>
        buildJsonRequest({
          method: "POST",
          pathTemplate: "/api/views",
          body: {
            slug: getString(values, "slug"),
          },
        }),
    },
    {
      id: "clicks-get",
      label: "GET /api/clicks",
      method: "GET",
      pathTemplate: "/api/clicks",
      description: "Fetches the current click-count map.",
      defaultsKey: "clicks-get",
      fields: [],
      buildRequest: () =>
        buildJsonRequest({
          method: "GET",
          pathTemplate: "/api/clicks",
        }),
    },
    {
      id: "clicks-post",
      label: "POST /api/clicks",
      method: "POST",
      pathTemplate: "/api/clicks",
      description: "Records one or more click IDs.",
      warning: "This mutates analytics counters for the provided click IDs.",
      defaultsKey: "clicks-post",
      fields: [
        {
          name: "ids",
          label: "Click IDs",
          type: "textarea",
          required: true,
          defaultValue: "debug:manual-click",
          description: "Separate multiple IDs with commas or new lines.",
        },
      ],
      buildRequest: (values) =>
        buildJsonRequest({
          method: "POST",
          pathTemplate: "/api/clicks",
          body: {
            ids: splitListValue(getString(values, "ids")),
          },
        }),
    },
    {
      id: "contact",
      label: "POST /api/contact",
      method: "POST",
      pathTemplate: "/api/contact",
      description: "Submits the contact form endpoint.",
      warning: "This sends a real email if Resend is configured.",
      defaultsKey: "contact",
      fields: [
        {
          name: "name",
          label: "Name",
          type: "text",
          required: true,
          defaultValue: "Debug Panel",
        },
        {
          name: "email",
          label: "Email",
          type: "text",
          required: true,
          defaultValue: "debug@claycurry.studio",
        },
        {
          name: "message",
          label: "Message",
          type: "textarea",
          required: true,
          defaultValue: "Testing the debug panel contact endpoint.",
        },
      ],
      buildRequest: (values) =>
        buildJsonRequest({
          method: "POST",
          pathTemplate: "/api/contact",
          body: {
            name: getString(values, "name"),
            email: getString(values, "email"),
            message: getString(values, "message"),
          },
        }),
    },
    {
      id: "feedback",
      label: "POST /api/feedback",
      method: "POST",
      pathTemplate: "/api/feedback",
      description: "Submits page feedback with optional notes.",
      warning: "This sends a real feedback email if Resend is configured.",
      defaultsKey: "feedback",
      fields: [
        {
          name: "page",
          label: "Page",
          type: "text",
          required: true,
          defaultValue: "/blog/debug-panel",
        },
        {
          name: "sentiment",
          label: "Sentiment",
          type: "select",
          required: true,
          defaultValue: "positive",
          options: [
            { label: "Positive", value: "positive" },
            { label: "Negative", value: "negative" },
          ],
        },
        {
          name: "message",
          label: "Message",
          type: "textarea",
          defaultValue: "Testing the feedback endpoint from the debug panel.",
        },
      ],
      buildRequest: (values) =>
        buildJsonRequest({
          method: "POST",
          pathTemplate: "/api/feedback",
          body: {
            page: getString(values, "page"),
            sentiment: getString(values, "sentiment", "positive"),
            message: getString(values, "message"),
          },
        }),
    },
    {
      id: "trace",
      label: "GET /api/trace/{id}",
      method: "GET",
      pathTemplate: "/api/trace/{id}",
      description:
        "Fetches a stored trace by ID with optional tree formatting.",
      defaultsKey: "trace",
      fields: [
        {
          name: "traceId",
          label: "Trace ID",
          type: "text",
          required: true,
          placeholder: "32 character trace ID",
        },
        {
          name: "tree",
          label: "Tree output",
          type: "switch",
          defaultValue: true,
        },
        {
          name: "secret",
          label: "Owner secret",
          type: "text",
          placeholder: "Optional query secret",
        },
        {
          name: "ownerSecretHeader",
          label: "x-owner-secret header",
          type: "text",
          placeholder: "Optional request header",
        },
      ],
      buildRequest: (values) =>
        buildJsonRequest({
          method: "GET",
          pathTemplate: "/api/trace/{id}",
          pathParams: {
            id: getString(values, "traceId"),
          },
          query: {
            tree: getBoolean(values, "tree") ? "true" : "",
            secret: getString(values, "secret"),
          },
          headers: {
            "x-owner-secret": getString(values, "ownerSecretHeader"),
          },
        }),
    },
    {
      id: "x-auth",
      label: "GET /api/x/auth",
      method: "GET",
      pathTemplate: "/api/x/auth",
      description: "Starts the X OAuth redirect flow.",
      warning: "This route redirects to an external OAuth flow.",
      disabledReason:
        "Disabled here because the response is a redirect-based auth flow, not a JSON/debug response.",
      defaultsKey: "x-auth",
      fields: [],
      buildRequest: () =>
        buildJsonRequest({
          method: "GET",
          pathTemplate: "/api/x/auth",
        }),
    },
    {
      id: "x-callback",
      label: "GET /api/x/callback",
      method: "GET",
      pathTemplate: "/api/x/callback",
      description: "Completes the X OAuth callback flow.",
      warning: "This route expects provider-issued query parameters.",
      disabledReason:
        "Disabled here because the callback only works with real OAuth code/state values from X.",
      defaultsKey: "x-callback",
      fields: [],
      buildRequest: () =>
        buildJsonRequest({
          method: "GET",
          pathTemplate: "/api/x/callback",
        }),
    },
  ];
}
