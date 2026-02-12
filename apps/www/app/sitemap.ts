/**
 * Generates the sitemap.xml file for the site.
 *
 * A sitemap helps search engines discover and index all pages on the site.
 * This includes static pages (home, blog index) and dynamic blog post URLs.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 * @see https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
 */
import type { MetadataRoute } from "next";
import { getAllPostsMetadata } from "@/app/(portfolio)/blog/loader";
import { toSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPostsMetadata();

  const blogPostUrls = posts.map((post) => ({
    url: toSiteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.publishedDate).toISOString(),
    changeFrequency: "hourly" as const,
  }));

  return [
    {
      changeFrequency: "hourly",
      lastModified: new Date().toISOString(),
      url: toSiteUrl("/"),
    },
    {
      changeFrequency: "hourly",
      lastModified: new Date().toISOString(),
      url: toSiteUrl("/blog"),
    },
    ...blogPostUrls,
  ];
}
