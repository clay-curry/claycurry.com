import clsx from 'clsx';

import PageHeader from '@/app/(site)/PageHeader';
import type { TPageFrontMatter } from '@/utils/types';
import type { PropsWithChildren, ReactNode } from 'react';

export default function Page({
  frontMatter,
  children = null,
  headerImage = null,
}: PropsWithChildren<{
  frontMatter: TPageFrontMatter;
  headerImage?: ReactNode;
}>) {
  const { title, description, caption } = frontMatter;

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        caption={caption}
        headerImage={headerImage}
      />
      <div className={clsx('scroll-mt-[86px]')} id="main-contents">
        {children}
      </div>
    </>
  );
}