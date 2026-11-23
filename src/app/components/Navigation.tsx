"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { portfolio } from "../../data/portfolio";
import { scrollToSectionById } from "../../lib/motion";

// Every section in page order, with the index it carries in the rail and the menu
const SECTIONS = [
  { id: "top", index: "01", label: "Home" },
  { id: "portfolio", index: "02", label: "Work" },
  { id: "about", index: "03", label: "Profile" },
  { id: "comp-card", index: "04", label: "Comp card" },
  { id: "contact", index: "05", label: "Booking" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const EASE = [0.16, 1, 0.3, 1] as const;

/*
  The bar and the rail are transparent and blend with `difference`, so bone type
  reads on ink, on the bone band and over photographs alike. They must stay the
  fixed elements themselves (no wrapper with a z-index) for the blend to reach the page.
*/
export default function Navigation() {
  const [activeSection, setActiveSection] = useState<SectionId>("top");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  // Page progress fills the rail's hairline; written straight to the DOM, no re-render
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleY(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const elements = SECTIONS.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (elements.length === 0) return;

    const visibleRatios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibleRatios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let topId: SectionId | null = null;
        let maxRatio = 0;
        for (const item of SECTIONS) {
          const ratio = visibleRatios.get(item.id) ?? 0;
          if (ratio > maxRatio) {
            maxRatio = ratio;
            topId = item.id;
          }
        }
        if (topId) setActiveSection(topId);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.15, 0.4, 0.7] },
    );
    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop();
    window.addEventListener("keydown", onKeyDown);
    firstMenuItemRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.__lenis?.start();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  const go = (id: SectionId) => {
    const wasMenuOpen = isMenuOpen;
    setIsMenuOpen(false);
    // Wait for the menu's cleanup to restart Lenis before asking it to scroll
    if (wasMenuOpen) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          scrollToSectionById(id);
          menuButtonRef.current?.focus();
        }),
      );
    } else {
      scrollToSectionById(id);
    }
    window.history.replaceState(null, "", id === "top" ? " " : `#${id}`);
  };

  const active = SECTIONS.find((s) => s.id === activeSection) ?? SECTIONS[0];
  const menuWord = isMenuOpen ? "CLOSE" : "MENU";

  return (
    <header>
      <div className="fixed inset-x-0 top-0 z-40 text-[var(--bone)] mix-blend-difference">
        <div className="flex items-start justify-between gap-6 px-[var(--space-gutter)] pt-5 md:pt-7">
          <button
            type="button"
            onClick={() => go("top")}
            className="min-h-[44px] whitespace-nowrap font-[family-name:var(--font-serif)] text-[0.875rem] uppercase tracking-[0.18em] md:text-[1.25rem] md:tracking-[0.3em]"
          >
            {portfolio.name}
          </button>

          <div className="flex items-start gap-4 md:gap-10">
            <button
              type="button"
              onClick={() => go("contact")}
              className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap text-[0.6875rem] font-semibold uppercase tracking-[0.18em] md:gap-3 md:tracking-[0.24em]"
            >
              Book Aya
              <span aria-hidden="true" className="h-[5px] w-[5px] rounded-full bg-current" />
            </button>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="min-h-[44px] min-w-[44px] text-[0.6875rem] font-semibold uppercase tracking-[0.18em] md:tracking-[0.24em] lg:-mt-1 lg:text-[1.875rem] lg:font-bold lg:leading-[0.95] lg:tracking-normal"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="site-menu"
            >
              <span className="lg:hidden">{menuWord}</span>
              {/* Stacked letters on desktop, read top to bottom down the right edge */}
              <span aria-hidden="true" className="hidden flex-col items-center lg:flex">
                {[...menuWord].map((ch, i) => (
                  <span key={i}>{ch}</span>
                ))}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Left rail: current index, a hairline that fills with page progress, the section's name */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-10 left-[calc(var(--space-gutter)/2)] top-36 z-40 hidden -translate-x-1/2 flex-col items-center gap-4 text-[var(--bone)] mix-blend-difference lg:flex"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={active.index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="text-[0.6875rem] font-semibold tracking-[0.24em]"
          >
            {active.index}
          </motion.span>
        </AnimatePresence>
        <span className="relative w-px flex-1">
          <span className="absolute inset-0 bg-current opacity-25" />
          <span ref={progressRef} className="absolute inset-0 origin-top bg-current" style={{ transform: "scaleY(0)" }} />
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={active.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="rotate-180 whitespace-nowrap text-[0.625rem] font-semibold uppercase tracking-[0.3em] [writing-mode:vertical-rl]"
          >
            {active.label}
          </motion.span>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="site-menu"
            key="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ clipPath: reduceMotion ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0 0)" }}
            exit={{ clipPath: reduceMotion ? "inset(0 0 0 0)" : "inset(0 0 100% 0)", opacity: reduceMotion ? 0 : 1 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="fixed inset-0 z-[38] flex flex-col justify-between bg-[var(--ink)] px-[var(--space-gutter)] pb-10 pt-28 text-[var(--bone)] lg:pl-[calc(var(--space-gutter)*2)]"
          >
            <nav aria-label="Site sections" className="flex flex-col">
              {SECTIONS.map((item, index) => (
                <span key={item.id} className="block overflow-hidden border-b border-[var(--border-on-ink)]">
                  <motion.button
                    ref={index === 0 ? firstMenuItemRef : undefined}
                    type="button"
                    onClick={() => go(item.id)}
                    aria-current={activeSection === item.id ? "location" : undefined}
                    initial={{ y: reduceMotion ? 0 : "110%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.15 + index * 0.07, ease: EASE }}
                    className={`flex w-full items-baseline gap-5 py-1 text-left transition-opacity duration-300 hover:opacity-100 md:gap-10 ${
                      activeSection === item.id ? "opacity-100" : "opacity-60"
                    }`}
                  >
                    <span className="w-8 shrink-0 text-[0.6875rem] font-semibold tracking-[0.24em]">{item.index}</span>
                    <span className="type-serif text-[clamp(2.75rem,1.5rem+5.5vw,7.5rem)]">{item.label}</span>
                  </motion.button>
                </span>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.5 }}
              className="flex flex-col gap-1 text-[0.6875rem] font-semibold uppercase tracking-[0.24em] sm:flex-row sm:gap-12"
            >
              <a
                href={`mailto:${portfolio.contact.management}`}
                className="inline-flex min-h-[44px] items-center underline-offset-[0.4em] hover:underline"
              >
                {portfolio.contact.management}
              </a>
              {portfolio.social.instagram && (
                <a
                  href={portfolio.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center underline-offset-[0.4em] hover:underline"
                >
                  Instagram
                </a>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
