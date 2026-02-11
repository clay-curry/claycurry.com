import createMDX from "@next/mdx";
import rehypeKatex from "rehype-katex";
import rehypeMdxToc from "rehype-mdx-toc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

/**
 * Rehype plugin that moves the title from rehype-pretty-code's
 * <div data-rehype-pretty-code-title> onto the sibling <pre> element,
 * then removes the title div. This lets the title flow through
 * mdx-components.tsx into CodeBlock as a prop.
 */
function rehypeCodeTitle() {
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return;
      for (const child of node.children) {
        if (
          child.type === "element" &&
          child.tagName === "figure" &&
          "data-rehype-pretty-code-figure" in (child.properties || {})
        ) {
          let titleText;
          let titleIndex = -1;
          let preNode;

          for (let i = 0; i < child.children.length; i++) {
            const c = child.children[i];
            if (c.type !== "element") continue;
            if ("data-rehype-pretty-code-title" in (c.properties || {})) {
              titleText = c.children?.[0]?.value;
              titleIndex = i;
            }
            if (c.tagName === "pre") {
              preNode = c;
            }
          }

          if (titleText && preNode) {
            preNode.properties = preNode.properties || {};
            preNode.properties.title = titleText;
          }
          if (titleIndex !== -1) {
            child.children.splice(titleIndex, 1);
          }
        }
        walk(child);
      }
    };
    walk(tree);
  };
}

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"], // support MDX files
  trailingSlash: false, // disable automatic trailing slashes (useful for capturing origin in short links)
  skipTrailingSlashRedirect: true, // avoid redirecting to trailing slash version

  // deduplicate jotai to a single instance in the monorepo
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      jotai: require.resolve("jotai"),
    };
    return config;
  },

  // intent: short links capture the origin of traffic coming to the main page
  // - monitor for anomalies or trends
  redirects: async () => {
    return [
      { source: "/x", destination: "/?ref=x", permanent: false },
      { source: "/l", destination: "/?ref=linkedin", permanent: false },
      { source: "/g", destination: "/?ref=github", permanent: false },
      { source: "/m", destination: "/?ref=me", permanent: false },
      { source: "/r", destination: "/?ref=resume", permanent: false },
      { source: "/rd", destination: "/?ref=readme", permanent: false },
    ];
  },
  rewrites: async () => {
    return [
      {
        source: "/writing",
        destination: "/blog",
      },
    ];
  },
};

export const mdxOptions = {
  remarkPlugins: [
    remarkFrontmatter,
    remarkGfm,
    remarkMath,
    remarkMdxFrontmatter,
  ],
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
    rehypeCodeTitle, // move title from <div> onto <pre> for CodeBlock
    rehypeKatex, // math typesetting
    rehypeMdxToc, // table of contents generation
  ],
};

const withMDX = createMDX({ options: mdxOptions }); // curry the config

export default withMDX(nextConfig);
