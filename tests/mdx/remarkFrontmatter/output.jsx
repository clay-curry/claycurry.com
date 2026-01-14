/*@jsxRuntime automatic*/
/*@jsxImportSource react*/
export const frontmatter = {
  "title": "Test Page",
  "description": "A test page for frontmatter parsing",
  "author": "Clay Curry",
  "date": "2024-01-15",
  "tags": ["test", "mdx", "frontmatter"]
};
function _createMdxContent(props) {
  const _components = {
    h1: "h1",
    p: "p",
    ...props.components
  };
  return <><_components.h1>{"Hello World"}</_components.h1>{"\n"}<_components.p>{"This is a test MDX file with frontmatter."}</_components.p></>;
}
export default function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
}
