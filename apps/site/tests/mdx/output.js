import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
export const frontmatter = {
  "slug": "test-page",
  "published": "false",
  "date": "1 Jan 3000",
  "title": "Test Page",
  "subtitle": "A placeholder for testing",
  "prefix": "This is a test page used for testing purposes only.",
  "tags": ["Testing", "Compilation"]
};
function _createMdxContent(props) {
  const _components = {
    h1: "h1",
    h2: "h2",
    h3: "h3",
    p: "p",
    ...props.components
  }, {Summary} = _components;
  if (!Summary) _missingMdxReference("Summary", true);
  return _jsxs(_Fragment, {
    children: [_jsx(_components.p, {
      children: "// cspell:disable"
    }), "\n", _jsx(_components.h1, {
      children: "Test Page"
    }), "\n", _jsx(Summary, {
      children: _jsx(_components.p, {
        children: "This is a test page used for testing purposes only."
      })
    }), "\n", _jsx(_components.h2, {
      children: "1. Section"
    }), "\n", _jsx(_components.p, {
      children: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    }), "\n", _jsx(_components.h3, {
      children: "1.1. Sub-section"
    }), "\n", _jsx(_components.p, {
      children: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    }), "\n", _jsx(_components.h3, {
      children: "1.2. Another Sub-section"
    }), "\n", _jsx(_components.p, {
      children: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    }), "\n", _jsx(_components.h2, {
      children: "2. Another Section"
    }), "\n", _jsx(_components.p, {
      children: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
    }), "\n", _jsx(_components.h3, {
      children: "2.1. Sub-section"
    }), "\n", _jsx(_components.p, {
      children: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    }), "\n", _jsx(_components.h2, {
      children: "3. Final Section"
    })]
  });
}
export default function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? _jsx(MDXLayout, {
    ...props,
    children: _jsx(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}
function _missingMdxReference(id, component) {
  throw new Error("Expected " + (component ? "component" : "object") + " `" + id + "` to be defined: you likely forgot to import, pass, or provide it.");
}
