import WithReactions from '@/app/_components/layouts/WithReactions';
import WithTableOfContents from '@/app/_components/layouts/WithTableOfContents';
import SkipNavigation from '@/app/_components/navigations/SkipNavigation';
import PageHeader from '@/app/_components/PageHeader';
import ProjectFooter from '@/contents-layouts/Project/ProjectFooter';
import ProjectMeta from '@/contents-layouts/Project/ProjectMeta';

import type { TProjectFrontMatter, TTableOfContents } from '@/app/_utils/types';
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
