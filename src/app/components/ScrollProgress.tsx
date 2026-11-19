"use client";

import { useEffect, useRef } from "react";

/** GPU-composited reading-progress rule with zero scroll-time React re-renders. */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio =
        scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;

      bar.style.transform = `scaleX(${ratio})`;
      bar.style.opacity = ratio > 0.01 ? "1" : "0";
    };

    const onScrollOrResize = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed left-0 top-0 z-[60] h-0.5 w-full origin-left bg-[var(--accent-primary)] transition-opacity duration-150 will-change-transform"
      style={{ transform: "scaleX(0)", opacity: 0 }}
      aria-hidden="true"
    />
  );
}
