"use client";

import { useEffect, useState } from "react";

function HeroName() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <h1
      className="font-[var(--font-pp-neue-montreal)] font-bold uppercase text-foreground text-[42px] leading-[0.85] tracking-[-1.2px] md:text-[46px] md:tracking-[-2.24px] lg:text-[50px] lg:tracking-[-1.5px]"
      style={{ fontVariationSettings: "'ital' 100" }}
    >
      <span
        className={`block transition-all duration-500 ease-in-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        style={{ transitionDelay: `200ms` }}
      >
        Clay Curry
      </span>

      <span
        className={`text-[32px] leading-[0.85] tracking-[-1.2px] md:text-[36px] md:tracking-[-2.24px] lg:text-[40px] lg:tracking-[-1.5px] block transition-all duration-500 ease-in-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        style={{ transitionDelay: `400ms` }}
      >
        Product Engineer
      </span>
    </h1>
  );
}

function HeroSubtitle() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <a
      href="mailto:me@claycurry.com"
      className={`font-[var(--font-pp-neue-montreal)] font-normal underline text-[14px] leading-[24px] md:text-[16px] text-foreground hover:text-accent transition-all ease-in-out ${visible ? "opacity-100 translate-y-0 duration-0" : "opacity-0 translate-y-4 duration-500"}`}
      style={{
        fontVariationSettings: "'ital' 100",
        transitionDelay: visible ? "0ms" : "600ms",
      }}
    >
      Available for Hire
    </a>
  );
}

export function Hero() {
  return (
    <div className="flex flex-col gap-3 md:gap-6 items-center text-center max-w-[361px] md:max-w-[1066px] mx-auto px-4 md:px-6 py-20">
      <HeroName />
      <HeroSubtitle />
    </div>
  );
}
