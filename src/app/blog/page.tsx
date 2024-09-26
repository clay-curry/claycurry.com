'use server'

import fs from 'fs';
import path from 'path';

import { extractFrontMatter } from '@/app/_lib/frontmatter';

export default async function BlogContents() {

  const blog_dir = path.join(process.cwd(), 'src', 'app', 'blog');
  const blog_posts = fs
  
    .readdirSync(blog_dir)
  
    .filter(file => path.extname(file) === '.mdx')
    
    .map(mdx_file => ({
      slug: path.basename(mdx_file, path.extname(mdx_file))
    }))
    
    .map(post => ({
      ...post,
      fileContent: fs.readFileSync(path.join(blog_dir, `${post.slug}.mdx`), 'utf-8')
    }))
    
    .map(post => ({
      ...post,
      frontMatter: extractFrontMatter(post.fileContent)
    }))
    
    .map((post) => {
    const frontMatter = post.frontMatter as {
      title: string;
      description: string;
      date: string;
      category: string;
      slug: string;
      lang: string;
      tags: string[];
    };
    return {
      slug: post.slug,
      fileContent: post.fileContent,
      category: frontMatter.category,
      title: frontMatter.title,
      description: frontMatter.description,
      date: frontMatter.date,
      lang: frontMatter.lang,
      tags: frontMatter.tags,
      views: 0,
      shares: 0,
    };
  })

  return <BlogPage contentPromise={blog_posts} />
}

import BlogPage from './client';