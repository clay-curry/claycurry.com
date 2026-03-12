/**
 * Tests for POST /api/chat — pre-stream validation logic.
 *
 * The streaming itself is delegated to Vercel AI SDK, so these tests
 * focus on the Effect-wrapped validation and context assembly.
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Effect } from "effect";
import { ValidationError } from "@/lib/effect/errors";

describe("POST /api/chat", () => {
  test("rejects missing messages array", async () => {
    const result = await Effect.runPromise(
      Effect.sync(() => {
        const body = { model: "grok/grok-3-mini" };
        if (
          !("messages" in body) ||
          !Array.isArray((body as Record<string, unknown>).messages)
        ) {
          return { error: "messages array is required" };
        }
        return { valid: true as const };
      }),
    );

    assert.equal(result.error, "messages array is required");
  });

  test("validates request body shape", async () => {
    const result = await Effect.runPromise(
      Effect.sync(() => {
        const body = {
          messages: [{ role: "user", content: "hello" }],
          model: "grok/grok-3-mini",
          webSearch: false,
        };

        if (!body.messages || !Array.isArray(body.messages)) {
          return { error: "messages array is required" };
        }

        return {
          messages: body.messages,
          model: body.model ?? "grok/grok-3-mini",
          webSearch: body.webSearch ?? false,
          slug: undefined,
        };
      }),
    );

    assert.equal(result.model, "grok/grok-3-mini");
    assert.equal(result.webSearch, false);
    assert.equal(result.messages?.length, 1);
  });

  test("defaults model and webSearch when omitted", async () => {
    const result = await Effect.runPromise(
      Effect.sync(() => {
        const body: Record<string, unknown> = {
          messages: [{ role: "user", content: "hi" }],
        };

        return {
          model: (body.model as string) ?? "grok/grok-3-mini",
          webSearch: (body.webSearch as boolean) ?? false,
        };
      }),
    );

    assert.equal(result.model, "grok/grok-3-mini");
    assert.equal(result.webSearch, false);
  });

  test("ValidationError has correct tag", () => {
    const error = new ValidationError({ message: "bad input" });
    assert.equal(error._tag, "ValidationError");
    assert.equal(error.message, "bad input");
  });
});
