import type { MetadataRoute } from "next";
import { getAllPostsMetadata } from "@/app/(site)/blog/loader";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPostsMetadata();
  
  const blogPostUrls = posts.map((post) => ({
    url: `https://claycurry.com/blog/${post.slug}`,
    lastModified: new Date(post.date).toISOString(),
    changeFrequency: "monthly" as const,
  }));

  return [
    {
      changeFrequency: "hourly",
      lastModified: new Date().toISOString(),
      url: "https://claycurry.com",
    },
    {
      changeFrequency: "hourly",
      lastModified: new Date().toISOString(),
      url: "https://claycurry.com/blog",
    },
    ...blogPostUrls,
  ];
}
