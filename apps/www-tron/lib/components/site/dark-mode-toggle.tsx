"use client"

import { Lightbulb, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export function DarkModeToggle() {
  const [mode, setMode] = useState<"dark" | "light">("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("tron-mode") as "dark" | "light" | null
    if (stored === "light" || stored === "dark") {
      setMode(stored)
    }
  }, [])

  const toggleMode = () => {
    const next = mode === "dark" ? "light" : "dark"
    const html = document.documentElement
    // Disable all transitions so the mode switch is instant
    html.style.setProperty("transition", "none", "important")
    document.body.style.setProperty("transition", "none", "important")
    const all = document.querySelectorAll("*")
    all.forEach((el) => (el as HTMLElement).style.setProperty("transition", "none", "important"))
    html.classList.remove("dark", "light")
    html.classList.add(next)
    setMode(next)
    localStorage.setItem("tron-mode", next)
    // Re-enable transitions on the next frame
    requestAnimationFrame(() => {
      html.style.removeProperty("transition")
      document.body.style.removeProperty("transition")
      all.forEach((el) => (el as HTMLElement).style.removeProperty("transition"))
    })
  }

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-1.5 h-8 px-2.5 text-sm font-medium rounded-xl border border-border text-foreground bg-muted transition-colors"
      >
        <Moon className="size-3.5" />
      </button>
    )
  }

  return (
    <button
      type="button"
      data-click-id="nav:mode"
      onClick={toggleMode}
      title={`Mode: ${mode}. Click to toggle.`}
      className="inline-flex items-center gap-1.5 h-8 px-2.5 text-sm font-medium rounded-xl border border-border text-foreground bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
    >
      {mode === "dark" ? (
        <Moon className="size-3.5 text-foreground" />
      ) : (
        <Lightbulb className="size-3.5 text-foreground" />
      )}
    </button>
  )
}
