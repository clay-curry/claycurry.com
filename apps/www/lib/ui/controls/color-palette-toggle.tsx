"use client";

// TODO: Use the color selector toggle to cycle between completely different color schemes
// - Replace current neutral palettes with distinct M3 color schemes
// - Reference: https://m3.material.io/styles/color/roles
// - Consider schemes like: tonal, vibrant, expressive, content-based

import { Palette } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/lib/ui/controls/button";

const colorPalettes = ["zinc", "stone", "slate", "neutral", "gray"] as const;
type ColorPalette = (typeof colorPalettes)[number];

export function ColorPaletteToggle() {
  const [palette, setPalette] = useState<ColorPalette>("zinc");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const html = document.documentElement;

    // First check localStorage
    const stored = localStorage.getItem("color-palette") as ColorPalette | null;
    if (stored && colorPalettes.includes(stored)) {
      // Apply stored palette
      for (const p of colorPalettes) {
        html.classList.remove(`theme-${p}`);
      }
      html.classList.add(`theme-${stored}`);
      setPalette(stored);
      return;
    }

    // Otherwise check existing class on html element
    for (const p of colorPalettes) {
      if (html.classList.contains(`theme-${p}`)) {
        setPalette(p);
        return;
      }
    }

    // Default to zinc if nothing set
    html.classList.add("theme-zinc");
    setPalette("zinc");
  }, []);

  const cyclePalette = () => {
    const currentIndex = colorPalettes.indexOf(palette);
    const nextIndex = (currentIndex + 1) % colorPalettes.length;
    const nextPalette = colorPalettes[nextIndex];

    // Remove all palette classes and add the new one
    const html = document.documentElement;
    for (const p of colorPalettes) {
      html.classList.remove(`theme-${p}`);
    }
    html.classList.add(`theme-${nextPalette}`);
    setPalette(nextPalette);

    // Persist to localStorage
    localStorage.setItem("color-palette", nextPalette);
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Palette className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cyclePalette}
      title={`Color palette: ${palette}. Click to cycle.`}
    >
      <Palette className="size-4" />
      <span className="sr-only">Toggle color palette</span>
    </Button>
  );
}
