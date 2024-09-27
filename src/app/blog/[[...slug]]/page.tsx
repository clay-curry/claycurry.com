'use server'

import fs from 'fs';
import path from 'path';
import React from 'react';
import { BlogHome } from './client';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPosts, getPostData } from '@/app/_lib/data'

const slug_dir = 'src/app/blog'

// we'll prerender only the params from `generateStaticParams` at build time,
// then attach the page to the server module graph
export async function generateStaticParams() {
  const paths = await getPosts(path.join(process.cwd(), slug_dir))

  const slugs = await Promise.all(paths.map(p => getPostData({ path: p })))
  return [
    {
      slug: undefined
    },
    ...paths
  ]
}


export default async function Page({ params }: { params: { slug?: string[] } }) {

  const isBlogHome = params.slug === undefined

  if (isBlogHome) {

    // this will not cause network waterfall because the module is statically generated at build time
    const posts = await getPosts(path.join(process.cwd(), slug_dir))
    const data = await Promise.all(posts.map(p => getPostData({ path: p })))
    return <div>TEST {data.map(d => d.title)}</div>

    // return <BlogPost slug={params.slug[0]} />
  } else if (params.slug && params.slug.length > 0) {


    const postData = getPostData({ path: params.slug[0] });
    // return <MDXRemote source={postData} />;
    return <div>TEST PAGE {postData.then(d => d.title)}</div>

  } else {
    // 404 page, fixme
    return <div>404</div>
  }
}





