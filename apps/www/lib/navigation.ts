import fs from "node:fs";
import path from "node:path";

export type NavLink = { label: string; href: string };

// Presentation config: maps filesystem segments to nav display.
// Order here = order in nav. Only listed segments appear.
const navRoutes = [
  { segment: "", label: "about", href: "/" },
  { segment: "resume", label: "resume" },
  { segment: "blog", label: "writing", href: "/writing" },
  { segment: "contact", label: "contact" },
];

const APP_DIR = process.cwd();
const ROUTE_GROUPS = ["(portfolio)", "(resume)"];

export function getSiteNavLinks(): NavLink[] {
  return navRoutes
    .filter((route) => {
      return ROUTE_GROUPS.some((group) => {
        const dir =
          route.segment === ""
            ? path.join(APP_DIR, "app", group)
            : path.join(APP_DIR, "app", group, route.segment);
        return ["page.tsx", "page.ts", "page.jsx", "page.js"].some((f) =>
          fs.existsSync(path.join(dir, f)),
        );
      });
    })
    .map((route) => ({
      label: route.label,
      href: route.href ?? `/${route.segment}`,
    }));
}
