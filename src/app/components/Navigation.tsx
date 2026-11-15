"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { portfolio } from "../../data/portfolio";
import { syncFilterFromHash } from "../../lib/portfolio-filter";
import { preferredScrollBehavior } from "../../lib/motion";

const NAV_ITEMS = [
  { id: "about", label: "About" },
  { id: "portfolio", label: "Portfolio" },
  { id: "contact", label: "Contact" },
] as const;

type NavSectionId = (typeof NAV_ITEMS)[number]["id"];

// The menu button's colour is set at the call site — it sits on the photograph
// before scroll and on the page ground after, so a fixed token here would be
// wrong half the time.
const MENU_BUTTON =
  "inline-flex h-10 w-10 items-center justify-center rounded-sm " +
  "transition-colors duration-300 focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] md:hidden";
const NAV_LINK =
  "rounded-sm text-xs uppercase tracking-[0.15em] transition-colors duration-300 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]";

function isNavSectionId(id: string): id is NavSectionId {
  return NAV_ITEMS.some((item) => item.id === id);
}

function findActiveSection(): NavSectionId | null {
  const scrollPosition = window.scrollY + 200;

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
      setIsScrolled(window.scrollY > 100);
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

  // Mobile menu: escape to close, lock background scroll while open.
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

  // Move focus into the menu when it opens so keyboard users land inside it.
  useEffect(() => {
    if (isMenuOpen) firstMenuItemRef.current?.focus();
  }, [isMenuOpen]);

  const scrollToSection = (id: string) => {
    if (!isNavSectionId(id)) return;
    if (onNavigate) onNavigate(id);

    const element = document.getElementById(id);
    const wasMenuOpen = isMenuOpen;

    // Close first: while the mobile menu is open the body is scroll-locked, and
    // scrollIntoView() is a no-op against a locked body. Scroll on the next
    // frame, after the menu's cleanup has restored scrolling.
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
    // The hash is shared with the portfolio filter; let subscribers re-read it.
    syncFilterFromHash();

    // Selecting an item unmounts the focused menu button, which would drop
    // focus to <body> and strand keyboard users at the top of the document.
    // Returning it to the toggle keeps the menu button as the stable anchor,
    // matching what Escape already does.
    if (wasMenuOpen) {
      requestAnimationFrame(() => menuButtonRef.current?.focus());
    }
  };

  // Derived from the name rather than hardcoded, so a rename cannot leave the
  // monogram spelling the previous model's initials.
  const logoLabel =
    portfolio.name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || portfolio.name.slice(0, 2).toUpperCase();

  // Over the hero the bar floats on a photograph, which stays dark in both
  // colour schemes — so its type uses the on-photo tokens rather than the page's
  // text tokens. Once scrolled it sits on the page ground and flips normally.
  // Without this split, light mode put near-black navigation text on a dark
  // photograph: the links measured roughly 1.3:1 and effectively vanished.
  const onHero = !isScrolled && !isMenuOpen;
  const markColor = onHero ? "text-[var(--on-photo)]" : "text-[var(--text-primary)]";
  const idleColor = onHero ? "text-[var(--on-photo-dim)]" : "text-[var(--text-tertiary)]";
  const activeColor = onHero ? "text-[var(--on-photo)]" : "text-[var(--text-primary)]";

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-40 transition-all duration-300 ${
        isScrolled || isMenuOpen
          ? "border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/95 backdrop-blur-sm"
          : "bg-transparent"
      }`}
      aria-label="Main navigation"
    >
      <div className="shell">
        <div className="flex items-center justify-between h-16 md:h-20">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: preferredScrollBehavior() })}
            className={`${NAV_LINK} ${markColor} hover:text-[var(--accent-primary)]`}
            aria-label={`${portfolio.name} — back to top`}
          >
            {logoLabel}
          </button>

          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`${NAV_LINK} ${
                  activeSection === item.id
                    ? activeColor
                    : `${idleColor} hover:text-[var(--text-primary)]`
                }`}
                aria-current={activeSection === item.id ? "location" : undefined}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className={`${MENU_BUTTON} ${markColor} hover:text-[var(--accent-primary)]`}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            <span className="relative block h-3 w-5" aria-hidden="true">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition-transform duration-300 ${
                  isMenuOpen ? "translate-y-[5px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[5px] h-0.5 w-5 bg-current transition-opacity duration-200 ${
                  isMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-[10px] h-0.5 w-5 bg-current transition-transform duration-300 ${
                  isMenuOpen ? "-translate-y-[5px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-navigation-menu"
              key="mobile-navigation-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              // The panel needs its own opaque ground. The nav bar above it is
              // opaque while the menu is open, but this panel is a sibling, so
              // without a background the hero wordmark showed straight through
              // the links and made them unreadable.
              className="overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] md:hidden"
            >
              <div className="py-4 space-y-1">
                {NAV_ITEMS.map((item, index) => (
                  <button
                    key={item.id}
                    ref={index === 0 ? firstMenuItemRef : undefined}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className={`block w-full px-4 py-3 text-left text-xs uppercase tracking-[0.15em] transition-colors duration-300 ${
                      activeSection === item.id
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                    }`}
                    aria-current={activeSection === item.id ? "location" : undefined}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}