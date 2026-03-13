import { describe, expect, test } from "vitest";
import {
  buildChatRequest,
  buildDebugUrl,
  buildJsonRequest,
  replacePathParams,
  splitListValue,
} from "./request-builders";

describe("replacePathParams", () => {
  test("injects encoded path params into the route template", () => {
    expect(
      replacePathParams("/api/trace/{id}", {
        id: "trace/123",
      }),
    ).toBe("/api/trace/trace%2F123");
  });
});

describe("buildDebugUrl", () => {
  test("drops empty query values", () => {
    expect(
      buildDebugUrl(
        "/api/x/bookmarks",
        {
          folder: "abc",
          mock: "",
        },
        {},
      ),
    ).toBe("/api/x/bookmarks?folder=abc");
  });
});

describe("buildJsonRequest", () => {
  test("serializes JSON bodies and preserves custom headers", () => {
    const request = buildJsonRequest({
      method: "POST",
      pathTemplate: "/api/views",
      headers: {
        "x-test": "1",
      },
      body: {
        slug: "/debug",
      },
    });

    expect(request.url).toBe("/api/views");
    expect(request.init).toMatchObject({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-test": "1",
      },
      body: JSON.stringify({ slug: "/debug" }),
    });
  });
});

describe("buildChatRequest", () => {
  test("uses the UI message payload expected by the chat route", () => {
    const request = buildChatRequest({
      prompt: "hello world",
      model: "openai/gpt-4o",
      webSearch: true,
      slug: "debug-post",
    });

    expect(request.url).toBe("/api/chat");
    expect(request.bodyPreview).toEqual({
      messages: [
        {
          id: "debug-panel-message",
          role: "user",
          parts: [{ type: "text", text: "hello world" }],
        },
      ],
      model: "openai/gpt-4o",
      webSearch: true,
      slug: "debug-post",
    });
  });
});

describe("splitListValue", () => {
  test("supports commas and new lines", () => {
    expect(splitListValue("one,\ntwo\nthree")).toEqual(["one", "two", "three"]);
  });
});
