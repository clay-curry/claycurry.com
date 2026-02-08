"use client";

import { useAtom } from "jotai";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { weatherAtom } from "@/lib/hooks/use-weather";

const SUPPRESSED_ROUTES = ["/resume"];

// Deterministic pseudo-random from seed (avoids hydration mismatch)
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── Particle generators ─────────────────────────────────────────────────────

function generateSunParticles(count: number) {
  const rand = seededRandom(42);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${rand() * 100}%`,
    bottom: `${rand() * -10}%`,
    delay: `${rand() * 12}s`,
    duration: `${8 + rand() * 7}s`,
    size: 3 + rand() * 3,
    wx: `${(rand() - 0.5) * 40}px`,
    wdx: `${(rand() - 0.5) * 30}px`,
    opacity: 0.08 + rand() * 0.07,
  }));
}

function generateClouds(count: number) {
  const rand = seededRandom(77);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: `${10 + rand() * 50}%`,
    delay: `${rand() * 20}s`,
    duration: `${25 + rand() * 20}s`,
    width: 150 + rand() * 150,
    height: 60 + rand() * 60,
    opacity: 0.03 + rand() * 0.03,
    blur: 30 + rand() * 20,
  }));
}

function generateRainDrops(count: number, seed = 123) {
  const rand = seededRandom(seed);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${rand() * 100}%`,
    delay: `${rand() * 2}s`,
    duration: `${0.5 + rand() * 0.7}s`,
    height: 12 + rand() * 8,
    opacity: 0.12 + rand() * 0.1,
    drift: `${-8 - rand() * 10}px`,
  }));
}

function generateStormDrops(count: number) {
  const rand = seededRandom(999);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${rand() * 100}%`,
    delay: `${rand() * 1.5}s`,
    duration: `${0.3 + rand() * 0.5}s`,
    height: 15 + rand() * 10,
    opacity: 0.15 + rand() * 0.13,
    drift: `${-10 - rand() * 15}px`,
  }));
}

// ─── Effect sub-components ───────────────────────────────────────────────────

function SunnyEffect() {
  const particles = useMemo(() => generateSunParticles(15), []);

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
  const clouds = useMemo(() => generateClouds(4), []);

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

function RainEffect({
  count = 45,
  seed = 123,
}: {
  count?: number;
  seed?: number;
}) {
  const drops = useMemo(() => generateRainDrops(count, seed), [count, seed]);

  return (
    <>
      {drops.map((d) => (
        <div
          key={d.id}
          className="absolute"
          style={
            {
              left: d.left,
              top: -20,
              width: 1,
              height: d.height,
              background: "var(--primary)",
              borderRadius: 1,
              transform: "rotate(8deg)",
              animation: `weather-rain ${d.duration} ${d.delay} linear infinite`,
              "--wo": d.opacity,
              "--wdx": d.drift,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
}

function StormEffect() {
  const drops = useMemo(() => generateStormDrops(70), []);
  const [isFlashing, setIsFlashing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerLightning = useCallback(() => {
    setIsFlashing(true);

    // Apply shake to the weather container's parent
    const container = document.querySelector("[data-weather-container]");
    if (container) container.classList.add("animate-weather-shake");

    setTimeout(() => {
      setIsFlashing(false);
      container?.classList.remove("animate-weather-shake");
    }, 200);
  }, []);

  useEffect(() => {
    const scheduleFlash = () => {
      const delay = 3000 + Math.random() * 5000;
      timeoutRef.current = setTimeout(() => {
        triggerLightning();
        scheduleFlash();
      }, delay);
    };

    scheduleFlash();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [triggerLightning]);

  return (
    <>
      {/* Heavy rain */}
      {drops.map((d) => (
        <div
          key={d.id}
          className="absolute"
          style={
            {
              left: d.left,
              top: -20,
              width: 1.5,
              height: d.height,
              background: "var(--primary)",
              borderRadius: 1,
              transform: "rotate(10deg)",
              animation: `weather-rain ${d.duration} ${d.delay} linear infinite`,
              "--wo": d.opacity,
              "--wdx": d.drift,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Lightning flash overlay */}
      {isFlashing && (
        <div
          className="absolute inset-0 bg-white pointer-events-none"
          style={
            {
              animation: "weather-lightning 0.4s ease-out forwards",
              "--flash-intensity": 0.09,
            } as React.CSSProperties
          }
        />
      )}
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
