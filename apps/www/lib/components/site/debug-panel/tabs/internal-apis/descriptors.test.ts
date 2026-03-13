import { describe, expect, test } from "vitest";
import { BOOKMARKS_LIVE_SOURCE } from "@/lib/x/debug";
import { getInternalApiDescriptors } from "./descriptors";

describe("getInternalApiDescriptors", () => {
  test("bookmarks requests omit mock overrides when live source is selected", () => {
    const descriptor = getInternalApiDescriptors(
      "",
      BOOKMARKS_LIVE_SOURCE,
    ).find(({ id }) => id === "bookmarks");

    expect(descriptor).toBeDefined();

    const request = descriptor?.buildRequest({
      folder: "folder-1",
      source: BOOKMARKS_LIVE_SOURCE,
      mock: "static",
    });

    expect(request?.url).toBe("/api/x/bookmarks?folder=folder-1&source=live");
  });
});
