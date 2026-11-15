"use client";

import { useEffect, useState } from "react";

/** Thin reading-progress rule. Purely decorative, so it is aria-hidden. */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      // Guard against division by zero on pages shorter than the viewport.
      setProgress(scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  if (progress < 1) return null;

  return (
    <div
      className="fixed left-0 top-0 z-[60] h-0.5 bg-[var(--accent-primary)]"
      style={{ width: `${progress}%` }}
      aria-hidden="true"
    />
  );
}
