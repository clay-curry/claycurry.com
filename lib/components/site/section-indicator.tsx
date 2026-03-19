"use client";
import { useEffect } from "react";

export function SectionIndicator() {
  useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section-heading]"),
    ).filter((el) => el.offsetParent !== null);
    if (headings.length === 0) return;

    // Find scroll container for IntersectionObserver root
    let scrollEl: Element | null = null;
    let parent: Element | null = headings[0];
    while (parent) {
      const s = getComputedStyle(parent);
      if (s.overflowY === "auto" || s.overflowY === "scroll") {
        scrollEl = parent;
        break;
      }
      parent = parent.parentElement;
    }

    function activate(el: HTMLElement) {
      for (const h of headings) h.removeAttribute("data-active");
      el.setAttribute("data-active", "");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = headings.indexOf(entry.target as HTMLElement);
          if (entry.isIntersecting) {
            activate(entry.target as HTMLElement);
          } else if (
            !entry.isIntersecting &&
            entry.boundingClientRect.top > (entry.rootBounds?.top ?? 0) &&
            idx > 0
          ) {
            // Heading left the zone going downward (scrolling up) — activate previous
            activate(headings[idx - 1]);
          }
        }
      },
      { root: scrollEl, rootMargin: "0px 0px -60% 0px", threshold: 0 },
    );

    for (const h of headings) observer.observe(h);

    // Activate last heading when scrolled to bottom
    const scrollTarget = scrollEl ?? document.documentElement;
    function onScroll() {
      const atBottom =
        scrollTarget.scrollTop + scrollTarget.clientHeight >=
        scrollTarget.scrollHeight - 50;
      if (atBottom) {
        activate(headings[headings.length - 1]);
      }
    }
    (scrollEl ?? window).addEventListener("scroll", onScroll, {
      passive: true,
    });

    // Activate first heading after hero entrance animations
    const timer = setTimeout(() => activate(headings[0]), 900);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      (scrollEl ?? window).removeEventListener("scroll", onScroll);
    };
  }, []);
  return null;
}
