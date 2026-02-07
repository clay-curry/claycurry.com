"use client"

import type { ReactNode } from "react"
import { useClickCountEngine } from "@/lib/hooks/use-click-counts"
import { ClickCountOverlay } from "@/lib/components/site/click-count-overlay"

export function ClickCountProvider({ children }: { children: ReactNode }) {
  useClickCountEngine()
  return (
    <>
      {children}
      <ClickCountOverlay />
    </>
  )
}
