import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
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
  ];
}
