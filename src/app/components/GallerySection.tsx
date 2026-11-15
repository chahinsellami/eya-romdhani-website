"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { portfolio, type PortfolioItem } from "../../data/portfolio";
import Reveal from "./Reveal";
import Lightbox from "./Lightbox";
import {
  readFilterFromHash,
  subscribeFilter,
  type Filter,
} from "../../lib/portfolio-filter";

/** Fallback gradient used while an image loads or if it fails to load. */
const fallbackGradient =
  "radial-gradient(circle at 50% 14%, rgba(180, 83, 42, 0.16) 0%, rgba(250, 248, 244, 0) 38%), linear-gradient(150deg, #F0ECE4 0%, #FAF8F4 55%, #E6E1D7 100%)";

interface GallerySectionProps {
  /** Optional override; defaults to the validated module-level portfolio. */
  data?: typeof portfolio | null;
}

export default function GallerySection({ data }: GallerySectionProps) {
  const currentData = data ?? portfolio;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  // Subscribe to the shared filter store (hash + custom event) so writes from
  // the sticky filter bar are reflected here, and vice versa.
  useEffect(() => {
    setActiveFilter(readFilterFromHash());

    return subscribeFilter((category) => {
      setActiveFilter(category);
      // A filter change invalidates the open lightbox index.
      setActiveIndex(null);
    });
  }, []);

  const filteredItems = useMemo(
    () =>
      activeFilter === "All"
        ? currentData.portfolio
        : currentData.portfolio.filter((item) => item.category === activeFilter),
    [currentData.portfolio, activeFilter],
  );

  const activeItem =
    activeIndex !== null ? (filteredItems[activeIndex] ?? null) : null;

  const closeLightbox = () => setActiveIndex(null);

  const showPrev = () =>
    setActiveIndex((prev) =>
      prev === null || filteredItems.length === 0
        ? null
        : (prev - 1 + filteredItems.length) % filteredItems.length,
    );

  const showNext = () =>
    setActiveIndex((prev) =>
      prev === null || filteredItems.length === 0
        ? null
        : (prev + 1) % filteredItems.length,
    );

  return (
    <div>
        <Reveal className="mb-16">
          <p className="eyebrow mb-6">Portfolio</p>
          <h2 className="display-title text-[var(--text-primary)]">
            Selected Work
          </h2>
          <p
            className="mt-6 text-sm text-[var(--text-tertiary)]"
            role="status"
            aria-live="polite"
          >
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "piece" : "pieces"}
            {activeFilter === "All" ? "" : ` in ${activeFilter}`}
          </p>
          {/*
            One disclosure for the whole grid, rather than a badge on every
            tile: six "placeholder" chips read as a broken build, while one line
            under the heading is unambiguous and lets the photography stand on
            its own. The alt text on each image says the same thing, so the
            statement survives even if this line is missed.
          */}
          {(portfolio.hero?.placeholder ||
            portfolio.portrait?.placeholder ||
            portfolio.portfolio.some((item) => item.placeholder)) && (
            <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[var(--text-tertiary)] opacity-70">
              Placeholder imagery — real photographs to follow
            </p>
          )}
        </Reveal>

        {/* The category control lives in PortfolioFilter above; this section
            only renders the grid so there is a single filter on the page. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item, index) => (
            <Reveal
              as="article"
              key={item.id}
              delay={index * 0.08}
              duration={0.5}
              className="group relative overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
            >
              <button
                type="button"
                aria-label={`Open ${item.title} in the lightbox`}
                className="relative block aspect-[3/4] w-full cursor-zoom-in overflow-hidden bg-[var(--bg-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-primary)]"
                onClick={() => setActiveIndex(index)}
              >
                <Image
                  src={item.path}
                  alt={item.alt || `${item.title} by ${item.brand}`}
                  fill
                  // The grid sits below a full-height hero, so no image here is
                  // above the fold; preloading them only delays the real paint.
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  style={{
                    backgroundImage: fallbackGradient,
                    objectPosition: item.position ?? "50% 50%",
                  }}
                />

                {/* Category chip — decorative, the category is also in the caption */}
                <span
                  aria-hidden="true"
                  className="absolute left-4 top-4 border border-white/25 bg-black/70 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-white/85 backdrop-blur-sm"
                >
                  {item.category}
                </span>


                {/* Hover affordance */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 flex translate-y-2 justify-end bg-gradient-to-t from-black/80 to-transparent p-4 text-[11px] uppercase tracking-[0.2em] text-white/90 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
                >
                  View →
                </span>
              </button>

              <div className="relative p-6">
                {/*
                  The affordance sits on the title's baseline rather than the
                  caption's. Placed on the caption row it collided with
                  "Studio · Black & White Series" — two absolutely-positioned
                  siblings fighting for the same line — and reserving padding
                  only made the collection name wrap mid-phrase. On the title
                  row there is room for both, because titles are short.
                */}
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-lg font-light text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-xs uppercase tracking-[0.2em] text-[var(--text-tertiary)] transition-colors duration-200 group-hover:text-[var(--text-primary)]"
                  >
                    View <span aria-hidden="true">→</span>
                  </span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                  {item.brand}
                  {item.collection ? ` · ${item.collection}` : ""}
                </p>
                {/*
                  Decorative, not a second control. The image button above
                  already opens this card, so a button here would add a second
                  tab stop for the same action — six cards, twelve stops, no
                  extra capability.
                */}
              </div>
            </Reveal>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <p className="py-16 text-center text-sm text-[var(--text-tertiary)]">
            Nothing in this category yet.
          </p>
        )}

      {activeItem && (
        <Lightbox
          isOpen
          imageUrl={activeItem.path}
          altText={activeItem.alt || `${activeItem.title} by ${activeItem.brand}`}
          onClose={closeLightbox}
          onPrev={showPrev}
          onNext={showNext}
          index={activeIndex ?? 0}
          total={filteredItems.length}
        />
      )}
    </div>
  );
}

export type { PortfolioItem };
