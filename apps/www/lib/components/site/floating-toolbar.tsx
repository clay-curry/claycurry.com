"use client";

import { ClickCountToggle } from "./click-count-toggle";
import { DarkModeToggle } from "./dark-mode-toggle";
import { ThemeToggle } from "./theme-toggle";

export function FloatingToolbar() {
  return (
    <div className="flex items-center gap-2">
      <ClickCountToggle />
      <DarkModeToggle />
      <ThemeToggle />
    </div>
  );
}
