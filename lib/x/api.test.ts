import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  buildBookmarksUrl,
  fetchBookmarks,
  getBookmarksDebugConfig,
} from "./api";

describe("buildBookmarksUrl", () => {
  test("returns base URL with no params", () => {
    expect(buildBookmarksUrl()).toBe("/api/x/bookmarks");
    expect(buildBookmarksUrl({})).toBe("/api/x/bookmarks");
  });

  test("appends folder param", () => {
    expect(buildBookmarksUrl({ folderId: "abc" })).toBe(
      "/api/x/bookmarks?folder=abc",
    );
  });

  test("appends source=live when source is live", () => {
    expect(buildBookmarksUrl({ source: "live" })).toBe(
      "/api/x/bookmarks?source=live",
    );
  });

  test("appends mock param when source is not live", () => {
    expect(buildBookmarksUrl({ mockMode: "empty" })).toBe(
      "/api/x/bookmarks?mock=empty",
    );
  });

  test("source=live takes precedence over mockMode", () => {
    const url = buildBookmarksUrl({ source: "live", mockMode: "empty" });
    expect(url).toBe("/api/x/bookmarks?source=live");
    expect(url).not.toContain("mock=");
  });

  test("combines folderId with source", () => {
    const url = buildBookmarksUrl({ folderId: "f1", source: "live" });
    expect(url).toContain("folder=f1");
    expect(url).toContain("source=live");
  });
});

const validResponse = {
  bookmarks: [],
  folders: [],
  owner: { id: "1", username: "test", name: "Test" },
  status: "fresh",
  isStale: false,
  lastSyncedAt: null,
  cachedAt: "2026-01-01T00:00:00Z",
};

describe("fetchBookmarks", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(validResponse),
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("decodes a valid response", async () => {
    const result = await fetchBookmarks();
    expect(result.status).toBe("fresh");
    expect(result.bookmarks).toEqual([]);
    expect(result.owner.username).toBe("test");
  });

  test("throws on invalid response shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ bad: "data" }),
      }),
    );
    await expect(fetchBookmarks()).rejects.toThrow();
  });

  test("passes params to URL", async () => {
    await fetchBookmarks({ folderId: "abc", source: "live" });
    expect(fetch).toHaveBeenCalledWith(
      "/api/x/bookmarks?folder=abc&source=live",
    );
  });

  test("propagates network errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Network error")),
    );
    await expect(fetchBookmarks()).rejects.toThrow("Network error");
  });
});

describe("getBookmarksDebugConfig", () => {
  test("returns nulls in SSR (no window)", () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error -- simulating SSR
    delete globalThis.window;
    try {
      const config = getBookmarksDebugConfig();
      expect(config).toEqual({ mockMode: null, source: null });
    } finally {
      globalThis.window = originalWindow;
    }
  });

  test("reads mock and source from URL params", () => {
    vi.stubGlobal("window", {
      location: { search: "?mock=empty&bookmarksSource=live" },
    });
    try {
      const config = getBookmarksDebugConfig();
      expect(config.mockMode).toBe("empty");
      expect(config.source).toBe("live");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
