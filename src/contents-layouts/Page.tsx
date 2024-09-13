import clsx from 'clsx';

import SkipNavigation from '@/app/_components/navigations/SkipNavigation';
import PageHeader from '@/app/_components/PageHeader';
import type { TPageFrontMatter } from '@/app/_utils/types';
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
      <SkipNavigation skipTableOfContents={false} />
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
