"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

export const EDITORIAL_EASE = [0.16, 1, 0.3, 1] as const;

export const EDITORIAL_VIEWPORT = {
  once: true,
  amount: 0.12,
  margin: "0px 0px -48px 0px",
} as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  y?: number;
  x?: number;
  scale?: number;
  delay?: number;
  duration?: number;
  amount?: number | "some" | "all";
  as?: "div" | "header" | "section" | "article" | "li" | "figure";
}

export default function Reveal({
  children,
  className,
  y = 22,
  x = 0,
  scale = 1,
  delay = 0,
  duration = 0.6,
  amount = 0.12,
  as = "div",
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (mounted && prefersReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const motionProps = {
    className: `reveal-block ${className ?? ""}`.trim(),
    initial: { opacity: 0, y, x, scale },
    whileInView: { opacity: 1, y: 0, x: 0, scale: 1 },
    viewport: { once: true, amount, margin: "0px 0px -48px 0px" },
    transition: {
      duration,
      delay,
      ease: EDITORIAL_EASE,
    },
  };

  if (as === "div") return <motion.div {...motionProps}>{children}</motion.div>;
  if (as === "header") return <motion.header {...motionProps}>{children}</motion.header>;
  if (as === "section") return <motion.section {...motionProps}>{children}</motion.section>;
  if (as === "article") return <motion.article {...motionProps}>{children}</motion.article>;
  if (as === "figure") return <motion.figure {...motionProps}>{children}</motion.figure>;
  return <motion.li {...motionProps}>{children}</motion.li>;
}

interface StaggerGroupProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  as?: "div" | "dl" | "ul";
}

export function RevealGroup({
  children,
  className,
  stagger = 0.06,
  delayChildren = 0.04,
  as = "div",
}: StaggerGroupProps) {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (mounted && prefersReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const variants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren,
      },
    },
  };

  const motionProps = {
    className,
    variants,
    initial: "hidden" as const,
    whileInView: "visible" as const,
    viewport: EDITORIAL_VIEWPORT,
  };

  if (as === "dl") return <motion.dl {...motionProps}>{children}</motion.dl>;
  if (as === "ul") return <motion.ul {...motionProps}>{children}</motion.ul>;
  return <motion.div {...motionProps}>{children}</motion.div>;
}

interface RevealItemProps {
  children: ReactNode;
  className?: string;
  y?: number;
  duration?: number;
  as?: "div" | "li";
}

export function RevealItem({
  children,
  className,
  y = 16,
  duration = 0.55,
  as = "div",
}: RevealItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (mounted && prefersReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const variants: Variants = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: EDITORIAL_EASE },
    },
  };

  const motionProps = {
    className: `reveal-block ${className ?? ""}`.trim(),
    variants,
  };

  if (as === "li") return <motion.li {...motionProps}>{children}</motion.li>;
  return <motion.div {...motionProps}>{children}</motion.div>;
}
