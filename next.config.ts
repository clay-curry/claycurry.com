import createMDX from "@next/mdx";
import remarkFrontmatter from "remark-frontmatter";

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

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkFrontmatter],
  },
});

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
