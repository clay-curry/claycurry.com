'use server'

import fs from 'fs';
import path from 'path';
import { getPostFrontMatter } from '../_lib/posts';
import BlogContents from './client'; // Add this import

export async function getBlogs() {
  let dir = path.join(process.cwd(), 'src', 'app', 'blog');

  return fs.readdirSync(dir)
    .filter((file) => path.extname(file) === '.mdx')
    .map((mdx_file) => ({
        slug: path.basename(mdx_file, path.extname(mdx_file)), 
        rawContent:  fs.readFileSync(path.join(dir, mdx_file), 'utf-8')
    }))
    .map(mdx_file => ({
      slug: mdx_file.slug,
      frontMatter: getPostFrontMatter(mdx_file.rawContent)
    }))
    .map(m => ({
      slug: m.slug,
      category: m.frontMatter.category,
      title: m.frontMatter.title,
      description: m.frontMatter.description,
      date: m.frontMatter.date,
      lang: m.frontMatter.lang,
      tags: m.frontMatter.tags
    }));
}
export default async function Page() {
  const blogs = await getBlogs();

  return (
      <BlogContents posts={blogs} />
  );
}
