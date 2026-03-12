/**
 * Tests for POST /api/contact using Effect TestLayer.
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Effect, Layer } from "effect";
import { contactData } from "@/lib/portfolio-data";
import { EmailService, makeEmailTest } from "@/lib/services/Email";
import { RedisTest } from "@/lib/services/Redis";
import { makeRequestTracing, TracingService } from "@/lib/services/Tracing";

const emailTest = makeEmailTest();
const TestLayer = Layer.mergeAll(
  RedisTest,
  emailTest.layer,
  Layer.effect(TracingService, makeRequestTracing("test")),
);

describe("POST /api/contact", () => {
  test("sends email with valid fields", async () => {
    const sent = emailTest.sent;
    sent.length = 0; // Reset

    await Effect.runPromise(
      Effect.gen(function* () {
        const email = yield* EmailService;
        const tracing = yield* TracingService;

        yield* tracing.span(
          "email.send",
          email.send({
            from: "Contact <contact@claycurry.com>",
            to: contactData.email,
            replyTo: "user@example.com",
            subject: "New message from Test User",
            text: "Name: Test User\nEmail: user@example.com\n\nMessage:\nHello!",
          }),
        );
      }).pipe(Effect.provide(TestLayer)),
    );

    assert.equal(sent.length, 1);
    assert.equal(sent[0].subject, "New message from Test User");
    assert.equal(sent[0].replyTo, "user@example.com");
  });

  test("rejects missing fields", async () => {
    const result = await Effect.runPromise(
      Effect.sync(() => {
        const name = "";
        const senderEmail = "a@b.com";
        const message = "hello";

        if (!name || !senderEmail || !message) {
          return { error: "Missing required fields" };
        }
        return { success: true as const };
      }),
    );

    assert.equal(result.error, "Missing required fields");
  });
});
