'use client'

const PINNED_POST = 'the-2024-retrospective';

import clsx from 'clsx';
import Link from 'next/link';
import { m } from 'framer-motion';
import { useState, useEffect, use, Suspense } from 'react';

import Page from '@/app/_lib/contents-layouts/Page';
import { formatDateRelative, formatLang } from '@/app/_lib/post';
import { ChevronRightIcon, PinIcon } from '@/app/_lib/components/Icons';

export type BlogContentType = { slug: string; category: string; title: string; description: string; date: string; lang: string; tags: string[]; views: number; shares: number; }

export default function BlogHome({ contentPromise: content }: { contentPromise: BlogContentType[] }) {
  return (<div>
    <Page
      frontMatter={{
        title: 'Blog',
        description: `My personal impression of developments at the interface of tech, computer science, and higher mathematics.`
      }}
      headerImage={<HeaderImage />}
    >

      <div className={clsx('content-wrapper')}>
        <div
          className={clsx(
            'flex flex-col gap-8',
            'md:flex-row md:gap-8 lg:gap-24'
          )}
        >
          <div className={clsx('md:w-64')}>
            {
              // TODO: Filter Posts
            }
          </div>
          <div className={clsx('flex-1')}>

            {/* pinned post goes first */}
              <RenderPosts contentPromise={ content } />
          </div>
        </div>
      </div>
    </Page>
  </div>
  );
}

function RenderPosts({contentPromise}) {  
  const pinnedPost = contentPromise.filter(post => post.slug === PINNED_POST);
  const postsPreview = contentPromise.filter(post => post.slug !== PINNED_POST);
  return (
    [
      (
        <div
          key={pinnedPost[0].slug}
          className={clsx(
            'mb-8 flex items-start gap-4',
            'md:mb-4 md:gap-6'
          )}
        >
          <div
            className={clsx(
              'border-divider-light mt-14 hidden w-8 -translate-y-1 border-b',
              'md:mt-16 md:w-20 lg:block',
              'dark:border-divider-dark'
            )}
          />
          <div className={clsx('flex-1')}>
            <PostPreview
              pinned={true}
              slug={pinnedPost[0].slug}
              category={pinnedPost[0].category}
              title={pinnedPost[0].title}
              description={pinnedPost[0].description}
              date={pinnedPost[0].date}
              lang={pinnedPost[0].lang}
              tags={pinnedPost[0].tags}
              views={pinnedPost[0].views}
              shares={pinnedPost[0].shares}
            />
          </div>
        </div>
      
      ),
      ...postsPreview.map(
      ({
        slug,
        category,
        title,
        description,
        date,
        lang,
        tags,
        views,
        shares,
      }) => (
        <div
          key={slug}
          className={clsx(
            'mb-8 flex items-start gap-4',
            'md:mb-4 md:gap-6'
          )}
        >
          <div
            className={clsx(
              'border-divider-light mt-14 hidden w-8 -translate-y-1 border-b',
              'md:mt-16 md:w-20 lg:block',
              'dark:border-divider-dark'
            )}
          />
          <div className={clsx('flex-1')}>
            <PostPreview
              slug={slug}
              category={category}
              title={title}
              description={description}
              date={date}
              lang={lang}
              tags={tags}
              views={views}
              shares={shares}
            />
          </div>
        </div>
      )
    )]
    
  );
}

function PostPreview({
  title,
  description,
  category,
  date,
  slug,
  lang,
  tags,
  views,
  shares,
  pinned = false,
}: BlogContentType & { 
  pinned?: boolean
}
) {
  return (
    <article lang={lang}>
      <Link
        href={`blog/${slug}`}
        className={clsx(
          'group relative mb-6 block overflow-hidden bg-gradient-to-t',
          'sm:mb-0 sm:rounded-2xl',
          pinned
            ? [
              'border-divider-light',
              'sm:border sm:p-4 md:mt-6 md:p-6',
              'dark:border-divider-dark',
            ]
            : ['sm:p-4 md:p-6']
        )}
      >
        {pinned && (
          <>
          <m.div
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: '100%', opacity: [0, 1, 0, 0] }}
            transition={{
              delay: 1.4,
              duration: 1.84,
              ease: [0.85, 0, 0.15, 1],
            }}
            className="absolute -inset-x-64 inset-y-0 z-[-1]"
          >
            <div
              className={clsx(
                'absolute inset-y-0 w-10 -rotate-45 scale-[4] bg-black opacity-[0.08]',
                'dark:bg-white dark:opacity-[0.14]'
              )}
            />
          </m.div>
          
          <div
              className={clsx(
                'relative mb-4 flex items-center gap-2 font-semibold text-slate-500',
                'sm:text-slate-500',
                'dark:sm:text-accent-400 dark:text-slate-400'
              )}
            >
              <PinIcon className={clsx('h-5 w-5')} />
              Pinned Post
            </div>
        </>
        )}
        <div
          className={clsx(
            'text-slate mb-2 flex flex-col gap-2 text-xs text-slate-500',
            'dark:text-slate-400 md:mb-1'
          )}
        >
          <div className={clsx('flex gap-1')}>
            <time dateTime={date} className={clsx('first-letter:uppercase')}>
              {formatDateRelative(date)}
            </time>
            <span>&middot;</span>
            <span>{formatLang(lang as 'id' | 'en')}</span>
          </div>
        </div>
        <div className={clsx('mb-2')}>
          <h2
            className={clsx(
              'text-xl font-extrabold text-slate-700',
              'md:text-2xl',
              'dark:text-slate-300'
            )}
          >
            {title}
          </h2>
        </div>
        <p
          className={clsx(
            'mb-3 block leading-relaxed text-slate-600',
            'dark:text-slate-400'
          )}
        >
          {description}
        </p>

        <div
          className={clsx(
            'text-accent-600 items-center gap-1 text-sm font-semibold',
            'dark:text-accent-400',
            pinned ? ['flex', 'sm:hidden'] : 'flex'
          )}
        >
          read more{' '}
          <ChevronRightIcon className="group-hover:animate-bounce-x mt-1 h-3 w-3 transition" />
        </div>
      </Link>
    </article>
  );
}

function HeaderImage() {

  const animation = {
    hide: { pathLength: 0.3 },
    show: (i) => {
      const delay = 0.4 + i * 0.1;
      return {
        pathLength: 1.2,
        transition: {
          pathLength: { delay, duration: 0.5 },
        },
      };
    },
  };


  return (
    <m.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      initial="hide"
      animate="show"
      strokeWidth={0.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={clsx(
        'stroke-accent-500 -mt-7 h-full opacity-60',
        'dark:opacity-40'
      )}
    >
      <m.circle
        cx="5"
        cy="6"
        r="2"
        variants={animation}
        custom={1}
        initial={{ pathLength: 1.2 }}
      />
      <m.circle cx="12" cy="6" r="2" variants={animation} custom={2} />
      <m.circle cx="19" cy="6" r="2" variants={animation} custom={3} />
      <m.circle cx="5" cy="18" r="2" variants={animation} custom={4} />
      <m.circle cx="12" cy="18" r="2" variants={animation} custom={5} />
      <m.line x1="5" y1="8" x2="5" y2="16" variants={animation} custom={6} />
      <m.line x1="12" y1="8" x2="12" y2="16" variants={animation} custom={7} />
      <m.path d="M19 8v2a2 2 0 0 1 -2 2h-12" variants={animation} custom={8} />
    </m.svg>
  );
}
