import { PropsWithChildren } from 'react';

import WithTableOfContents from '@/app/(site)/WithTableOfContents';
import PageHeader from '@/app/(site)/PageHeader';

import { getPostOgImageUrl, getPostStructuredData } from '@/utils/post';

import PostFooter from '@/components/contents-layouts/Post/PostFooter';
import PostMeta from '@/components/contents-layouts/Post/PostMeta';

import type { TPostFrontMatter, TTableOfContents } from '@/utils/types';

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
      { /*
        <Head
        title={title}
        description={description}
        ogImage={postOgImages.default}
        structuredData={structuredData}
      />
      */
      }
      <PageHeader title={title} description={description} caption={caption} />
      <PostMeta date={date} lang={lang} />
      <WithTableOfContents tableOfContents={tableOfContents}>
        {children}
        <PostFooter tags={tags} category={category} />
      </WithTableOfContents>
    </>
  );
}

export default Post;
