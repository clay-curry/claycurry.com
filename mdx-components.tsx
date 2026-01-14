import type { MDXComponents } from "mdx/types";
import Image, { type ImageProps } from "next/image";
import Summary from "@/lib/ui/components/summary";
import UnderConstruction from "@/lib/ui/components/under-construction";

// This file declares custom React components for injecting into MDX when compiling to JSX. You can
// import and use any React component you want, including inline styles, components from other
// libraries, and more.
//
//
// The components defined here will be used automatically by MDX files in the project. You can
// also override or extend these components on a per-file basis by passing a `components` prop
// to the MDX component.
//
// For more information, see:
// - https://mdxjs.com/guides/injecting-components/
// - https://mdxjs.com/docs/using-mdx/react/#custom-components

const components = {
  // Allows customizing built-in components, e.g. to add styling.
  h1: ({ children }) => (
    <h1 className="text-3xl md:text-4xl font-extrabold mt-9 mb-4 text-blue-500 transition-all duration-300 group-hover:text-blue-500 sm:text-black sm:dark:text-white">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl md:text-3xl font-bold mt-9 md:mt-12 mb-4 dark:text-gray-200">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl md:text-2xl font-semibold mt-6 mb-3 dark:text-gray-200">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-4 leading-7 text-gray-700 dark:text-gray-300">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="my-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 ml-6 list-decimal space-y-2 text-gray-700 dark:text-gray-300">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-blue-400 pl-4 italic text-gray-600 dark:text-gray-400">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-sm font-mono text-gray-800 dark:text-gray-200">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-lg bg-gray-900 dark:bg-zinc-800 p-4 text-sm">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-200 dark:border-zinc-700">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-100 dark:bg-zinc-800">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border border-gray-200 dark:border-zinc-700 px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-200 dark:border-zinc-700 px-4 py-2 text-gray-700 dark:text-gray-300">
      {children}
    </td>
  ),
  tr: ({ children }) => (
    <tr className="even:bg-gray-50 dark:even:bg-zinc-800/50">{children}</tr>
  ),
  hr: () => <hr className="my-8 border-gray-200 dark:border-zinc-700" />,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-blue-600 dark:text-blue-400 underline underline-offset-4 decoration-blue-400 dark:decoration-blue-600 hover:decoration-2"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900 dark:text-gray-100">
      {children}
    </strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  img: (props) => (
    <Image
      sizes="100vw"
      style={{ width: "100%", height: "auto" }}
      {...(props as ImageProps)}
    />
  ),
  Summary,
  UnderConstruction,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
