import yaml from 'js-yaml';

export const frontmatterRegex = /---\n([\s\S]+?)\n---/;

export function extractFrontMatter(content: string):
 { 
  title: string;
  description: string;
  date: string;
  category: string;
  slug: string;
  lang: string;
  tags: string[];
  views: number;
  shares: number
} | null {
  const match = content.match(frontmatterRegex);
  if (!match) return null;

  const frontmatter = match[1];
  const fields = yaml.load(frontmatter);

  return fields;
  }