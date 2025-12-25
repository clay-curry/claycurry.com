import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  async redirects() {
    return [
      // Basic redirect
      {
        source: '/about-me',
        destination: '/',
        permanent: true,
      },
      // Wildcard path matching
      {
        source: '/blogg/:slug',
        destination: '/news/:slug',
        permanent: true,
      },
    ]
  },
  // Optionally, add any other Next.js config below
};

// Merge MDX config with Next.js config
export default createMDX()(nextConfig);
