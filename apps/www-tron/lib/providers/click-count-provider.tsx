"use client";

import type { ReactNode } from "react";
import { ClickCountOverlay } from "@/lib/components/site/click-count-overlay";
import { useClickCountEngine } from "@/lib/hooks/use-click-counts";

export function ClickCountProvider({ children }: { children: ReactNode }) {
  useClickCountEngine();
  return (
    <>
      {children}
      <ClickCountOverlay />
    </>
  );
}
