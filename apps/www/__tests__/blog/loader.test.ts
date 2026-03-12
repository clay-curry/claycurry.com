/**
 * Tests for the blog loader module.
 *
 * Plain TypeScript tests (no Effect) for getAllPostsMetadata,
 * getPostMetadata, and getPostContent.
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  getAllPostsMetadata,
  getPostContent,
  getPostMetadata,
} from "@/app/(portfolio)/blog/loader";

describe("blog loader", () => {
  test("getAllPostsMetadata returns a non-empty sorted array", () => {
    const posts = getAllPostsMetadata();
    assert.ok(Array.isArray(posts));
    assert.ok(posts.length > 0, "should have at least one post");

    // Verify sorted by publishedDate descending
    for (let i = 1; i < posts.length; i++) {
      const prev = new Date(posts[i - 1].publishedDate).getTime();
      const curr = new Date(posts[i].publishedDate).getTime();
      assert.ok(prev >= curr, `posts should be sorted descending by date`);
    }
  });

  test("getAllPostsMetadata entries have required fields", () => {
    const posts = getAllPostsMetadata();
    for (const post of posts) {
      assert.ok(post.slug, "slug is required");
      assert.ok(post.title, "title is required");
      assert.ok(post.publishedDate, "publishedDate is required");
      assert.ok(Array.isArray(post.tags), "tags should be an array");
    }
  });

  test("getPostMetadata returns metadata for a known slug", () => {
    const posts = getAllPostsMetadata();
    const knownSlug = posts[0].slug;
    const metadata = getPostMetadata(knownSlug);
    assert.equal(metadata.slug, knownSlug);
    assert.ok(metadata.title);
  });

  test("getPostContent returns content for a valid slug", () => {
    const posts = getAllPostsMetadata();
    const knownSlug = posts[0].slug;
    const result = getPostContent(knownSlug);
    assert.ok(result !== null, "should return content for a valid slug");
    assert.ok(result.metadata.slug === knownSlug);
    assert.ok(result.content.length > 0, "content should not be empty");
  });

  test("getPostContent returns null for an invalid slug", () => {
    const result = getPostContent("nonexistent-post-slug-12345");
    assert.equal(result, null);
  });
});
