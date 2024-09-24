import { getSortedPosts } from '@/app/_lib/posts';

import clsx from 'clsx';
import { m } from 'framer-motion';




import Page from '@/app/_lib/contents-layouts/Page';


function Blog({ posts }: BlogProps) {
  return (
    <Page
      frontMatter={{
        
      }}
      headerImage={<HeaderImage />}
    >
      
    </Page>
  );
}

export const getStaticProps: GetStaticProps<BlogProps> = async () => {
  const allPostsData = getSortedPosts();

  return {
    props: {
      posts: allPostsData,
    },
  };
};

export default Blog;
