'use server'

import fs from 'fs';
import path from 'path';
import { getPostFrontMatter } from '../_lib/posts';

export function getBlogs() {
  let res = {};
  let dir = path.join(process.cwd(), 'app', 'blog');
  fs.readdirSync(dir)
  .filter((file) => path.extname(file) === '.mdx')
  .map((mdx_file) => ({
      slug: path.basename(mdx_file, path.extname(mdx_file)), 
      rawContent:  fs.readFileSync(path.join(dir, mdx_file), 'utf-8')
  }))
  .map(mdx_file => ({
    slug: mdx_file.slug,
    views: 0,
    shares: 0,
    frontMatter: getPostFrontMatter(mdx_file.rawContent)
  })).forEach(m => 
      res[m.slug] = {
        slug: m.slug,
        category: m.frontMatter.category,
        title: m.frontMatter.title,
        description: m.frontMatter.description,
        date: m.frontMatter.date,
        lang: m.frontMatter.lang,
        tags: m.frontMatter.tags,
        views: m.views,
        shares: m.shares
      }
  );

  return res;
}