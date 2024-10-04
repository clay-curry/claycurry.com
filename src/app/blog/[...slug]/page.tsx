'use server'

import React from 'react';

import TailwindcssPost from '../tailwindcss-best-practices.mdx'
import RetrospectivePost from '../the-2024-retrospective.mdx'

// we'll prerender only the params from `generateStaticParams` at build time,
// then attach the page to the server module graph

export default async function Page({ params }: { params: { slug: string } }) {
  switch(params.slug) {
    case 'the-2024-retrospective':
      return <RetrospectivePost />
    
    case 'tailwindcss-best-practices':
      return <TailwindcssPost />
  }
}

export async function generateStaticParams(){
  return [
    { slug: ['the-2024-retrospective'] }, 
    { slug: ['tailwindcss-best-practices'] }
  ]
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  switch(params.slug) {
    case 'the-2024-retrospective':
      return {
        title: 'The 2024 Retrospective'
      }

    case 'tailwind-css-best-practices':
      return {
        title: 'Tailwindcss Best Practices'
      }
  }
}
