import createMDX from "@next/mdx";
import rehypePrettyCode from "rehype-pretty-code";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeMdxToc from "rehype-mdx-toc";
import type { PluggableList } from "unified";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

export const mdxOptions = {
  remarkPlugins: [remarkFrontmatter, remarkGfm, remarkMdxFrontmatter],
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
    rehypeMdxToc
  ] as PluggableList,
};

const withMDX = createMDX({ options: mdxOptions });

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
