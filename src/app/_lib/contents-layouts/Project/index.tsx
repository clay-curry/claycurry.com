import WithTableOfContents from '@/app/WithTableOfContents';
import PageHeader from '@/app/PageHeader';
import ProjectFooter from '@/app/_lib/contents-layouts/Project/ProjectFooter';
import ProjectMeta from '@/app/_lib/contents-layouts/Project/ProjectMeta';

import type { TProjectFrontMatter, TTableOfContents } from '@/utils/types';
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
      <PageHeader title={title} description={description} caption={caption} />
      <ProjectMeta githubUrl={githubUrl} npmUrl={npmUrl} />
      <WithTableOfContents tableOfContents={tableOfContents}>
        {children}
        <ProjectFooter githubUrl={githubUrl} />
      </WithTableOfContents>
    </>
  );
}

export default ProjectLayout;
