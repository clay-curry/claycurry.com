'use server'

import fs from 'fs';
import path from 'path';
import { extractFrontMatter } from './frontmatter';

export async function getPosts(dir: string) {
  return fs.readdirSync(dir)
    .filter(file => path.extname(file) === '.mdx')
}

export async function getPostData({ path }: { path: string }) {
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
  }
}