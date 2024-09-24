import WithTableOfContents from '@/app/_lib/components/layouts/WithTableOfContents';
import SkipNavigation from '@/app/_lib/components/navigations/SkipNavigation';
import PageHeader from '@/app/_lib/components/PageHeader';

import type { TPageFrontMatter, TTableOfContents } from '@/app/_lib/utils/types';
import type { PropsWithChildren } from 'react';

interface PageWithMDXProps {
  frontMatter: TPageFrontMatter;
  tableOfContents: TTableOfContents;
}

function PageWithMDX({
  frontMatter: { title, description, caption },
  tableOfContents,
  children = null,
}: PropsWithChildren<PageWithMDXProps>) {
  return (
    <>
      <SkipNavigation />
      <PageHeader title={title} description={description} caption={caption} />
      <WithTableOfContents tableOfContents={tableOfContents}>
        {children}
      </WithTableOfContents>
    </>
  );
}

export default PageWithMDX;
