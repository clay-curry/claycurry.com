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
  skipTrailingSlashRedirect: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
      },
      {
        source: '/sitemap.xml',
        destination: 'https://claycurry.com/sitemap.xml',
      },
      {
        source: '/robots.txt',
        destination: 'https://claycurry.com/robots.txt',
      },
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
