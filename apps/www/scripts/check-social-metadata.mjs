import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = dirname(scriptDir);
const canonicalOrigin = "https://www.claycurry.com";
const errors = [];
const slugTemplate = "$" + "{slug}";

function read(pathFromAppRoot) {
  const absolutePath = join(appRoot, pathFromAppRoot);

  if (!existsSync(absolutePath)) {
    errors.push(`Missing required file: ${pathFromAppRoot}`);
    return "";
  }

  return readFileSync(absolutePath, "utf8");
}

function assertIncludes(content, expected, message) {
  if (!content.includes(expected)) {
    errors.push(message);
  }
}

function assertNotIncludes(content, forbidden, message) {
  if (content.includes(forbidden)) {
    errors.push(message);
  }
}

const siteUrl = read("lib/site-url.ts");
assertIncludes(
  siteUrl,
  `SITE_ORIGIN = "${canonicalOrigin}"`,
  "SITE_ORIGIN must use the canonical www host.",
);

const rootLayout = read("app/layout.tsx");
assertIncludes(
  rootLayout,
  "metadataBase: new URL(SITE_ORIGIN)",
  "Root metadata must set metadataBase from SITE_ORIGIN.",
);
assertIncludes(
  rootLayout,
  'url: "/opengraph-image"',
  "Root metadata must include a static openGraph image.",
);
assertIncludes(
  rootLayout,
  'url: "/twitter-image"',
  "Root metadata must include a static twitter image.",
);
assertIncludes(
  rootLayout,
  'card: "summary_large_image"',
  "Root metadata must use summary_large_image twitter cards.",
);
assertNotIncludes(
  rootLayout,
  "https://claycurry.com",
  "Root metadata must not hardcode the apex host.",
);

const blogPage = read("app/(blog-post)/blog/[slug]/page.tsx");
assertIncludes(
  blogPage,
  `const articlePath = \`/blog/${slugTemplate}\``,
  "Blog metadata must set a canonical article path.",
);
assertIncludes(
  blogPage,
  "alternates:",
  "Blog metadata must define canonical alternates.",
);
assertIncludes(
  blogPage,
  'type: "article"',
  "Blog metadata must mark openGraph type as article.",
);
assertIncludes(
  blogPage,
  'card: "summary_large_image"',
  "Blog metadata must use summary_large_image twitter cards.",
);
assertNotIncludes(
  blogPage,
  "https://claycurry.com",
  "Blog metadata must not hardcode the apex host.",
);

const rootTwitterImage = read("app/twitter-image.tsx");
assertIncludes(
  rootTwitterImage,
  'from "./opengraph-image"',
  "Root twitter-image route must exist and source the OG image renderer.",
);

const blogTwitterImage = read("app/(blog-post)/blog/[slug]/twitter-image.tsx");
assertIncludes(
  blogTwitterImage,
  'from "./opengraph-image"',
  "Blog twitter-image route must exist and source the OG image renderer.",
);

if (errors.length > 0) {
  console.error("Social metadata checks failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Social metadata checks passed.");
