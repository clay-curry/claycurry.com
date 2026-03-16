/**
 * Generates the robots.txt file for the site.
 *
 * robots.txt tells search engine crawlers which URLs they can access on the site.
 * This file allows all user agents to crawl all pages and points them to the sitemap.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 * @see https://developers.google.com/search/docs/crawling-indexing/robots/intro
 */
import type { MetadataRoute } from "next";

function toSiteUrl(path: string): string {
  return new URL(path, "https://www.claycurry.studio").toString();
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: toSiteUrl("/sitemap.xml"),
  };
}
