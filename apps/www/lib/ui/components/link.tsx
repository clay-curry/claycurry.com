import type { ReactNode } from "react";

export const PrimaryLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <a href={href} className="text-link hover:text-link-hover hover:underline">
    {children}
  </a>
);
