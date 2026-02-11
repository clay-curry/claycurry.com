"use client";

import { useAtom } from "jotai";
import { Mouse } from "lucide-react";
import { clickCountsEnabledAtom } from "@/lib/hooks/use-click-counts";
import { cn } from "@/lib/utils";

export function ClickCountToggle() {
  const [enabled, setEnabled] = useAtom(clickCountsEnabledAtom);

  return (
    <button
      type="button"
      onClick={() => setEnabled(!enabled)}
      aria-label="Toggle click counts"
      aria-pressed={enabled}
      data-click-id="nav:clicks"
      className="group inline-flex items-center gap-1.5 h-8 px-2.5 text-sm font-medium rounded-xl border border-border text-foreground bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
    >
      <Mouse
        className={cn("size-3.5", enabled ? "text-accent" : "text-foreground")}
      />
    </button>
  );
}
