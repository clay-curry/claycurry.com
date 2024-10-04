import clsx from 'clsx';
import React from 'react';

export default function MdxLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      className={clsx(
        'border-b',
        'pb-40 md:pb-50',
        'mb-10 md:mb-0',
        'border-divider-light dark:border-divider-dark',
        'bg-slate-100 dark:bg-[#0c1222]',
        'background-grid--fade-out'
      )}
    >
      <section className="content-wrapper">{children}</section>
    </main>
  );
}
