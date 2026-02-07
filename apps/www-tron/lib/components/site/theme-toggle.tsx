"use client"

import { Palette } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/lib/components/ui/button"

const themePresets = ["cyan", "orange", "gold", "red", "green"] as const
type ThemePreset = (typeof themePresets)[number]

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemePreset>("cyan")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("tron-theme") as ThemePreset | null
    if (stored && themePresets.includes(stored)) {
      setTheme(stored)
    }
  }, [])

  const cycleTheme = () => {
    const currentIndex = themePresets.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themePresets.length
    const next = themePresets[nextIndex]

    const html = document.documentElement
    for (const p of themePresets) {
      html.classList.remove(`theme-${p}`)
    }
    html.classList.add(`theme-${next}`)
    setTheme(next)
    localStorage.setItem("tron-theme", next)
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Palette className="size-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycleTheme}
      title={`Theme: ${theme}. Click to cycle.`}
    >
      <Palette className="size-4" />
      <span className="sr-only">Toggle color theme</span>
    </Button>
  )
}
