import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type PostMetadata = {
  slug: string;
  pinned: boolean;
  published?: boolean;
  publishedDate: string;
  updatedDate?: string;
  title: string;
  shortTitle?: string;
  subtitle: string;
  prefix: string;
  tags: string[];
  readTime?: string;
  image?: string;
  excerpt?: string;
};

const BLOG_DIR = path.join(process.cwd(), "blog");

export function getPostMetadata(slug: string): PostMetadata {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data } = matter(fileContents);
  return { ...data, slug } as PostMetadata;
}

let cachedPosts: PostMetadata[] | null = null;

export function getAllPostsMetadata(): PostMetadata[] {
  if (cachedPosts) {
    return cachedPosts;
  }

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"));

  const posts = files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      return getPostMetadata(slug);
    })
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

  // In production, filter out posts with published: false
  if (process.env.NODE_ENV === "production") {
    cachedPosts = posts.filter((post) => post.published !== false);
  } else {
    cachedPosts = posts;
  }

  return cachedPosts;
}

function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export async function getPost(slug: string) {
  const metadata = getAllPostsMetadata().find((o) => o.slug === slug);
  if (!metadata) {
    throw new Error(`Post not found: ${slug}`);
  }
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { content } = matter(fileContents);
  const readTime = calculateReadTime(content);
  const { default: Content, toc = [] } = await import(`@/blog/${slug}.mdx`);
  return { metadata, Content, toc, readTime };
}

// Get raw article content for AI chat context
export function getPostContent(slug: string): { metadata: PostMetadata; content: string } | null {
  try {
    const metadata = getAllPostsMetadata().find((o) => o.slug === slug);
    if (!metadata) {
      return null;
    }
    const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { content } = matter(fileContents);
    return { metadata, content };
  } catch {
    return null;
  }
}
