"use client";

import { useAtom } from "jotai";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { weatherAtom } from "@/lib/hooks/use-weather";

const SUPPRESSED_ROUTES = ["/resume"];
const LOOP_S = 60;

// Durations (seconds) that divide 60 evenly → clean 60-second loop
const FALL_DUR = [0.5, 0.6, 0.75, 1.0, 1.2, 1.5];
const FALL_DUR_FAST = [0.5, 0.6, 0.75];
const SWAY_DUR = [2.0, 2.5, 3.0, 4.0, 5.0, 6.0];
const FLOAT_DUR = [6, 10, 12, 15, 20];
const CLOUD_DUR = [15, 20, 30];

// Deterministic PRNG (avoids hydration mismatch)
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

// ─── Drop type ───────────────────────────────────────────────────────────────

type DropData = {
  id: number;
  left: string;
  delay: string;
  fallDur: string;
  swayDur: string;
  swayDelay: string;
  height: number;
  opacity: number;
  angle: number;
  swayAmp: string;
};

// ─── Particle generators ─────────────────────────────────────────────────────

function genSunParticles(count: number) {
  const rand = seededRandom(42);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${rand() * 100}%`,
    bottom: `${rand() * -10}%`,
    delay: `${(rand() * 12).toFixed(1)}s`,
    duration: `${pick(FLOAT_DUR, rand)}s`,
    size: 3 + rand() * 3,
    wx: `${(rand() - 0.5) * 40}px`,
    wdx: `${(rand() - 0.5) * 30}px`,
    opacity: 0.08 + rand() * 0.07,
  }));
}

function genClouds(count: number) {
  const rand = seededRandom(77);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: `${10 + rand() * 50}%`,
    delay: `${(rand() * 20).toFixed(1)}s`,
    duration: `${pick(CLOUD_DUR, rand)}s`,
    width: 150 + rand() * 150,
    height: 60 + rand() * 60,
    opacity: 0.03 + rand() * 0.03,
    blur: 30 + rand() * 20,
  }));
}

function genRainDrops(count: number, seed = 123): DropData[] {
  const rand = seededRandom(seed);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${rand() * 120 - 10}%`,
    delay: `${(rand() * 4).toFixed(2)}s`,
    fallDur: `${pick(FALL_DUR, rand)}s`,
    swayDur: `${pick(SWAY_DUR, rand)}s`,
    swayDelay: `${(rand() * 3).toFixed(2)}s`,
    height: 12 + rand() * 8,
    opacity: 0.12 + rand() * 0.1,
    angle: 5 + rand() * 20,
    swayAmp: `${8 + rand() * 16}px`,
  }));
}

function genStormDrops(count: number): DropData[] {
  const rand = seededRandom(999);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${rand() * 130 - 15}%`,
    delay: `${(rand() * 3).toFixed(2)}s`,
    fallDur: `${pick(FALL_DUR_FAST, rand)}s`,
    swayDur: `${pick(SWAY_DUR, rand)}s`,
    swayDelay: `${(rand() * 2).toFixed(2)}s`,
    height: 15 + rand() * 10,
    opacity: 0.15 + rand() * 0.13,
    angle: 8 + rand() * 25,
    swayAmp: `${10 + rand() * 22}px`,
  }));
}

// ─── Lightning sequence (pre-computed, 60 s period) ─────────────────────────

type SubFlash = {
  delayMs: number;
  intensity: number;
  durationMs: number;
  x: number;
  y: number;
  spreadX: number;
  spreadY: number;
};

type LightningEvent = {
  timeMs: number;
  subs: SubFlash[];
  shake: number;
};

const LIGHTNING_SEQ: LightningEvent[] = (() => {
  const rand = seededRandom(314159);
  // Irregular spacing with occasional rapid clusters
  const times = [
    1.8,
    4.2, 4.6,
    9.3,
    14.7, 15.1,
    21.5,
    26.8,
    31.2, 31.9, 32.4,
    38.6,
    43.1,
    48.9, 49.5,
    55.3,
    58.1,
  ];

  return times.map((t) => {
    const n = 1 + Math.floor(rand() * 4);
    const subs: SubFlash[] = [];
    let acc = 0;
    for (let j = 0; j < n; j++) {
      acc += j === 0 ? 0 : 40 + Math.floor(rand() * 120);
      subs.push({
        delayMs: acc,
        intensity: 0.04 + rand() * 0.18,
        durationMs: 40 + Math.floor(rand() * 100),
        x: 10 + rand() * 80,
        y: 5 + rand() * 50,
        spreadX: 30 + rand() * 60,
        spreadY: 20 + rand() * 50,
      });
    }
    return { timeMs: t * 1000, subs, shake: 0.5 + rand() * 1.5 };
  });
})();

// ─── Effect sub-components ───────────────────────────────────────────────────

function SunnyEffect() {
  const particles = useMemo(() => genSunParticles(15), []);

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={
            {
              left: p.left,
              bottom: p.bottom,
              width: p.size,
              height: p.size,
              background: `radial-gradient(circle, var(--accent-2), transparent)`,
              animation: `weather-float ${p.duration} ${p.delay} linear infinite`,
              "--wx": p.wx,
              "--wdx": p.wdx,
              "--wo": p.opacity,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
}

function OvercastEffect() {
  const clouds = useMemo(() => genClouds(4), []);

  return (
    <>
      {clouds.map((c) => (
        <div
          key={c.id}
          className="absolute rounded-full"
          style={{
            top: c.top,
            width: c.width,
            height: c.height,
            background: "var(--muted-foreground)",
            opacity: c.opacity,
            filter: `blur(${c.blur}px)`,
            animation: `weather-cloud ${c.duration} ${c.delay} linear infinite`,
          }}
        />
      ))}
    </>
  );
}

/**
 * Shared rain-drop renderer.
 * Outer div: vertical fall (rain-fall keyframe).
 * Inner div: horizontal sine-wave sway (rain-sway keyframe) + rotation via
 * the individual `rotate` CSS property so animation doesn't override it.
 */
function RainDrop({ d, width = 1 }: { d: DropData; width?: number }) {
  return (
    <div
      className="absolute"
      style={
        {
          left: d.left,
          top: -20,
          animation: `rain-fall ${d.fallDur} ${d.delay} linear infinite`,
          "--wo": d.opacity,
        } as React.CSSProperties
      }
    >
      <div
        style={
          {
            width,
            height: d.height,
            background: "var(--primary)",
            borderRadius: 1,
            rotate: `${d.angle}deg`,
            animation: `rain-sway ${d.swayDur} ${d.swayDelay} ease-in-out infinite`,
            "--sway-amp": d.swayAmp,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

function RainEffect({
  count = 45,
  seed = 123,
}: {
  count?: number;
  seed?: number;
}) {
  const drops = useMemo(() => genRainDrops(count, seed), [count, seed]);

  return (
    <>
      {drops.map((d) => (
        <RainDrop key={d.id} d={d} />
      ))}
    </>
  );
}

function StormEffect() {
  const drops = useMemo(() => genStormDrops(70), []);
  const flashRef = useRef<HTMLDivElement>(null);
  const startRef = useRef(0);
  const rafRef = useRef(0);
  const firedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    startRef.current = performance.now();

    const fire = (ev: LightningEvent) => {
      // Shake the page container
      const ctr = document.querySelector(
        "[data-weather-container]",
      ) as HTMLElement | null;
      if (ctr) {
        ctr.style.setProperty("--shake-intensity", String(ev.shake));
        ctr.classList.add("animate-weather-shake");
        setTimeout(() => ctr.classList.remove("animate-weather-shake"), 150);
      }

      // Create sub-flash DOM elements directly (avoids React re-renders)
      const box = flashRef.current;
      if (!box) return;
      for (const sf of ev.subs) {
        setTimeout(() => {
          const el = document.createElement("div");
          el.style.cssText = [
            "position:absolute",
            "inset:0",
            "pointer-events:none",
            `background:radial-gradient(ellipse ${sf.spreadX}% ${sf.spreadY}% at ${sf.x}% ${sf.y}%,rgba(255,255,255,${sf.intensity}),transparent)`,
            `animation:weather-lightning ${sf.durationMs}ms ease-out forwards`,
          ].join(";");
          box.appendChild(el);
          setTimeout(() => el.remove(), sf.durationMs + 50);
        }, sf.delayMs);
      }
    };

    const tick = (now: number) => {
      const elapsed = (now - startRef.current) % (LOOP_S * 1000);

      // Reset tracking at loop boundary
      if (elapsed < 50) firedRef.current.clear();

      for (let i = 0; i < LIGHTNING_SEQ.length; i++) {
        if (
          elapsed >= LIGHTNING_SEQ[i].timeMs &&
          elapsed < LIGHTNING_SEQ[i].timeMs + 50 &&
          !firedRef.current.has(i)
        ) {
          firedRef.current.add(i);
          fire(LIGHTNING_SEQ[i]);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <>
      {drops.map((d) => (
        <RainDrop key={d.id} d={d} width={1.5} />
      ))}
      <div ref={flashRef} className="absolute inset-0 pointer-events-none" />
    </>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function WeatherEffects() {
  const [weather] = useAtom(weatherAtom);
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || reducedMotion || SUPPRESSED_ROUTES.includes(pathname))
    return null;

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      <AnimatePresence>
        <motion.div
          key={weather}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
          {weather === "sunny" && <SunnyEffect />}
          {weather === "overcast" && <OvercastEffect />}
          {weather === "rain" && <RainEffect />}
          {weather === "storm" && <StormEffect />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
