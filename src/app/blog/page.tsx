export default function Blog() {
  // network waterfall avoided because the module is statically generated at build time
  //const posts = await getPosts(path.join(process.cwd(), slug_dir))
  // const paths = posts.map(p => path.join(process.cwd(), `${slug_dir}/${p}`))
  // const data = Promise.all(paths.map(p => getPostData(p)))

  return (
    <div>
      Blog
    </div>
  )
}