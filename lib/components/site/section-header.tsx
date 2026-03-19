import type React from "react";

export function SectionHeader({
  title,
  icon,
}: {
  title: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 md:gap-3 my-3 border-b border-primary/30 pb-2">
      {icon}
      <span className="font-geist font-semibold uppercase tracking-wider text-xl md:text-2xl">
        {title}
      </span>
    </div>
  );
}
