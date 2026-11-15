"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { portfolio } from "../../data/portfolio";
import { motion, AnimatePresence } from "framer-motion";
import {
  FILTERS,
  readFilterFromHash,
  setFilter,
  subscribeFilter,
  type Filter,
} from "../../lib/portfolio-filter";

/**
 * Sticky category filter.
 *
 * The URL hash is the single source of truth (see src/lib/portfolio-filter.ts)
 * so this bar and the gallery grid stay in sync.
 */
export default function PortfolioFilter() {
  const [activeCategory, setActiveCategory] = useState<Filter>("All");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActiveCategory(readFilterFromHash());
    return subscribeFilter(setActiveCategory);
  }, []);

  const selectCategory = useCallback((category: Filter) => {
    setIsMenuOpen(false);
    setFilter(category);
  }, []);

  const counts = FILTERS.reduce<Record<Filter, number>>(
    (acc, category) => {
      acc[category] =
        category === "All"
          ? portfolio.portfolio.length
          : portfolio.portfolio.filter((item) => item.category === category)
              .length;
      return acc;
    },
    { All: 0, Runway: 0, Editorial: 0, Campaign: 0, Commercial: 0 },
  );

  const dropdownButtonRef = useRef<HTMLButtonElement>(null);

  // Categories with no items are not rendered, so they must not be reachable by
  // keyboard either — cycling through FILTERS used to land on an empty
  // "Commercial" and blank the grid.
  const visibleCategories = FILTERS.filter(
    (category) => category === "All" || counts[category] > 0,
  );

  /**
   * Arrow keys are a roving-selection shortcut for the desktop pill row, where
   * every category is visible at once. They deliberately do nothing while the
   * mobile dropdown is closed: the trigger button advertises a single current
   * value, so silently changing it with Left/Right gave no feedback about what
   * happened. Escape closes the open dropdown and returns focus to its trigger.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && isMenuOpen) {
      event.preventDefault();
      setIsMenuOpen(false);
      dropdownButtonRef.current?.focus();
      return;
    }

    if (isMenuOpen) return;

    const currentIndex = visibleCategories.indexOf(activeCategory);
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const step = event.key === "ArrowRight" ? 1 : -1;
      const next =
        (Math.max(currentIndex, 0) + step + visibleCategories.length) %
        visibleCategories.length;
      selectCategory(visibleCategories[next]);
    }
  };

  const itemCount = counts[activeCategory];

  // Avoid an "All"-only flash before the hash is known on first paint.
  const resolvedCategory: Filter = mounted ? activeCategory : "All";

  return (
    <div className="sticky top-[var(--nav-height)] z-20 -mx-[var(--space-gutter)] mb-12 bg-[var(--bg-primary)]/85 px-[var(--space-gutter)] py-3 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          {/* Desktop: inline pills */}
          <div
            className="hidden items-center gap-2 md:flex"
            role="group"
            aria-label="Filter portfolio by category"
          >
            {visibleCategories.map((category) => {
              const isActive = resolvedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => selectCategory(category)}
                  className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] ${
                    isActive
                      ? "bg-[var(--accent-primary)] font-medium text-[var(--bg-primary)]"
                      : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                  aria-pressed={isActive}
                >
                  {category}
                  <span className="sr-only"> ({counts[category]} items)</span>
                </button>
              );
            })}
          </div>

          {/* Mobile: dropdown */}
          <div className="relative md:hidden" onKeyDown={handleKeyDown}>
            <button
              ref={dropdownButtonRef}
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="rounded-full bg-[var(--bg-tertiary)] px-4 py-2 text-xs uppercase tracking-widest text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
            >
              {resolvedCategory}
              <span className="ml-1" aria-hidden="true">
                ▾
              </span>
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  id="portfolio-filter-menu"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 top-full z-30 mt-2 flex min-w-[180px] flex-col gap-1 border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-2 shadow-2xl"
                >
                  {visibleCategories.map((category) => {
                    const isActive = resolvedCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => selectCategory(category)}
                        className={`px-4 py-3 text-left text-xs uppercase tracking-widest transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] ${
                          isActive
                            ? "bg-[var(--accent-primary)] font-medium text-[var(--bg-primary)]"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                        aria-pressed={isActive}
                      >
                        {category}
                        <span className="mt-1 block text-[11px] opacity-70">
                          {counts[category]}{" "}
                          {counts[category] === 1 ? "item" : "items"}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="min-w-[70px] text-right text-xs text-[var(--text-tertiary)]">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
    </div>
  );
}
