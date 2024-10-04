import WithTableOfContents from '@/app/WithTableOfContents';
import PageHeader from '@/app/PageHeader';

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
      <PageHeader title={title} description={description} caption={caption} />
      <WithTableOfContents tableOfContents={tableOfContents}>
        {children}
      </WithTableOfContents>
    </>
  );
}

export default PageWithMDX;
