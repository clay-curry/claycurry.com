/**
 * Tests for EmailService Effect layer.
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Effect } from "effect";
import { EmailService, makeEmailTest } from "@/lib/services/Email";

describe("EmailService", () => {
  test("makeEmailTest records sent emails", async () => {
    const { layer, sent } = makeEmailTest();

    await Effect.runPromise(
      Effect.gen(function* () {
        const email = yield* EmailService;
        yield* email.send({
          from: "test@example.com",
          to: "recipient@example.com",
          subject: "Test Subject",
          text: "Test body",
        });
        yield* email.send({
          from: "test@example.com",
          to: "other@example.com",
          subject: "Second Email",
          text: "Another body",
        });
      }).pipe(Effect.provide(layer)),
    );

    assert.equal(sent.length, 2);
    assert.equal(sent[0].subject, "Test Subject");
    assert.equal(sent[0].to, "recipient@example.com");
    assert.equal(sent[1].subject, "Second Email");
  });

  test("makeEmailTest send does not throw", async () => {
    const { layer } = makeEmailTest();

    await assert.doesNotReject(
      Effect.runPromise(
        Effect.gen(function* () {
          const email = yield* EmailService;
          yield* email.send({
            from: "a@b.com",
            to: "c@d.com",
            subject: "Test",
            text: "Body",
          });
        }).pipe(Effect.provide(layer)),
      ),
    );
  });
});
