import type { ReactNode } from "react";

export const PrimaryLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline">
    {children}
  </a>
);
