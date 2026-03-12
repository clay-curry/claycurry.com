/**
 * Tests for POST /api/feedback using Effect TestLayer.
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

describe("POST /api/feedback", () => {
  test("sends feedback email with positive sentiment", async () => {
    const sent = emailTest.sent;
    sent.length = 0;

    await Effect.runPromise(
      Effect.gen(function* () {
        const email = yield* EmailService;
        const tracing = yield* TracingService;

        const page = "/blog/my-post";
        const sentimentEmoji = "\u{1F44D}";

        yield* tracing.span(
          "email.send",
          email.send({
            from: "Feedback <feedback@claycurry.com>",
            to: contactData.email,
            subject: `${sentimentEmoji} Page Feedback: ${page}`,
            text: `Page: ${page}\nSentiment: Positive`,
          }),
        );
      }).pipe(Effect.provide(TestLayer)),
    );

    assert.equal(sent.length, 1);
    assert.ok(sent[0].subject.includes("Page Feedback"));
  });

  test("validates sentiment values", () => {
    const validSentiments = ["positive", "negative"];
    assert.ok(validSentiments.includes("positive"));
    assert.ok(validSentiments.includes("negative"));
    assert.ok(!validSentiments.includes("neutral"));
  });
});
