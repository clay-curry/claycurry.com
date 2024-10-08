import clsx from 'clsx';

import PageHeader from '@/app/(site)/PageHeader';
import type { TPageFrontMatter } from '@/utils/types';
import type { PropsWithChildren, ReactNode } from 'react';

interface PageProps {
  frontMatter: TPageFrontMatter;
  headerImage?: ReactNode;
}

function Page({
  frontMatter: { title, description, caption },
  children = null,
  headerImage = null,
}: PropsWithChildren<PageProps>) {

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

export default Page;
