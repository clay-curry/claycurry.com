"use server"

import type { Metadata } from 'next';
import { Suspense, cache } from 'react';
import { notFound } from 'next/navigation';
import { CustomMDX } from 'src/components-old/mdx';

import { getBlogs } from '../page';
import { unstable_noStore as noStore } from 'next/cache';

export default async function Page({ params }) {
  const post = (await getBlogs()).find((post) => post.slug === params.slug);

  if (!post) 
    notFound();
  
  return <div>{post.slug}</div>;
}

/*
export async function generateMetadata({
  params,
}): Promise<Metadata | undefined> {
  
  const post = (await getBlogs()).find((post) => post.slug === params.slug);

  if (!post) 
    notFound();
  

  let ogImage = post.image
    ? `https://claycurry.com${image}`
    : `https://claycurry.com/og?title=${title}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `https://claycurry.com/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

function formatDate(date: string) {
  noStore();
  let currentDate = new Date().getTime();
  if (!date.includes('T')) {
    date = `${date}T00:00:00`;
  }
  let targetDate = new Date(date).getTime();
  let timeDifference = Math.abs(currentDate - targetDate);
  let daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  
  let fullDate = new Date(date).toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (daysAgo < 1) {
    return 'Today';
  } else if (daysAgo < 7) {
    return `${fullDate} (${daysAgo}d ago)`;
  } else if (daysAgo < 30) {
    const weeksAgo = Math.floor(daysAgo / 7)
    return `${fullDate} (${weeksAgo}w ago)`;
  } else if (daysAgo < 365) {
    const monthsAgo = Math.floor(daysAgo / 30)
    return `${fullDate} (${monthsAgo}mo ago)`;
  } else {
    const yearsAgo = Math.floor(daysAgo / 365)
    return `${fullDate} (${yearsAgo}y ago)`;
  }
}

export default function Blog({ params }) {
  let post = getBlogPosts().find((post) => post.slug === params.slug);


  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.metadata.title,
            datePublished: post.metadata.date,
            dateModified: post.metadata.date,
            description: post.metadata.description,
            image: post.metadata.image
              ? `https://claycurry.com${post.metadata.image}`
              : `https://claycurry.com/og?title=${post.metadata.title}`,
            url: `https://claycurry.com/blog/${post.slug}`,
            author: {
              '@type': 'Person',
              name: 'Clayton Curry',
            },
          }),
        }}
      />
      <h1 className="title font-medium text-2xl tracking-tighter max-w-[650px]">
        {post.metadata.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm max-w-[650px]">
        <Suspense fallback={<p className="h-5" />}>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {formatDate(post.metadata.publishedAt)}
          </p>
        </Suspense>
        <Suspense fallback={<p className="h-5" />}>
          <Views slug={post.slug} />
        </Suspense>
      </div>
      <article className="prose prose-quoteless prose-neutral dark:prose-invert">
        <CustomMDX source={post.content} />
      </article>
    </section>
  );
}

let incrementViews = cache(incrementView);

async function Views({ slug }: { slug: string }) {
  let views = await getViewsCount();
  incrementViews(slug);
  
  
  function ViewCounter({
    slug,
    allViews,
  }: {
    slug: string;
    allViews: {
      slug: string;
      count: number;
    }[];
    trackView?: boolean;
  }) {
    const viewsForSlug = allViews && allViews.find((view) => view.slug === slug);
    const number = new Number(viewsForSlug?.count || 0);
  
    return (
      <p className="text-neutral-600 dark:text-neutral-400">
        {`${number.toLocaleString()} views`}
      </p>
    );
  }

  
  return <ViewCounter allViews={views} slug={slug} />;
}
*/
