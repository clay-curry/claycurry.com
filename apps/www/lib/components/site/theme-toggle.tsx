"use client";

import { Palette } from "lucide-react";
import { useEffect, useState } from "react";

const themePresets = ["cyan", "orange", "red", "green", "gray"] as const;
type ThemePreset = (typeof themePresets)[number];

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemePreset>("green");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("tron-theme") as ThemePreset | null;
    if (stored && themePresets.includes(stored)) {
      setTheme(stored);
    }
  }, []);

  const cycleTheme = () => {
    const currentIndex = themePresets.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themePresets.length;
    const next = themePresets[nextIndex];

    const html = document.documentElement;
    for (const p of themePresets) {
      html.classList.remove(`theme-${p}`);
    }
    html.classList.add(`theme-${next}`);
    setTheme(next);
    localStorage.setItem("tron-theme", next);
  };

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-1.5 h-8 px-2.5 text-sm font-medium rounded-xl border border-border text-foreground bg-muted transition-colors"
      >
        <Palette className="size-3.5 text-accent" />
      </button>
    );
  }

  return (
    <button
      type="button"
      data-click-id="nav:theme"
      onClick={cycleTheme}
      title={`Theme: ${theme}. Click to cycle.`}
      className="inline-flex items-center gap-1.5 h-8 px-2.5 text-sm font-medium rounded-xl border border-border text-foreground bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
    >
      <Palette className="size-3.5 text-accent" />
    </button>
  );
}
