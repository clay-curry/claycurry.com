"use client"

import { Lightbulb } from "lucide-react"
import { useEffect, useState } from "react"

function LightbulbRays({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      overflow="visible"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 1V-1" />
      <path d="M5 8H3" />
      <path d="M19 8H21" />
      <path d="M7 3L5.5 1.5" />
      <path d="M17 3L18.5 1.5" />
    </svg>
  );
}

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
        <Lightbulb className="size-3.5" />
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
        <Lightbulb className="size-3.5 text-foreground" />
      ) : (
        <LightbulbRays className="size-3.5 text-foreground" />
      )}
    </button>
  )
}
