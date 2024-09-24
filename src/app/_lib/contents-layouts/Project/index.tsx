import WithReactions from '@/app/_lib/components/layouts/WithReactions';
import WithTableOfContents from '@/app/_lib/components/layouts/WithTableOfContents';
import SkipNavigation from '@/app/_lib/components/navigations/SkipNavigation';
import PageHeader from '@/app/_lib/components/PageHeader';
import ProjectFooter from '@/app/_lib/contents-layouts/Project/ProjectFooter';
import ProjectMeta from '@/app/_lib/contents-layouts/Project/ProjectMeta';

import type { TProjectFrontMatter, TTableOfContents } from '@/app/_lib/utils/types';
import type { PropsWithChildren } from 'react';

interface ProjectLayoutProps {
  frontMatter: TProjectFrontMatter;
  tableOfContents: TTableOfContents;
}

function ProjectLayout({
  frontMatter: { title, description, caption, githubUrl, npmUrl },
  tableOfContents,
  children = null,
}: PropsWithChildren<ProjectLayoutProps>) {
  return (
    <>
      <SkipNavigation />
      <PageHeader title={title} description={description} caption={caption} />
      <ProjectMeta githubUrl={githubUrl} npmUrl={npmUrl} />
      <WithTableOfContents tableOfContents={tableOfContents}>
        {children}
        <ProjectFooter githubUrl={githubUrl} />
      </WithTableOfContents>
      <WithReactions contentTitle={title} contentType="PROJECT" />
    </>
  );
}

export default ProjectLayout;
