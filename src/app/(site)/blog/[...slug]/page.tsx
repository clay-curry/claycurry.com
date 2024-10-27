'use server'

import React from 'react';

import UnderstandingWebpack from '../understanding-webpack.mdx'
import RefactoringToReactPatterns from '../refactoring-to-react-patterns.mdx'

// we'll prerender only the params from `generateStaticParams` at build time,
// then attach the page to the server module graph

export default async function Page({ params }: { params: { slug: string } }) {
  switch(params.slug) {
    case 'understanding-webpack':
      return <UnderstandingWebpack />
    
    case 'tailwindcss-best-practices':
      return <RefactoringToReactPatterns />
  }
}

export async function generateStaticParams(){
  return [
    { slug: ['understanding-webpack'] }, 
    { slug: ['tailwindcss-best-practices'] }
  ]
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  switch(params.slug) {
    case 'understanding-webpack':
      return {
        title: 'Understanding Webpack'
      }

    case 'refactoring-to-react-patterns':
      return {
        title: 'Refactoring to (React) Patterns'
      }
  }
}
