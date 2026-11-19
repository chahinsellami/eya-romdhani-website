"use client";

import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { LayoutGrid, List } from "lucide-react";
import { portfolio } from "../../data/portfolio";
import {
  FILTERS,
  readFilterFromHash,
  setFilter,
  subscribeFilter,
  type Filter,
} from "../../lib/portfolio-filter";

export type GalleryViewMode = "grid" | "index";

interface PortfolioFilterProps {
  viewMode: GalleryViewMode;
  onViewModeChange: (mode: GalleryViewMode) => void;
}

export default function PortfolioFilter({
  viewMode,
  onViewModeChange,
}: PortfolioFilterProps) {
  const [activeCategory, setActiveCategory] = useState<Filter>("All");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActiveCategory(readFilterFromHash());
    return subscribeFilter(setActiveCategory);
  }, []);

  const selectCategory = useCallback((category: Filter) => {
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

  const visibleCategories = FILTERS.filter(
    (category) => category === "All" || counts[category] > 0,
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
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

  const resolvedCategory: Filter = mounted ? activeCategory : "All";

  return (
    <div className="no-print -mx-[var(--space-gutter)] mb-10 border-y border-[var(--border-subtle)] bg-[var(--bg-primary)]/95 px-[var(--space-gutter)] backdrop-blur-md md:sticky md:top-20 md:z-20 md:mb-12">
      <div className="flex items-center justify-between gap-3 py-2 sm:gap-4 sm:py-2.5">
        {/* Category filter tabs */}
        <div
          className="scroll-slim flex items-center gap-4 overflow-x-auto sm:gap-6"
          role="group"
          aria-label="Filter portfolio by category"
          onKeyDown={handleKeyDown}
        >
          {visibleCategories.map((category) => {
            const isActive = resolvedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => selectCategory(category)}
                aria-pressed={isActive}
                className={`relative flex min-h-[40px] items-center gap-1.5 py-2 text-xs font-medium uppercase tracking-[0.16em] transition-colors duration-200 whitespace-nowrap shrink-0 sm:gap-2 ${
                  isActive
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span>{category}</span>
                <span className="font-mono text-[11px] tabular-nums text-[var(--text-tertiary)]">
                  {String(counts[category]).padStart(2, "0")}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="portfolio-filter-indicator"
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-x-0 -bottom-2 h-0.5 bg-[var(--accent-primary)] sm:-bottom-2.5"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* View switcher */}
        <div
          className="flex items-center gap-1 border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-0.5 shrink-0"
          role="group"
          aria-label="Gallery layout view"
        >
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            aria-pressed={viewMode === "grid"}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-200 whitespace-nowrap shrink-0 ${
              viewMode === "grid"
                ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("index")}
            aria-pressed={viewMode === "index"}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-200 whitespace-nowrap shrink-0 ${
              viewMode === "index"
                ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <List className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Index</span>
          </button>
        </div>
      </div>
    </div>
  );
}
