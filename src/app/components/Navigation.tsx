"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { portfolio } from "../../data/portfolio";
import { syncFilterFromHash } from "../../lib/portfolio-filter";
import { preferredScrollBehavior, scrollToSectionById } from "../../lib/motion";

const NAV_ITEMS = [
  { id: "about", label: "About" },
  { id: "comp-card", label: "Comp Card" },
  { id: "portfolio", label: "Portfolio" },
  { id: "contact", label: "Inquiries" },
] as const;

type NavSectionId = (typeof NAV_ITEMS)[number]["id"];

function isNavSectionId(id: string): id is NavSectionId {
  return NAV_ITEMS.some((item) => item.id === id);
}

interface NavigationProps {
  onNavigate?: (id: string) => void;
}

export default function Navigation({ onNavigate }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<NavSectionId | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 24;
      setIsScrolled((prev) => (prev === scrolled ? prev : scrolled));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const elements = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (elements.length === 0) return;

    const visibleRatios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibleRatios.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        }

        let topId: NavSectionId | null = null;
        let maxRatio = 0;
        for (const item of NAV_ITEMS) {
          const ratio = visibleRatios.get(item.id) ?? 0;
          if (ratio > maxRatio) {
            maxRatio = ratio;
            topId = item.id;
          }
        }
        setActiveSection(topId);
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.15, 0.4, 0.7],
      },
    );

    for (const el of elements) {
      observer.observe(el);
    }
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
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) firstMenuItemRef.current?.focus();
  }, [isMenuOpen]);

  const scrollToSection = (id: string) => {
    if (!isNavSectionId(id)) return;
    if (onNavigate) onNavigate(id);

    const wasMenuOpen = isMenuOpen;
    setIsMenuOpen(false);

    if (wasMenuOpen) {
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToSectionById(id)));
    } else {
      scrollToSectionById(id);
    }

    window.history.replaceState(null, "", `#${id}`);
    syncFilterFromHash();

    if (wasMenuOpen) {
      requestAnimationFrame(() => menuButtonRef.current?.focus());
    }
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-40 transition-colors duration-200 ${
        isScrolled || isMenuOpen
          ? "border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/95 backdrop-blur-md"
          : "border-b border-transparent bg-[var(--bg-primary)]/80 backdrop-blur-sm"
      }`}
    >
      <div className="shell">
        <div className="flex h-16 items-center justify-between gap-8 md:h-20">
          {/* Zone 1: Brand wordmark (single text element) */}
          <a
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
            }}
            className="font-display text-2xl font-normal tracking-tight text-[var(--text-primary)] transition-colors duration-200 hover:text-[var(--accent-primary)] whitespace-nowrap shrink-0"
          >
            {portfolio.name}
          </a>

          {/* Zone 2: Concise single-line nav links */}
          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label="Primary navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  aria-current={isActive ? "location" : undefined}
                  className={`link-underline text-xs font-medium uppercase tracking-[0.16em] transition-colors duration-200 whitespace-nowrap shrink-0 ${
                    isActive
                      ? "text-[var(--accent-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single primary CTA + mobile drawer toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => scrollToSection("contact")}
              className="hidden bg-[var(--text-primary)] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-[var(--bg-primary)] transition-colors duration-200 hover:bg-[var(--accent-primary)] hover:text-white whitespace-nowrap shrink-0 md:inline-flex"
            >
              Book Aya
            </button>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center border border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors duration-200 hover:border-[var(--text-primary)] md:hidden"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-navigation-menu"
              key="mobile-navigation-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] md:hidden"
            >
              <div className="flex flex-col py-4">
                {NAV_ITEMS.map((item, index) => (
                  <button
                    key={item.id}
                    ref={index === 0 ? firstMenuItemRef : undefined}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    aria-current={activeSection === item.id ? "location" : undefined}
                    className={`flex items-center justify-between px-2 py-3.5 text-left text-xs font-medium uppercase tracking-[0.18em] transition-colors duration-200 ${
                      activeSection === item.id
                        ? "text-[var(--accent-primary)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => scrollToSection("contact")}
                  className="mt-3 w-full bg-[var(--text-primary)] px-5 py-3 text-center text-xs font-medium uppercase tracking-[0.16em] text-[var(--bg-primary)] transition-colors duration-200 hover:bg-[var(--accent-primary)]"
                >
                  Book Aya
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}