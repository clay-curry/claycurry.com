import clsx from 'clsx';
import { m } from 'framer-motion';

import type { ReactNode } from 'react';

const animation = {
  hide: { x: -32, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
  },
};

interface PageHeaderProps {
  title: string;
  description: string;
  caption?: string;
  headerImage?: ReactNode;
}

function PageHeaderA({
  title,
  description,
  caption = '',
  headerImage = null,
}: PageHeaderProps) {
  return (
    <section
      className={clsx(
        'pt-32 md:pt-40',
        'pb-40 md:pb-50',
        'mb-10 md:mb-0',
        'border-b md:border-none',
        'background-grid background-grid--fade-out border-divider-light',
        'dark:border-divider-dark'
      )}
    >
      {headerImage && (
        <div className={clsx('absolute right-0 top-8 bottom-0')}>
          {headerImage}
        </div>
      )}
      <div className={clsx('content-wrapper')}>
        {caption && (
          <m.div
            initial={animation.hide}
            animate={animation.show}
            transition={{ delay: 0 }}
          >
            <span
              className={clsx(
                'text-accent-600 mb-1 block text-lg font-extrabold capitalize leading-none',
                'md:mb-0 md:text-2xl',
                'dark:text-accent-400'
              )}
            >
              {caption}
            </span>
          </m.div>
        )}
        <m.div
          initial={animation.hide}
          animate={animation.show}
          transition={{ delay: 0.1 }}
        >
          <h1
            className={clsx(
              'text-[2.5rem] font-extrabold leading-tight text-slate-700',
              'md:text-7xl md:leading-snug',
              'dark:text-slate-300'
            )}
          >
            {title}
          </h1>
        </m.div>
        <m.div
          initial={animation.hide}
          animate={animation.show}
          transition={{ delay: 0.2 }}
        >
          <p
            className={clsx(
              'mt-4 text-lg ',
              'md:mt-6 md:text-2xl',
              'lg:max-w-[500px] xl:max-w-[650px]',
              'text-slate-600 dark:text-slate-400'
            )}
          >
            {description}
          </p>
        </m.div>
      </div>
    </section>
  );
}


export default PageHeaderA;
