import { Cause, Effect, Exit } from "effect";
import { expect, test } from "vitest";
import { XBookmarksOwnerResolver, XIdentityVerifier } from "./client";
import { OwnerMismatch } from "./errors";
import { StubIdentityClient } from "./test-utils";

test("XIdentityVerifier rejects tokens for any account other than claycurry__", async () => {
  const verifier = new XIdentityVerifier(
    new StubIdentityClient("somebody_else"),
    "claycurry__",
  );

  const exit = await Effect.runPromiseExit(verifier.verify("access-token"));
  expect(Exit.isFailure(exit)).toBe(true);
  if (Exit.isFailure(exit)) {
    const error = Cause.failureOption(exit.cause).pipe((opt) =>
      opt._tag === "Some" ? opt.value : null,
    );
    expect(error).toBeInstanceOf(OwnerMismatch);
  }
});

test("XBookmarksOwnerResolver rejects configured user id mismatches", async () => {
  const resolver = new XBookmarksOwnerResolver(
    new StubIdentityClient("claycurry__", "actual-owner-id"),
    "claycurry__",
    "expected-owner-id",
  );

  const exit = await Effect.runPromiseExit(resolver.resolve("access-token"));
  expect(Exit.isFailure(exit)).toBe(true);
  if (Exit.isFailure(exit)) {
    const error = Cause.failureOption(exit.cause).pipe((opt) =>
      opt._tag === "Some" ? opt.value : null,
    );
    expect(error).toBeInstanceOf(OwnerMismatch);
  }
});
