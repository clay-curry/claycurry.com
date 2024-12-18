import React from 'react';
import Contact from './contact.mdx'
import Experience from './experience.mdx'
import SkillsAndTools from './skills-and-tools.mdx'

// we'll prerender only the params from `generateStaticParams` at build time,
// then attach the page to the server module graph

export default async function Page({ params }: { params: { slug: string } }) {

  switch (params.slug) {
    case 'contact': return <Contact />
    case 'experience': return <Experience />
    case 'skills-and-tools': return <SkillsAndTools />
  }
  //const postData = getPostData({ path: params.slug[0] });
  // return <MDXRemote source={postData} />;
  return <div>TEST PAGE {params.slug}</div>
}
// we'll prerender only the params from `generateStaticParams` at build time,
// then attach the page to the server module graph

export async function generateStaticParams(){
  return [
    { slug: ['contact'] }, 
    { slug: ['experience'] },
    { slug: ['skills-and-tools'] }
  ]
}


/*
import type { Metadata } from 'next';
import { Suspense, cache } from 'react';
import { notFound } from 'next/navigation';
import { CustomMDX } from 'src/components-old/mdx';

import { getWorkPosts } from '../fetch';


import { getViewsCount } from '@/app/_db/queries';
import { incrementView } from '@/app/_db/actions';
import { unstable_noStore as noStore } from 'next/cache';

export async function generateMetadata({
  params,
}): Promise<Metadata | undefined> {
  let post = getWorkPosts().find((post) => post.slug === params.slug);
  if (!post) {
    return;
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;
  let ogImage = image
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
      url: `https://claycurry.com/work/${post.slug}`,
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

export default function Work({ params }) {
  let post = getWorkPosts().find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

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
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `https://claycurry.com${post.metadata.image}`
              : `https://claycurry.com/og?title=${post.metadata.title}`,
            url: `https://claycurry.com/work/${post.slug}`,
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