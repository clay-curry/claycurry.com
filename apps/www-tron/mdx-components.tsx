import type { MDXComponents } from "mdx/types";
import Image, { type ImageProps } from "next/image";
import Summary from "@/lib/custom/ui/summary";
import { CodeBlock } from "@/lib/custom/ai-elements/code-block";
import { Mermaid } from "@/lib/custom/ai-elements/mermaid";
import { DiagramTabs, DiagramContent, MermaidContent, AsciiContent } from "@/lib/custom/ai-elements/diagram-tabs";
import { ExampleTabs, RenderedContent, SourceContent } from "@/lib/custom/ai-elements/example-tabs";
import { slugify } from "@/lib/utils";

// TRON-themed MDX components
const components = {
  h1: ({ children }: { children: React.ReactNode }) => {
    const id = slugify(children);
    return (
      <h1
        id={id}
        className="text-4xl md:text-5xl font-extrabold mt-20 mb-6 text-primary transition-all duration-300 hover:text-primary/80"
      >
        <a href={`#${id}`} className="no-underline hover:underline">
          {children}
        </a>
      </h1>
    );
  },
  h2: ({ children, id: existingId, ...props }: { children: React.ReactNode; id?: string }) => {
    const id = existingId || slugify(children);
    return (
      <h2
        id={id}
        className="text-2xl md:text-3xl font-bold mt-16 md:mt-16 mb-4 text-foreground"
        {...props}
      >
        <a href={`#${id}`} className="no-underline hover:underline">
          {children}
        </a>
      </h2>
    );
  },
  h3: ({ children }: { children: React.ReactNode }) => {
    const id = slugify(children);
    return (
      <h3
        id={id}
        className="text-xl md:text-2xl font-semibold mt-13 mb-6 text-foreground"
      >
        <a href={`#${id}`} className="no-underline hover:underline">
          {children}
        </a>
      </h3>
    );
  },
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="my-4 leading-7 text-foreground">
      {children}
    </p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="my-4 ml-6 list-disc space-y-2" >
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="my-4 ml-6 list-decimal space-y-2">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => <li className="leading-7">{children}</li>,
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="my-6 border-l-4 border-primary pl-4">
      {children}
    </blockquote>
  ),
  code: ({ children, style, ...props }: { children: React.ReactNode; "data-theme"?: string; "data-language"?: string; style?: React.CSSProperties }) => {
    // Check if this is inline code (plaintext language typically means inline)
    const isInlineCode = props["data-language"] === "plaintext";

    if (isInlineCode) {
      // Strip rehype-pretty-code's inline styles for inline code
      return (
        <code className="bg-transparent! text-primary-accent! font-mono **:text-primary-accent! **:bg-transparent!">
          {children}
        </code>
      );
    }

    // Block code from rehype-pretty-code
    if ("data-language" in props) {
      return (
        <code {...props} style={style} className="text-sm font-mono">
          {children}
        </code>
      );
    }

    // Plain inline code (not processed by rehype-pretty-code)
    return (
      <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono text-primary border border-border">
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: { children: React.ReactNode; "data-language"?: string; title?: string }) => (
    <CodeBlock {...props}>
      {children}
    </CodeBlock>
  ),
  span: ({ children, ...props }: { children: React.ReactNode; "data-line"?: boolean; "data-highlighted-line"?: boolean; "data-rehype-pretty-code-figure"?: string }) => {
    // Inline code from rehype-pretty-code is wrapped in span (not figure)
    if ("data-rehype-pretty-code-figure" in props) {
      return (
        <span className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono text-primary border border-border inline-block">
          {children}
        </span>
      );
    }
    if ("data-line" in props) {
      const isHighlighted = "data-highlighted-line" in props;
      return (
        <span
          {...props}
          className={isHighlighted ? "bg-primary/10" : ""}
        >
          {children}
        </span>
      );
    }
    return <span {...props}>{children}</span>;
  },
  figure: ({ children, ...props }: { children: React.ReactNode; "data-rehype-pretty-code-figure"?: boolean }) => {
    if ("data-rehype-pretty-code-figure" in props) {
      // rehype-pretty-code wraps code in figure, just pass through children
      return <>{children}</>;
    }
    return <figure {...props}>{children}</figure>;
  },
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="my-6 overflow-x-auto">
      <table className="min-w-full border-collapse border border-border">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children: React.ReactNode }) => (
    <thead className="bg-secondary">{children}</thead>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="border border-border px-4 py-2 text-muted-foreground">
      {children}
    </td>
  ),
  tr: ({ children }: { children: React.ReactNode }) => (
    <tr className="even:bg-muted/50">{children}</tr>
  ),
  hr: () => <hr className="my-8 border-border" />,
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
    <a
      href={href}
      className="text-primary underline underline-offset-4 decoration-primary/50 hover:text-primary/80 hover:decoration-2 transition-colors"
    >
      {children}
    </a>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">
      {children}
    </strong>
  ),
  em: ({ children }: { children: React.ReactNode }) => <em className="italic">{children}</em>,
  del: ({ children }: { children: React.ReactNode }) => (
    <del className="text-muted-foreground line-through">
      {children}
    </del>
  ),
  input: (props: React.InputHTMLAttributes<HTMLInputElement>) => {
    if (props.type === "checkbox") {
      return (
        <input
          {...props}
          disabled
          className="mr-2 h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
      );
    }
    return <input {...props} />;
  },
  img: (props: ImageProps) => (
    <Image
      sizes="100vw"
      width={800}
      height={600}
      style={{ width: "100%", height: "auto" }}
      {...props}
    />
  ),
  sup: ({ children }: { children: React.ReactNode }) => (
    <sup className="text-xs text-primary ml-0.5">
      {children}
    </sup>
  ),
  section: ({ children, ...props }: { children: React.ReactNode; "data-footnotes"?: boolean }) => {
    if ("data-footnotes" in props) {
      return (
        <section className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground">
          {children}
        </section>
      );
    }
    return <section {...props}>{children}</section>;
  },
  Summary,
  Mermaid,
  DiagramTabs,
  DiagramContent,
  MermaidContent,
  AsciiContent,
  ExampleTabs,
  RenderedContent,
  SourceContent,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
