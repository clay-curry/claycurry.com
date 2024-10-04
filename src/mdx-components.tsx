import clsx from 'clsx'
import Link, { LinkProps } from 'next/link'
import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => <h1 className={clsx(
      'md:leading-snug',
      'pt-20 md:pt-24',
      'pb-16 md:pb-20',
      'text-[2.5rem] md:text-5xl',
      'font-extrabold leading-tight',
      'text-slate-700 dark:text-slate-300'
    )} {...props} />,
    h2: (props) => <h2 className={clsx(
      'md:leading-snug',
      'pt-8 md:pt-10',
      'pb-4 md:pb-6',
      'text-2xl md:text-2xl',
      'font-extrabold leading-tight',
      'text-slate-700 dark:text-slate-300'
    )} {...props} />,
    a: (props) => <Link className={clsx(
      'font-extrabold',
      'underline underline-offset-4',
      'cursor-pointer'
    )} {...props as LinkProps} />,
    li: (props) => <li className={clsx(
      'list-disc ml-6 my-1'
    )} {...props } />,
    ...components,
  }
}