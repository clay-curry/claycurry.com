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
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"], // support MDX files
  trailingSlash: false, // disable automatic trailing slashes (useful for capturing origin in short links)
  skipTrailingSlashRedirect: true, // avoid redirecting to trailing slash version

  // intent: short links capture the origin of traffic coming to the main page
  // - monitor for anomalies or trends
  redirects: async () => {
    return [
      { source: '/x', destination: '/?ref=x', permanent: false },
      { source: '/l', destination: '/?ref=linkedin', permanent: false },
      { source: '/g', destination: '/?ref=github', permanent: false },
      { source: '/m', destination: '/?ref=me', permanent: false },
      { source: '/r', destination: '/?ref=resume', permanent: false },
      { source: '/rd', destination: '/?ref=readme', permanent: false },
    ]
  },
  rewrites: async () => {
    return [
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
      rehypePrettyCode, // code syntax highlighting
      {
        theme: "github-dark",
        keepBackground: true,
        defaultLang: "plaintext",
        grid: true,
      }, // rehypePrettyCode options
    ],
    rehypeKatex, // math typesetting
    rehypeMdxToc // table of contents generation
  ],
};

const withMDX = createMDX({ options: mdxOptions }); // curry the config

export default withMDX(nextConfig);
