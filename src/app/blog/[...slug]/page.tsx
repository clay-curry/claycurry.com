'use server'

import fs from 'fs';
import path, { basename } from 'path';
import React from 'react';

import TailwindcssPost from './tailwindcss-best-practices.mdx'
import RetrospectivePost from './the-2024-retrospective.mdx'

const slug_dir = 'src/app/blog/[...slug]/'

// we'll prerender only the params from `generateStaticParams` at build time,
// then attach the page to the server module graph

export default async function Page({ params }: { params: { slug: string } }) {

  if (params.slug == 'the-2024-retrospective') {
    return <RetrospectivePost />
  } else if (params.slug == 'tailwindcss-best-practices') {
    return <TailwindcssPost />
  } else {
    <div>Other ({params.slug})</div>
  }

  //const postData = getPostData({ path: params.slug[0] });
  // return <MDXRemote source={postData} />;
  return <div>TEST PAGE {params.slug}</div>
}





