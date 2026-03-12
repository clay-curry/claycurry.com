/**
 * Tests for the route handler bridge utilities.
 *
 * Tests error-to-status mapping, response helpers, and tracing in isolation.
 * The full runRouteHandler() is integration-tested via the individual
 * route tests (clicks, views, contact, etc.) which exercise the
 * Effect pipeline end-to-end.
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Effect, Layer } from "effect";
import {
  errorToStatus,
  jsonError,
  jsonSuccess,
} from "@/app/api/_shared/response";
import type { AppError } from "@/lib/effect/errors";
import {
  AuthError,
  EmailError,
  RedisError,
  UpstreamError,
  ValidationError,
} from "@/lib/effect/errors";
import { makeRequestTracing, TracingService } from "@/lib/services/Tracing";

describe("errorToStatus", () => {
  test("maps ValidationError to 400", () => {
    assert.equal(errorToStatus("ValidationError"), 400);
  });

  test("maps AuthError to 401", () => {
    assert.equal(errorToStatus("AuthError"), 401);
  });

  test("maps RedisError to 500", () => {
    assert.equal(errorToStatus("RedisError"), 500);
  });

  test("maps EmailError to 502", () => {
    assert.equal(errorToStatus("EmailError"), 502);
  });

  test("maps UpstreamError to 502", () => {
    assert.equal(errorToStatus("UpstreamError"), 502);
  });

  test("maps unknown tags to 500", () => {
    assert.equal(errorToStatus("SomethingElse"), 500);
  });
});

describe("jsonError", () => {
  test("returns correct status and error message", async () => {
    const response = jsonError("bad request", 400);
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error, "bad request");
  });

  test("includes __trace when provided", async () => {
    const trace = {
      traceId: "test-123",
      spans: [{ name: "op", startMs: 0, durationMs: 1, status: "ok" as const }],
      totalMs: 1,
    };
    const response = jsonError("fail", 500, trace);
    const body = await response.json();
    assert.equal(body.error, "fail");
    assert.ok(body.__trace);
    assert.equal(body.__trace.traceId, "test-123");
  });
});

describe("jsonSuccess", () => {
  test("returns data without trace by default", async () => {
    const response = jsonSuccess({ count: 42 });
    const body = await response.json();
    assert.equal(body.count, 42);
    assert.equal(body.__trace, undefined);
  });

  test("includes __trace when provided", async () => {
    const trace = {
      traceId: "abc",
      spans: [],
      totalMs: 0,
    };
    const response = jsonSuccess({ ok: true }, { trace });
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.ok(body.__trace);
    assert.equal(body.__trace.traceId, "abc");
  });
});

describe("TracingService span recording", () => {
  test("records span timing and status for success", async () => {
    const trace = await Effect.runPromise(
      Effect.gen(function* () {
        const tracing = yield* TracingService;
        yield* tracing.span("fast-op", Effect.succeed("done"));
        return yield* tracing.getTrace();
      }).pipe(
        Effect.provide(
          Layer.effect(TracingService, makeRequestTracing("test-span-id")),
        ),
      ),
    );

    assert.equal(trace.traceId, "test-span-id");
    assert.equal(trace.spans.length, 1);
    assert.equal(trace.spans[0].name, "fast-op");
    assert.equal(trace.spans[0].status, "ok");
    assert.ok(trace.spans[0].durationMs >= 0);
  });

  test("records error spans without swallowing the error", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const tracing = yield* TracingService;

        const outcome = yield* Effect.either(
          tracing.span("fail-op", Effect.fail("boom")),
        );

        const trace = yield* tracing.getTrace();
        return { outcome, trace };
      }).pipe(
        Effect.provide(
          Layer.effect(TracingService, makeRequestTracing("err-trace")),
        ),
      ),
    );

    assert.equal(result.outcome._tag, "Left");
    assert.equal(result.trace.spans.length, 1);
    assert.equal(result.trace.spans[0].name, "fail-op");
    assert.equal(result.trace.spans[0].status, "error");
  });
});

describe("AppError tagged errors", () => {
  test("each error type has the correct _tag", () => {
    const errors: AppError[] = [
      new ValidationError({ message: "v" }),
      new RedisError({ message: "r" }),
      new EmailError({ message: "e" }),
      new UpstreamError({ message: "u" }),
      new AuthError({ message: "a" }),
    ];

    const expectedTags = [
      "ValidationError",
      "RedisError",
      "EmailError",
      "UpstreamError",
      "AuthError",
    ];

    for (let i = 0; i < errors.length; i++) {
      assert.equal(errors[i]._tag, expectedTags[i]);
    }
  });

  test("errors carry message and optional cause", () => {
    const cause = new Error("original");
    const error = new UpstreamError({ message: "wrapped", cause });
    assert.equal(error.message, "wrapped");
    assert.equal(error.cause, cause);
  });
});
