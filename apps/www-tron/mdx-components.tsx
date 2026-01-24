import type { MDXComponents } from "mdx/types";
import Image, { type ImageProps } from "next/image";
import Summary from "@/lib/components/ui/summary";
import { slugify } from "@/lib/utils";

// TRON-themed MDX components
const components = {
  h1: ({ children }: { children: React.ReactNode }) => {
    const id = slugify(children);
    return (
      <h1
        id={id}
        className="text-3xl md:text-4xl font-extrabold mt-16 mb-4 text-primary transition-all duration-300 hover:text-primary/80"
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
        className="text-2xl md:text-3xl font-bold mt-9 md:mt-12 mb-4 text-foreground"
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
        className="text-xl md:text-2xl font-semibold mt-6 mb-3 text-foreground"
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
    <ul className="my-4 ml-6 list-disc space-y-2 text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="my-4 ml-6 list-decimal space-y-2 text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => <li className="leading-7">{children}</li>,
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="my-6 border-l-4 border-primary pl-4 text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  code: ({ children, ...props }: { children: React.ReactNode; "data-theme"?: string }) => {
    if ("data-theme" in props) {
      return (
        <code {...props} className="text-sm font-mono">
          {children}
        </code>
      );
    }
    return (
      <code className="px-1.5 py-0.5 rounded bg-secondary text-sm font-mono text-primary">
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: { children: React.ReactNode }) => (
    <pre
      {...props}
      className="my-6 overflow-x-auto rounded-lg p-4 text-sm bg-secondary border border-border [&>code]:grid [&>code]:gap-0 [counter-reset:line] [&_[data-line]]:border-l-2 [&_[data-line]]:border-transparent [&_[data-line]]:pl-2 [&_[data-line]]:before:mr-4 [&_[data-line]]:before:inline-block [&_[data-line]]:before:w-4 [&_[data-line]]:before:text-right [&_[data-line]]:before:text-muted-foreground [&_[data-line]]:before:content-[counter(line)] [&_[data-line]]:[counter-increment:line] [&_[data-highlighted-line]]:border-primary"
    >
      {children}
    </pre>
  ),
  span: ({ children, ...props }: { children: React.ReactNode; "data-line"?: boolean; "data-highlighted-line"?: boolean }) => {
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
      return (
        <figure {...props} className="my-6">
          {children}
        </figure>
      );
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
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
