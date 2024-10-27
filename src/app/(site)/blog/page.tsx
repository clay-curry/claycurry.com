import { BlogHome } from './ui-client'

const understandingWebpack = {
  slug: "understanding-webpack",
  title: "Understanding Webpack",
  lang:  'id',
  date: '2024-02-25',
  description:  'Modern websites are founded on the ability to ship massive artifacts of code at scale. Monolith codebases are ' +
   'easier to distribute but significantly harder to understand, maintain, and iterate.',
  tags:  ['endofyear', ''],
  category: 'story',
  views: 13,
  shares: 1
}

const retrospectiveMetadata = {
  slug: "refactoring-to-react-patterns",
  title: "Refactoring to (React 19) Patterns",
  lang:  'id',
  date: '2024-02-25',
  description:  'Offers a catalog of modern design-level refactorings in the spirit of ' + 
  'Kerievsky\'s "Refactoring to Patterns" book. Updated for React 19.',
  tags:  ['endofyear', ''],
  category: 'story',
  views: 9,
  shares: 0
}

export default function Blog() {
  // network waterfall avoided because the module is statically generated at build time
  //const posts = await getPosts(path.join(process.cwd(), slug_dir))
  // const paths = posts.map(p => path.join(process.cwd(), `${slug_dir}/${p}`))
  // const data = Promise.all(paths.map(p => getPostData(p)))

  return (
    <BlogHome posts={[understandingWebpack, retrospectiveMetadata]} />
  )
}