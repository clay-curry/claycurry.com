import type React from "react";

export function SectionHeader({
  title,
  icon,
}: {
  title: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 my-6">
      {icon}
      <span className="font-tourney font-semibold uppercase tracking-wider text-xl md:text-2xl">
        {title}
      </span>
      <div className="w-3 h-px bg-foreground rounded-full" />
    </div>
  );
}
