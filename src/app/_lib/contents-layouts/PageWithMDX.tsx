import WithTableOfContents from '@/components/layouts/WithTableOfContents';
import SkipNavigation from '@/components/navigations/SkipNavigation';
import PageHeader from '@/components/PageHeader';

import type { TPageFrontMatter, TTableOfContents } from '@/utils/types';
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
