"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { portfolio } from "../../data/portfolio";
import { syncFilterFromHash } from "../../lib/portfolio-filter";
import { preferredScrollBehavior } from "../../lib/motion";

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

function findActiveSection(): NavSectionId | null {
  const scrollPosition = window.scrollY + 180;

  for (const item of NAV_ITEMS) {
    const element = document.getElementById(item.id);
    if (!element) continue;

    const { offsetTop, offsetHeight } = element;
    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
      return item.id;
    }
  }

  return null;
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
      setIsScrolled(window.scrollY > 24);
      setActiveSection(findActiveSection());
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
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

    const element = document.getElementById(id);
    const wasMenuOpen = isMenuOpen;

    setIsMenuOpen(false);
    if (!element) return;

    const scroll = () =>
      element.scrollIntoView({ behavior: preferredScrollBehavior(), block: "start" });

    if (wasMenuOpen) {
      requestAnimationFrame(() => requestAnimationFrame(scroll));
    } else {
      scroll();
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