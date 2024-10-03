'use server'

import fs from 'fs';
import path, { basename } from 'path';
import React from 'react';

const slug_dir = 'src/app/blog/[...slug]/'

// we'll prerender only the params from `generateStaticParams` at build time,
// then attach the page to the server module graph
export async function generateStaticParams() {
  const dir = path.join(process.cwd(), slug_dir)
  const paths = fs.readdirSync(dir)
    .filter(file => path.extname(file) === '.mdx')
    .map(p => ({ slug: basename(p).replace('.mdx', '') }))
    .map(p => ({ slug: [p.slug] }))
  return [
    {
      slug: undefined
    },
    ...paths
  ]
}
import { extractFrontMatter } from '@/utils/frontmatter';

const getPostData = (path: string) => {
  console.log(path)
  const content = fs.readFileSync(path, 'utf-8')
  const fm = extractFrontMatter(content) as {
    title: string;
    description: string;
    date: string;
    category: string;
    slug: string;
    lang: string;
    tags: string[];
  }
  return {
    content: content,
    title: fm.title,
    description: fm.description,
    date: fm.date,
    category: fm.category,
    slug: fm.slug,
    lang: fm.lang,
    tags: fm.tags,
    views: 0,
    shares: 0,
  }
}
const getPosts = (dir: string) => {
  return fs.readdirSync(dir)
    .filter(file => path.extname(file) === '.mdx')
}

export default async function Page({ params }: { params: { slug?: string[] } }) {
  const isBlogHome = params.slug === undefined

  //const postData = getPostData({ path: params.slug[0] });
  // return <MDXRemote source={postData} />;
  return <div>TEST PAGE</div>


}





