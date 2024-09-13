import { PropsWithChildren } from 'react';

import WithReactions from '@/app/_components/layouts/WithReactions';
import WithTableOfContents from '@/app/_components/layouts/WithTableOfContents';
import SkipNavigation from '@/app/_components/navigations/SkipNavigation';
import PageHeader from '@/app/_components/PageHeader';

import { getPostOgImageUrl, getPostStructuredData } from '@/app/_helpers/post';

import PostFooter from '@/contents-layouts/Post/PostFooter';
import PostMeta from '@/contents-layouts/Post/PostMeta';

import type { TPostFrontMatter, TTableOfContents } from '@/app/_utils/types';

interface PostProps {
  frontMatter: TPostFrontMatter;
  tableOfContents: TTableOfContents;
}

function Post({
  frontMatter: { title, description, caption, category, date, lang, tags },
  tableOfContents,
  children = null,
}: PropsWithChildren<PostProps>) {
  // get og image urls
  const postOgImages = getPostOgImageUrl({
    category: caption || category,
    title,
    date,
    lang,
    tags,
  });

  // get structured data
  const structuredData = getPostStructuredData({
    title,
    dateModified: date,
    datePublished: date,
    images: [postOgImages['1/1'], postOgImages['4/3'], postOgImages['16/9']],
  });

  return (
    <>
      <Head
        title={title}
        description={description}
        ogImage={postOgImages.default}
        structuredData={structuredData}
      />
      <SkipNavigation />
      <PageHeader title={title} description={description} caption={caption} />
      <PostMeta date={date} lang={lang} />
      <WithTableOfContents tableOfContents={tableOfContents}>
        {children}
        <PostFooter tags={tags} category={category} />
      </WithTableOfContents>
      <WithReactions contentTitle={title} contentType="POST" />
    </>
  );
}

export default Post;
