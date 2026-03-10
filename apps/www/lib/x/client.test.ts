import assert from "node:assert/strict";
import test from "node:test";
import {
  XBookmarksClient,
  XBookmarksOwnerResolver,
  XIdentityVerifier,
} from "./client";
import type { BookmarkSourceOwner } from "./contracts";
import { XIntegrationError } from "./errors";

class StubClient extends XBookmarksClient {
  constructor(
    private readonly authenticatedUsername: string,
    private readonly resolvedOwnerId = "owner-1",
  ) {
    super(async () => new Response(null, { status: 200 }));
  }

  async getAuthenticatedUser(
    _accessToken: string,
  ): Promise<BookmarkSourceOwner> {
    return {
      id: "auth-1",
      username: this.authenticatedUsername,
      name: "Authenticated User",
    };
  }

  async getUserByUsername(
    username: string,
    _accessToken: string,
  ): Promise<BookmarkSourceOwner> {
    return {
      id: this.resolvedOwnerId,
      username,
      name: "Resolved User",
    };
  }
}

test("XIdentityVerifier rejects tokens for any account other than clay__curry", async () => {
  const verifier = new XIdentityVerifier(
    new StubClient("somebody_else"),
    "clay__curry",
  );

  await assert.rejects(
    () => verifier.verify("access-token"),
    (error: unknown) =>
      error instanceof XIntegrationError && error.code === "owner_mismatch",
  );
});

test("XBookmarksOwnerResolver rejects configured user id mismatches", async () => {
  const resolver = new XBookmarksOwnerResolver(
    new StubClient("clay__curry", "actual-owner-id"),
    "clay__curry",
    "expected-owner-id",
  );

  await assert.rejects(
    () => resolver.resolve("access-token"),
    (error: unknown) =>
      error instanceof XIntegrationError && error.code === "owner_mismatch",
  );
});
