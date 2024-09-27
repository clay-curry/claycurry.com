'use server'

import fs from 'fs';
import path from 'path';
import { MDXRemote } from 'next-mdx-remote/rsc';
import React from 'react';

const slug_dir = 'src/app/blog'


export default async function Page({ params }: { params: { slug?: string[] } }) {
  const slug = params.slug
  return (
    (slug) ? <BlogPost slug={slug[0]} /> : <BlogHome />
  )
}

// we'll prerender only the params from `generateStaticParams` at build time,
// then attach the page to the server module graph
export async function generateStaticParams() {
  const paths = fs.readdirSync(path.join(process.cwd(), slug_dir))
    .filter(file => path.extname(file) === '.mdx')
    .map(s => ({ slug: [s] }))

  return [
    {
      slug: undefined
    },
    ...paths
  ]
}

function BlogHome() {
  return (
    <div>
      We are at home
    </div>
  )
}

async function BlogPost({ slug }: { slug: string }) {
  const s = path.join(process.cwd(), slug_dir, `${slug}.mdx`)
  const rawMdxSource = fs.readFileSync(s, 'utf-8')

  return (
    <div>
      We are at post {slug} with source code:
      {rawMdxSource}
    </div>
  )
}