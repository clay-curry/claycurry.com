/**
 * Tests for TracingService — span recording and trace log assembly.
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Effect } from "effect";
import { makeRequestTracing, TracingService } from "@/lib/services/Tracing";

const runWithTracing = <A>(
  effect: Effect.Effect<A, never, TracingService>,
  traceId = "test-trace",
) =>
  Effect.runPromise(
    Effect.gen(function* () {
      const svc = yield* makeRequestTracing(traceId);
      return yield* Effect.provideService(effect, TracingService, svc);
    }),
  );

describe("TracingService", () => {
  test("records a successful span", async () => {
    const result = await runWithTracing(
      Effect.gen(function* () {
        const tracing = yield* TracingService;
        yield* tracing.span("my-op", Effect.succeed(42));
        return yield* tracing.getTrace();
      }),
    );

    assert.equal(result.traceId, "test-trace");
    assert.equal(result.spans.length, 1);
    assert.equal(result.spans[0].name, "my-op");
    assert.equal(result.spans[0].status, "ok");
    assert.ok(result.totalMs >= 0);
  });

  test("records an error span and re-raises the error", async () => {
    const result = await runWithTracing(
      Effect.gen(function* () {
        const tracing = yield* TracingService;
        const outcome = yield* Effect.either(
          tracing.span("fail-op", Effect.fail("boom")),
        );
        const trace = yield* tracing.getTrace();
        return { outcome, trace };
      }),
    );

    assert.equal(result.outcome._tag, "Left");
    assert.equal(result.trace.spans.length, 1);
    assert.equal(result.trace.spans[0].name, "fail-op");
    assert.equal(result.trace.spans[0].status, "error");
    assert.equal(result.trace.spans[0].error, "boom");
  });

  test("records multiple spans in order", async () => {
    const result = await runWithTracing(
      Effect.gen(function* () {
        const tracing = yield* TracingService;
        yield* tracing.span("step-1", Effect.succeed("a"));
        yield* tracing.span("step-2", Effect.succeed("b"));
        yield* tracing.span("step-3", Effect.succeed("c"));
        return yield* tracing.getTrace();
      }),
    );

    assert.equal(result.spans.length, 3);
    assert.deepEqual(
      result.spans.map((s) => s.name),
      ["step-1", "step-2", "step-3"],
    );
  });

  test("uses the provided trace ID", async () => {
    const result = await runWithTracing(
      Effect.gen(function* () {
        const tracing = yield* TracingService;
        return yield* tracing.getTrace();
      }),
      "custom-id-123",
    );

    assert.equal(result.traceId, "custom-id-123");
  });
});
