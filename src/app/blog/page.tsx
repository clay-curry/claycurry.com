"use client"


export default () => <div>Blogs</div>

/*
import useSWR, { SWRConfig } from "swr";
import { getBlogs } from './ls';

const fetcher = (url) => fetch(url).then((res) => res.json());


import Link from 'next/link';
import clsx from 'clsx';
import { m } from 'framer-motion';

import CountUp from '@/app/_components/CountUp';
import { ChevronRightIcon, InsightIcon, PinIcon } from '@/app/_components/Icons';
import { formatDateRelative, formatLang } from '@/app/_helpers/post';
import type { TPostFrontMatter } from '@/app/_utils/types';

const sAPI = '/api/count/share';
const vAPI = '/api/count/view';

export async function fetchBlogs() {
  const repoShareCount = await fetcher(sAPI);
  const repoViewCount = await fetcher(vAPI);
  
  return {
    props: {
      fallback: {
        [sAPI]: repoShareCount,
        [vAPI]: repoViewCount
      }
    }
  }
}

  
import type { TContentMeta } from '@/app/_utils/types';

export function useContentMeta() {
  const {
    data: sdata,
    error: sisError,
    isLoading: sisLoading,
  } = useSWR<Record<string, TContentMeta>>(sAPI, fetcher, {
    fallbackData: {},
  });

  const {
    data: vdata,
    error: visError,
    isLoading: visLoading,
  } = useSWR<Record<string, TContentMeta>>(vAPI, fetcher, {
    fallbackData: {},
  });
  
  
  return {
    sdata,
    sisError,
    sisLoading,
    vdata,
    visError,
    visLoading
  };
}

const PINNED_POST = 'the-2023-retrospective';

export type BlogContentsProps = {
  posts: Array<{
    slug: string;
    frontMatter: TPostFrontMatter;
  }>;
};


export default function BlogContents({ posts }: BlogContentsProps) {
  const {
    sdata,
    vdata
  } = useContentMeta();
  if(!sdata || !vdata){
    return
  }

  const data = {};
  Object.keys(sdata).forEach(k =>
    data[k] = {
      shares: sdata[k],
      views: vdata[k]
    }

  )

  let pinnedPost: TPostPreview | null;
  const postsPreview: Array<TPostPreview> = [];

  posts.forEach(({ slug, frontMatter }) => {
    const { shares, views } = data[slug]
      ? data[slug].meta
      : { shares: 0, views: 0 };

    const preview: TPostPreview = {
      slug,
      views,
      shares,
      ...frontMatter,
    };

    if (slug === PINNED_POST) {
      pinnedPost = preview;
    } else {
      postsPreview.push(preview);
    }
  });

  return (
    <div className={clsx('content-wrapper')}>
      <div
        className={clsx(
          'flex flex-col gap-8',
          'md:flex-row md:gap-8 lg:gap-24'
        )}
      >
        <div className={clsx('md:w-64')}>{/* TODO: Filter Posts * /}</div>
        <div className={clsx('flex-1')}>
          {pinnedPost && (
            <div
              className={clsx(
                'mb-8 flex items-start gap-4',
                'md:mb-12 md:gap-6'
              )}
            >
              <div className={clsx('flex-1')}>
                <PostPreview
                  pinned
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
          )}

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





type TPostPreview = TPostFrontMatter & {
  slug: string;
  shares: number;
  views: number;
};


type PostPreviewProps = TPostFrontMatter & {
  slug: string;
  views: number;
  shares: number;
  pinned?: boolean;
};

function PostPreview({
  title,
  description,
  date,
  slug,
  lang,
  views,
  shares,
  pinned = false,
}: PostPreviewProps) {
  return (
    <article lang={lang}>
      <Link
        key={slug}
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
        {
          // shine effect 
        }
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
            <span>{formatLang(lang)}</span>
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
            'flex items-center gap-2 text-xs text-slate-600',
            'dark:text-slate-400',
            pinned ? ['mb-4', 'sm:mb-1'] : 'mb-4'
          )}
        >
          <InsightIcon className={clsx('-mt-0.5 h-4 w-4')} />
          <span className={clsx('flex gap-1.5')}>
            <span
              className={clsx('flex items-center gap-1.5')}
              title="Number of view(s)"
            >
              <CountUp from={0} to={views} /> Views
            </span>
            <span>&middot;</span>
            <span
              className={clsx('flex items-center gap-1.5')}
              title="Number of share(s)"
            >
              <CountUp from={0} to={shares} /> Shares
            </span>
          </span>
        </div>
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
*/