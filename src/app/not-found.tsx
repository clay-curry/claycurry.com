import Link from 'next/link';
import clsx from 'clsx';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'Page Not Found',
  robots: 'noindex',
}

export default () => (
  <div
    className={clsx(
      'background-grid flex h-full items-center justify-center'
    )}
  >
    <div
      className={clsx(
        'content-wrapper text-center text-slate-600',
        'dark:text-slate-400'
      )}
    >
      <h1 className={clsx('py-12 text-center')}>
        <div className={clsx('mb-3 text-8xl font-extrabold')}>404</div>
        <div className={clsx('text-2xl')}> Page Not Found </div>
      </h1>
      <Link
        href="/"
        className={clsx(
          'rounded-xl py-2 px-4 text-xl text-accent-600',
          'dark:text-accent-400'
        )}
      >
        back to homepage
      </Link>
    </div>
  </div>
);