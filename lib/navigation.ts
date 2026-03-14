export type NavLink = { label: string; href: string };

// Order here = order in nav.
const navLinks: NavLink[] = [
  { label: "about", href: "/" },
  { label: "resume", href: "/resume" },
  { label: "work", href: "/work" },
  { label: "writing", href: "/writing" },
  { label: "contact", href: "/contact" },
];

export function getSiteNavLinks(): NavLink[] {
  return navLinks;
}
