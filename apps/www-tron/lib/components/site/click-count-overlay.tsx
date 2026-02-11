"use client";

import { useAtomValue } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  clickCountsAtom,
  clickCountsEnabledAtom,
} from "@/lib/hooks/use-click-counts";

interface Badge {
  id: string;
  x: number;
  y: number;
  count: number;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function ClickCountOverlay() {
  const enabled = useAtomValue(clickCountsEnabledAtom);
  const counts = useAtomValue(clickCountsAtom);
  const [badges, setBadges] = useState<Badge[]>([]);
  const rafRef = useRef(0);

  const measure = useCallback(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-click-id]");
    const next: Badge[] = [];

    for (const el of els) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const id = el.getAttribute("data-click-id")!;
      next.push({
        id,
        x: rect.right,
        y: rect.top,
        count: counts[id] ?? 0,
      });
    }

    setBadges(next);
  }, [counts]);

  // Measure on scroll/resize and mutation when enabled
  useEffect(() => {
    if (!enabled) {
      setBadges([]);
      return;
    }

    measure();

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 150);
    };

    const observer = new MutationObserver(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    });

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
      clearTimeout(resizeTimer);
    };
  }, [enabled, measure]);

  if (!enabled) return null;

  return (
    <div
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 50 }}
      aria-hidden="true"
    >
      {badges.map((b) => (
        <span
          key={b.id}
          className="absolute font-mono text-[10px] leading-none bg-primary/80 text-primary-foreground px-1.5 py-0.5 rounded-full"
          style={{
            left: b.x,
            top: b.y,
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 8px hsl(var(--primary) / 0.4)",
          }}
        >
          {formatCount(b.count)}
        </span>
      ))}
    </div>
  );
}
