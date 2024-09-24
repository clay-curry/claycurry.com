import { getBlogs } from '@/app/blog/ls';

export default async function sitemap() {
  let blogs = (await getBlogs()).map((post) => ({
    url: `https://claycurry.com/blog/${post.slug}`,
    lastModified:  new Date().toISOString().split('T')[0],
  }));

  let routes = ['', '/blog', '/guestbook', '/uses', '/work'].map((route) => ({
    url: `https://claycurry.com${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }));

  return [...routes, ...blogs];
}
