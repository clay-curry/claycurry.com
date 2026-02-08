"use client"

import { Cloud, CloudDrizzle, CloudLightning, Sun } from "lucide-react"
import { useEffect, useState } from "react"

const weatherStates = ["sunny", "overcast", "rain", "storm"] as const
type WeatherState = (typeof weatherStates)[number]

const weatherIcons = {
  sunny: Sun,
  overcast: Cloud,
  rain: CloudDrizzle,
  storm: CloudLightning,
} as const

const weatherLabels = {
  sunny: "Sunny",
  overcast: "Overcast",
  rain: "Light rain",
  storm: "Downpour with lightning",
} as const

export function WeatherToggle() {
  const [weather, setWeather] = useState<WeatherState>("sunny")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("tron-weather") as WeatherState | null
    if (stored && weatherStates.includes(stored)) {
      setWeather(stored)
    }
  }, [])

  const cycleWeather = () => {
    const currentIndex = weatherStates.indexOf(weather)
    const nextIndex = (currentIndex + 1) % weatherStates.length
    const next = weatherStates[nextIndex]
    setWeather(next)
    localStorage.setItem("tron-weather", next)
  }

  const Icon = weatherIcons[weather]

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-1.5 h-8 px-2.5 text-sm font-medium rounded-xl border border-border text-foreground bg-muted transition-colors"
      >
        <Sun className="size-3.5" />
      </button>
    )
  }

  return (
    <button
      type="button"
      data-click-id="nav:weather"
      onClick={cycleWeather}
      title={`Weather: ${weatherLabels[weather]}. Click to cycle.`}
      className="inline-flex items-center gap-1.5 h-8 px-2.5 text-sm font-medium rounded-xl border border-border text-foreground bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
    >
      <Icon className="size-3.5 text-foreground" />
    </button>
  )
}
