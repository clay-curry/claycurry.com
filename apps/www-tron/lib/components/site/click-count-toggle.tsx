"use client"

import { useAtom } from "jotai"
import { Switch } from "@/lib/components/ui/switch"
import { clickCountsEnabledAtom } from "@/lib/hooks/use-click-counts"

export function ClickCountToggle() {
  const [enabled, setEnabled] = useAtom(clickCountsEnabledAtom)

  return (
    <label className="flex items-center gap-2 text-muted-foreground text-sm cursor-pointer">
      <Switch size="sm" checked={enabled} onCheckedChange={setEnabled} />
      Click Counts
    </label>
  )
}
