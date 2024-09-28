'use server'

import fs from 'fs';
import path, { basename } from 'path';
import React from 'react';
import { BlogHome } from './client';
import { MDXRemote } from 'next-mdx-remote/rsc';

const slug_dir = 'src/app/blog'

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

  if (isBlogHome) {
    // this will not cause network waterfall because the module is statically generated at build time
    const posts = await getPosts(path.join(process.cwd(), slug_dir))
    const paths = posts.map(p => path.join(process.cwd(), `${slug_dir}/${p}`))
    const data = Promise.all(paths.map(p => getPostData(p)))

    return (<div>
      <BlogHome posts={data} />
    </div>)


    // return <BlogPost slug={params.slug[0]} />
  } else if (params.slug && params.slug.length > 0) {


    //const postData = getPostData({ path: params.slug[0] });
    // return <MDXRemote source={postData} />;
    return <div>TEST PAGE</div>

  } else {
    // 404 page, fixme
    return <div>404</div>
  }
}





