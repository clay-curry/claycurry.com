const tailwindMetadata = {
  slug: "tailwindcss-best-practices",
  title: "Tailwindcss Best Practices",
  lang:  'id',
  date: '2024-02-25',
  description:  'How programming language design will address the rise of indie developers, the limitations of large language models, and the vulnerabilities of front-end cloud. ',
  tags:  ['endofyear', ''],
  category: 'story',
  views: 13,
  shares: 1
}
const retrospectiveMetadata = {
  slug: "the-2024-retrospective",
  title: "The 2024 Retrospective",
  lang:  'id',
  date: '2024-02-25',
  description:  'How programming language design will address the rise of indie developers, the limitations of large language models, and the vulnerabilities of front-end cloud. ',
  tags:  ['endofyear', ''],
  category: 'story',
  views: 9,
  shares: 0
}
import { BlogHome } from './ui-client'

export default function Blog() {
  // network waterfall avoided because the module is statically generated at build time
  //const posts = await getPosts(path.join(process.cwd(), slug_dir))
  // const paths = posts.map(p => path.join(process.cwd(), `${slug_dir}/${p}`))
  // const data = Promise.all(paths.map(p => getPostData(p)))

  return (
    <BlogHome posts={[tailwindMetadata, retrospectiveMetadata]} />
  )
}