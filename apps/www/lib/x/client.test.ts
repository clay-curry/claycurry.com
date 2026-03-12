import { expect, test } from "vitest";
import { XBookmarksOwnerResolver, XIdentityVerifier } from "./client";
import { OwnerMismatch } from "./errors";
import { StubIdentityClient } from "./test-utils";

test("XIdentityVerifier rejects tokens for any account other than claycurry__", async () => {
  const verifier = new XIdentityVerifier(
    new StubIdentityClient("somebody_else"),
    "claycurry__",
  );

  await expect(verifier.verify("access-token")).rejects.toThrow(OwnerMismatch);
});

test("XBookmarksOwnerResolver rejects configured user id mismatches", async () => {
  const resolver = new XBookmarksOwnerResolver(
    new StubIdentityClient("claycurry__", "actual-owner-id"),
    "claycurry__",
    "expected-owner-id",
  );

  await expect(resolver.resolve("access-token")).rejects.toThrow(OwnerMismatch);
});
