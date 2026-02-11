"use client";

import { ClickCountToggle } from "./click-count-toggle";
import { DarkModeToggle } from "./dark-mode-toggle";
import { ThemeToggle } from "./theme-toggle";

export function FloatingToolbar() {
  return (
    <div className="sticky top-16 z-20 flex items-center gap-2 px-4 py-2 w-fit backdrop-blur supports-backdrop-filter:bg-background/60">
      <ClickCountToggle />
      <DarkModeToggle />
      <ThemeToggle />
    </div>
  );
}
