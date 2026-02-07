"use client"

import { Contrast } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const contrastLevels = ["medium", "low", "high"] as const
type ContrastLevel = (typeof contrastLevels)[number]

const iconStyle = {
  medium: "text-foreground [&_circle]:opacity-0",
  low: "text-foreground [&_path]:opacity-0",
  high: "text-foreground",
} as const

export function ContrastToggle() {
  const [contrast, setContrast] = useState<ContrastLevel>("medium")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("tron-contrast") as ContrastLevel | null
    if (stored && contrastLevels.includes(stored)) {
      setContrast(stored)
    }
  }, [])

  const cycleContrast = () => {
    const currentIndex = contrastLevels.indexOf(contrast)
    const next = contrastLevels[(currentIndex + 1) % contrastLevels.length]
    const html = document.documentElement
    // Disable transitions for instant switch
    const all = document.querySelectorAll("*")
    html.style.setProperty("transition", "none", "important")
    all.forEach((el) => (el as HTMLElement).style.setProperty("transition", "none", "important"))
    html.classList.remove("contrast-low", "contrast-high")
    if (next !== "medium") {
      html.classList.add(`contrast-${next}`)
    }
    setContrast(next)
    localStorage.setItem("tron-contrast", next)
    requestAnimationFrame(() => {
      html.style.removeProperty("transition")
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
        <Contrast className="size-3.5" />
      </button>
    )
  }

  return (
    <button
      type="button"
      data-click-id="nav:contrast"
      onClick={cycleContrast}
      title={`Contrast: ${contrast}. Click to cycle.`}
      className="inline-flex items-center gap-1.5 h-8 px-2.5 text-sm font-medium rounded-xl border border-border text-foreground bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
    >
      <Contrast className={cn("size-3.5", iconStyle[contrast])} />
    </button>
  )
}
