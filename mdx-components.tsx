import type { MDXComponents } from 'mdx/types'
import Image, { ImageProps } from 'next/image'
import Summary from './components/summary'
import UnderConstruction from './components/under-construction'
 
// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including inline styles,
// components from other libraries, and more.
 
const components = {
  // Allows customizing built-in components, e.g. to add styling.
  h1: ({ children }) => (
    <h1 className='text-3xl md:text-4xl font-extrabold mt-9 mb-4  text-blue-500 transition-all duration-300 group-hover:text-blue-500 sm:text-black sm:dark:text-white'>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className='text-2xl md:text-3xl font-bold mt-9 md:mt-12 mb-4 dark:text-gray-200'>
      {children}
    </h2>
  ),
  img: (props) => (
    <Image
      sizes="100vw"
      style={{ width: '100%', height: 'auto' }}
      {...(props as ImageProps)}
    />
  ),
  UnderConstruction,
  Summary
} satisfies MDXComponents
 
export function useMDXComponents(): MDXComponents {
  return components
}