"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Vertical travel in px before settling. */
  y?: number;
  delay?: number;
  duration?: number;
  /** Element to render; defaults to a div. */
  as?: "div" | "header" | "section" | "article" | "li";
}

/**
 * Scroll-reveal wrapper.
 *
 * Two robustness rules this encodes:
 * 1. With `prefers-reduced-motion: reduce` it renders a plain, fully visible
 *    element — no opacity animation is queued at all.
 * 2. Framer simulates `opacity: 0` in the server-rendered HTML, which would make
 *    the whole page blank if JS never runs. `reveal-block` is targeted by the
 *    `<noscript>` rule in layout.tsx, which forces it visible with `!important`
 *    (a stylesheet `!important` declaration outranks an inline style).
 */
export default function Reveal({
  children,
  className,
  y = 40,
  delay = 0,
  duration = 0.8,
  as = "div",
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  // `useReducedMotion` reads a module global that is null during SSR and filled
  // on the first client render, so branching on it directly produces a
  // hydration mismatch for reduced-motion visitors (server: animated, client:
  // plain). Rendering the animated branch until mount keeps both passes equal;
  // the CSS query below still guarantees visibility.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (mounted && prefersReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const motionProps = {
    className: `reveal-block ${className ?? ""}`.trim(),
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" as const },
    transition: { duration, delay, ease: "easeOut" as const },
  };

  if (as === "div") return <motion.div {...motionProps}>{children}</motion.div>;
  if (as === "header") return <motion.header {...motionProps}>{children}</motion.header>;
  if (as === "section") return <motion.section {...motionProps}>{children}</motion.section>;
  if (as === "article") return <motion.article {...motionProps}>{children}</motion.article>;
  return <motion.li {...motionProps}>{children}</motion.li>;
}
