import { describe, expect, test } from "vitest";
import {
  getTrackingSearch,
  isTrackingHrefEligible,
  mergeTrackingQueryIntoHref,
} from "./tracking-query";

const SITE_ORIGIN = "https://claycurry.com";

describe("getTrackingSearch", () => {
  test("keeps allowlisted tracking and debug params only", () => {
    expect(
      getTrackingSearch(
        "?debug=1&mock=timeout&ref=x&utm_source=github&foo=bar",
      ),
    ).toBe("?utm_source=github&ref=x&debug=1&mock=timeout");
  });
});

describe("mergeTrackingQueryIntoHref", () => {
  test("preserves tracking and debug params on internal routes", () => {
    expect(
      mergeTrackingQueryIntoHref(
        "/work",
        "?debug=1&mock=timeout&ref=x",
        SITE_ORIGIN,
      ),
    ).toBe("/work?ref=x&debug=1&mock=timeout");
  });

  test("appends preserved params without dropping existing query or hash", () => {
    expect(
      mergeTrackingQueryIntoHref(
        "/writing?foo=1#top",
        "?debug=1&mock=timeout&ref=x",
        SITE_ORIGIN,
      ),
    ).toBe("/writing?foo=1&ref=x&debug=1&mock=timeout#top");
  });

  test("does not overwrite debug params already present on the destination", () => {
    expect(
      mergeTrackingQueryIntoHref(
        "/work?debug=0&mock=local",
        "?debug=1&mock=timeout&ref=x",
        SITE_ORIGIN,
      ),
    ).toBe("/work?debug=0&mock=local&ref=x");
  });

  test("does not preserve params for external, asset, or hash-only hrefs", () => {
    const currentSearch = "?debug=1&mock=timeout&ref=x";

    expect(
      isTrackingHrefEligible("https://example.com/work", SITE_ORIGIN),
    ).toBe(false);
    expect(isTrackingHrefEligible("/og-image.png", SITE_ORIGIN)).toBe(false);
    expect(isTrackingHrefEligible("#top", SITE_ORIGIN)).toBe(false);

    expect(
      mergeTrackingQueryIntoHref(
        "https://example.com/work",
        currentSearch,
        SITE_ORIGIN,
      ),
    ).toBe("https://example.com/work");
    expect(
      mergeTrackingQueryIntoHref("/og-image.png", currentSearch, SITE_ORIGIN),
    ).toBe("/og-image.png");
    expect(mergeTrackingQueryIntoHref("#top", currentSearch, SITE_ORIGIN)).toBe(
      "#top",
    );
  });
});
