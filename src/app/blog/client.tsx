'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { m } from 'framer-motion';


import CountUp from '@/app/_lib/components/CountUp';
import { formatDateRelative, formatLang } from '@/app/_lib/post';
import { ChevronRightIcon, InsightIcon, PinIcon } from '@/app/_lib/components/Icons';

export function HeaderImage () {
  return (
  <m.svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="none"
    initial="hide"
    animate="show"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={clsx(
      'stroke-accent-500 -mt-16 h-full opacity-60',
      'dark:opacity-40'
    )}
  >
    <m.path
      variants={{
        hide: { pathLength: 0.1 },
        show: (i) => {
          const delay = 0.2 + i * 0.1;
          return {
            pathLength: 1,
            transition: {
              pathLength: { delay, duration: 2 },
            },
          };
        },
      }}
      custom={1}
      d="M204.055 213.905q-18.12-5.28-34.61-9a145.92 145.92 0 0 1-6.78-44.33c0-65.61 42.17-118.8 94.19-118.8 52.02 0 94.15 53.14 94.15 118.76a146.3 146.3 0 0 1-6.16 42.32q-20.52 4.3-43.72 11.05c-22 6.42-39.79 12.78-48.56 16.05-8.72-3.27-26.51-9.63-48.51-16.05zm-127.95 84.94a55.16 55.16 0 1 0 55.16 55.15 55.16 55.16 0 0 0-55.16-55.15zm359.79 0a55.16 55.16 0 1 0 55.16 55.15 55.16 55.16 0 0 0-55.15-55.15zm-71.15 55.15a71.24 71.24 0 0 1 42.26-65v-77.55c-64.49 0-154.44 35.64-154.44 35.64s-89.95-35.64-154.44-35.64v74.92a71.14 71.14 0 0 1 0 135.28v7c64.49 0 154.44 41.58 154.44 41.58s89.99-41.55 154.44-41.55v-9.68a71.24 71.24 0 0 1-42.26-65z"
    />
  </m.svg>
);
}

export function PostPreview({
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
}: {
  title: string;
  description: string;
  date: string;
  category: string;
  slug: string;
  lang: string;
  tags: string[];
  views: number;
  shares: number;
  pinned?: boolean;
}) {
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
        )}
        {pinned && (
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

type PostPreview = {
  slug: string;
  category: string;
  title: string;
  description: string;
  date: string;
  lang: string;
  tags: string[];
  views: number;
  shares: number;
}

export function BlogPage(
   { pinnedPost, postsPreview }: { pinnedPost: PostPreview | undefined, postsPreview: PostPreview[] }
) {
  return (
     
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
          {pinnedPost && (
            <div
              key={pinnedPost.slug}
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
                        slug={pinnedPost.slug}
                        category={pinnedPost.category}
                        title={pinnedPost.title}
                        description={pinnedPost.description}
                        date={pinnedPost.date}
                        lang={pinnedPost.lang}
                        tags={pinnedPost.tags}
                        views={pinnedPost.views}
                        shares={pinnedPost.shares}
                      />
                    </div>
                  </div>
                )
              }



              {postsPreview.map(
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
              )}
            </div>
          </div>
        </div>
    );
}