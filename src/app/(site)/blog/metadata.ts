import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type PostMetadata = {
  slug: string;
  pinned: boolean;
  date: string;
  title: string;
  subtitle: string;
  prefix: string;
  tags: string[];
};

const BLOG_DIR = path.join(process.cwd(), "src/app/(site)/blog/_content");

export function getPostMetadata(slug: string): PostMetadata {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data } = matter(fileContents);
  return data as PostMetadata;
}

export function getAllPostsMetadata(): PostMetadata[] {
  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"));

  return files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    return getPostMetadata(slug);
  });
}
