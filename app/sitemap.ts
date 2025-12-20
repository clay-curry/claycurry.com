import type { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://claycurry.com',
      lastModified: new Date().toISOString(),
      changeFrequency: 'hourly',
    },
    {
        url: 'https://claycurry.com/blog',
        lastModified: new Date().toISOString(),
        changeFrequency: 'hourly',
    },
  ]
}