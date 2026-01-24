import createMDX from "@next/mdx";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeKatex from "rehype-katex";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeMdxToc from "rehype-mdx-toc";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  redirects: async () => {
    return [
      { source: '/x', destination: '/?ref=x', permanent: false },
      { source: '/l', destination: '/?ref=linkedin', permanent: false },
      { source: '/g', destination: '/?ref=github', permanent: false },
      { source: '/m', destination: '/?ref=me', permanent: false },
      { source: '/about', destination: '/', permanent: false },
    ]
  },
  rewrites: async () => {
    return [
      {
        source: '/',
        destination: '/about',
      },
      {
        source: '/writing',
        destination: '/blog'
      }
    ]
  }
}

export const mdxOptions = {
  remarkPlugins: [remarkFrontmatter, remarkGfm, remarkMath, remarkMdxFrontmatter],
  rehypePlugins: [
    [
      rehypePrettyCode,
      {
        theme: "github-dark",
        keepBackground: true,
        defaultLang: "plaintext",
        grid: true,
      },
    ],
    rehypeKatex,
    rehypeMdxToc
  ],
};

const withMDX = createMDX({ options: mdxOptions });

export default withMDX(nextConfig);
