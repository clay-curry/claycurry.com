"use client";

import { cn } from "@/lib/utils";
import { ClickCountToggle } from "./click-count-toggle";
import { DarkModeToggle } from "./dark-mode-toggle";
import { ThemeToggle } from "./theme-toggle";

export function FloatingToolbar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 py-2 backdrop-blur supports-backdrop-filter:bg-background/60",
        className,
      )}
    >
      <ClickCountToggle />
      <DarkModeToggle />
      <ThemeToggle />
    </div>
  );
}
