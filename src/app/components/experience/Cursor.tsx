"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "ring" | "view" | "dot";

/**
 * A small bone ring trailing the pointer, blended with `difference` so it reads on
 * ink, bone and photographs. Over a photograph it widens a little and reads VIEW;
 * over links and buttons it shrinks to a dot. The native cursor stays.
 * Mouse users with motion enabled only.
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("ring");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    setEnabled(query.matches);
    const onChange = () => setEnabled(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      setVisible(true);
      const el = e.target instanceof Element ? e.target : null;
      const next: Mode = el?.closest("a, button, input, textarea, select, label")
        ? "dot"
        : el?.closest('[data-gl], [data-cursor="view"]')
          ? "view"
          : "ring";
      setMode((prev) => (prev === next ? prev : next));
    };
    const onLeave = () => setVisible(false);

    const tick = () => {
      pos.x += (target.x - pos.x) * 0.18;
      pos.y += (target.y - pos.y) * 0.18;
      if (ref.current) ref.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  const size = mode === "view" ? 64 : mode === "dot" ? 6 : 24;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[45] text-[var(--bone)] mix-blend-difference will-change-transform"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms" }}
    >
      <div
        className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-current transition-[width,height,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mode === "dot" ? "bg-current" : "bg-transparent"
        }`}
        style={{ width: size, height: size }}
      >
        <span
          className={`pl-[0.24em] text-[0.5625rem] font-semibold uppercase tracking-[0.24em] transition-opacity duration-200 ${
            mode === "view" ? "opacity-100" : "opacity-0"
          }`}
        >
          View
        </span>
      </div>
    </div>
  );
}
