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
      <span
        data-section-heading
        className="relative group font-geist font-semibold uppercase tracking-wider text-xl md:text-2xl"
      >
        <span
          aria-hidden="true"
          className="absolute left-[-20px] top-1/2 -translate-y-1/2 hidden lg:block h-3 w-3 rounded-full bg-accent opacity-0 group-data-[active]:opacity-100 transition-opacity duration-300 pointer-events-none shadow-[0_0_8px_var(--accent)]"
        />
        {title}
      </span>
      {icon}
    </div>
  );
}
