import type { MDXComponents } from "mdx/types";
import Image, { type ImageProps } from "next/image";
import type { ReactNode } from "react";
import Summary from "@/lib/ui/components/summary";
import UnderConstruction from "@/lib/ui/components/under-construction";
import { slugify } from "@/lib/utils";

// This file declares custom React components for transforming MDX components when compiling to JSX. You can
// import and use any React component you want, including inline styles, components from other
// libraries, and more.

const components = {
  // Allows customizing built-in components, e.g. to add styling.
  h1: ({ children }) => {
    const id = slugify(children);
    return (
      <h1
        id={id}
        className="text-3xl md:text-4xl font-extrabold mt-16 mb-4 text-link transition-all duration-300 hover:text-link-hover sm:text-foreground"
      >
        <a href={`#${id}`} className="no-underline hover:underline">
          {children}
        </a>
      </h1>
    );
  },
  h2: ({ children, id: existingId, ...props }) => {
    const id = existingId || slugify(children);
    return (
      <h2
        id={id}
        className="text-2xl md:text-3xl font-bold mt-9 md:mt-12 mb-4 text-foreground"
        {...props}
      >
        <a href={`#${id}`} className="no-underline hover:underline">
          {children}
        </a>
      </h2>
    );
  },
  h3: ({ children }) => {
    const id = slugify(children);
    return (
      <h3
        id={id}
        className="text-xl md:text-2xl font-semibold mt-6 mb-3 text-foreground"
      >
        <a href={`#${id}`} className="no-underline hover:underline">
          {children}
        </a>
      </h3>
    );
  },
  p: ({ children }) => (
    <p className="my-4 leading-7 text-muted-foreground">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="my-4 ml-6 list-disc space-y-2 text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 ml-6 list-decimal space-y-2 text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-link pl-4 text-muted-foreground">
      {children}
    </blockquote>
  ),
  // Inline code (not inside pre)
  code: ({ children, ...props }) => {
    // rehype-pretty-code adds data-theme to code blocks inside pre
    if ("data-theme" in props) {
      return (
        <code {...props} className="text-sm font-mono">
          {children}
        </code>
      );
    }
    // Inline code styling
    return (
      <code className="px-1.5 py-0.5 rounded bg-code-bg text-sm font-mono text-code-foreground">
        {children}
      </code>
    );
  },
  // Code block container
  pre: ({ children, ...props }) => (
    <pre
      {...props}
      className="my-6 overflow-x-auto rounded-lg p-4 text-sm [&>code]:grid [&>code]:gap-0 [counter-reset:line] [&_[data-line]]:border-l-2 [&_[data-line]]:border-transparent [&_[data-line]]:pl-2 [&_[data-line]]:before:mr-4 [&_[data-line]]:before:inline-block [&_[data-line]]:before:w-4 [&_[data-line]]:before:text-right [&_[data-line]]:before:text-muted-foreground [&_[data-line]]:before:content-[counter(line)] [&_[data-line]]:[counter-increment:line] [&_[data-highlighted-line]]:border-link"
    >
      {children}
    </pre>
  ),
  // Code line with highlighting (line numbers applied via pre styles)
  span: ({ children, ...props }) => {
    // rehype-pretty-code adds data-line to each line span
    if ("data-line" in props) {
      const isHighlighted = "data-highlighted-line" in props;
      return (
        <span
          {...props}
          className={isHighlighted ? "bg-highlight" : ""}
        >
          {children}
        </span>
      );
    }
    return <span {...props}>{children}</span>;
  },
  // Figure wrapper for code blocks (rehype-pretty-code)
  figure: ({ children, ...props }) => {
    if ("data-rehype-pretty-code-figure" in props) {
      return (
        <figure {...props} className="my-6">
          {children}
        </figure>
      );
    }
    return <figure {...props}>{children}</figure>;
  },
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="min-w-full border-collapse border border-border">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-code-bg">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-4 py-2 text-muted-foreground">
      {children}
    </td>
  ),
  tr: ({ children }) => (
    <tr className="even:bg-muted/50">{children}</tr>
  ),
  hr: () => <hr className="my-8 border-border" />,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-link underline underline-offset-4 decoration-link hover:text-link-hover hover:decoration-2"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">
      {children}
    </strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => (
    <del className="text-muted-foreground line-through">
      {children}
    </del>
  ),
  input: (props) => {
    if (props.type === "checkbox") {
      return (
        <input
          {...props}
          disabled
          className="mr-2 h-4 w-4 rounded border-border text-link focus:ring-link"
        />
      );
    }
    return <input {...props} />;
  },
  img: (props) => (
    <Image
      sizes="100vw"
      width={800}
      height={600}
      style={{ width: "100%", height: "auto" }}
      {...(props as ImageProps)}
    />
  ),

  // Footnote reference (superscript link in text)
  sup: ({ children }) => (
    <sup className="text-xs text-link ml-0.5">
      {children}
    </sup>
  ),
  // Footnotes section container
  section: ({ children, ...props }) => {
    // Check if this is a footnotes section (remark-gfm adds data-footnotes attribute)
    if ("data-footnotes" in props) {
      return (
        <section className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground">
          {children}
        </section>
      );
    }
    return <section {...props}>{children}</section>;
  },

  // TODO: add support for "On this Page"

  // TODO: add component for hoverable footnote popups

  // Custom components
  Summary,
  UnderConstruction,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
