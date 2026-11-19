"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { portfolio, type PortfolioItem } from "../../data/portfolio";
import Reveal, { EDITORIAL_EASE, EDITORIAL_VIEWPORT } from "./Reveal";
import Lightbox from "./Lightbox";
import type { GalleryViewMode } from "./PortfolioFilter";
import {
  readFilterFromHash,
  subscribeFilter,
  type Filter,
} from "../../lib/portfolio-filter";

const fallbackGradient =
  "radial-gradient(circle at 50% 14%, rgba(200, 30, 50, 0.12) 0%, rgba(247, 247, 245, 0) 40%), linear-gradient(150deg, #EEEEEA 0%, #F7F7F5 55%, #E2E2DC 100%)";

interface GallerySectionProps {
  data?: typeof portfolio | null;
  viewMode: GalleryViewMode;
}

export default function GallerySection({
  data,
  viewMode,
}: GallerySectionProps) {
  const currentData = data ?? portfolio;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  useEffect(() => {
    setActiveFilter(readFilterFromHash());

    return subscribeFilter((category) => {
      setActiveFilter(category);
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

  const isAllBento = activeFilter === "All" && filteredItems.length === 6;

  return (
    <div>
      <Reveal
        y={20}
        duration={0.55}
        className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end"
      >
        <div>
          <p className="eyebrow mb-3 !text-[var(--accent-primary)]">03. Portfolio</p>
          <h2 className="display-title text-[var(--text-primary)]">
            Selected <span className="italic font-light">Studies</span>
          </h2>
        </div>

        <p
          className="font-mono text-xs tabular-nums text-[var(--text-tertiary)]"
          role="status"
          aria-live="polite"
        >
          {String(filteredItems.length).padStart(2, "0")}{" "}
          {filteredItems.length === 1 ? "study" : "studies"}
          {activeFilter === "All" ? " · Full archive" : ` · ${activeFilter}`}
        </p>
      </Reveal>

      {viewMode === "index" ? (
        <div className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
          {filteredItems.map((item, index) => (
            <motion.button
              key={item.id}
              type="button"
              data-cursor="view"
              onClick={() => setActiveIndex(index)}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={EDITORIAL_VIEWPORT}
              transition={{
                duration: 0.48,
                delay: Math.min(index * 0.045, 0.25),
                ease: EDITORIAL_EASE,
              }}
              className="group flex w-full items-center justify-between gap-4 py-4 text-left transition-colors duration-200 hover:bg-[var(--bg-secondary)]/60 sm:px-3"
            >
              <div className="flex min-w-0 items-center gap-4 sm:gap-6">
                <span className="font-mono text-xs tabular-nums text-[var(--text-tertiary)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="relative h-16 w-12 shrink-0 overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                  <Image
                    src={item.path}
                    alt={item.alt || `${item.title} by ${item.brand}`}
                    fill
                    referrerPolicy="no-referrer"
                    sizes="48px"
                    style={{ objectPosition: item.position ?? "50% 30%" }}
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-display text-xl font-normal text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-[var(--text-tertiary)]">
                    <span>{item.category}</span>
                    <span aria-hidden="true" className="mx-1.5">
                      ·
                    </span>
                    <span>{item.brand}</span>
                    {item.collection && (
                      <>
                        <span aria-hidden="true" className="mx-1.5">
                          ·
                        </span>
                        <span>{item.collection}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)] transition-colors duration-200 group-hover:text-[var(--accent-primary)]">
                <span className="hidden sm:inline">View</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </motion.button>
          ))}
        </div>
      ) : isAllBento ? (
        <div className="space-y-12">
          {/* Row 1: 3-column 3:4 portrait triptych */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-3">
            {filteredItems.slice(0, 3).map((item, idx) => (
              <EditorialCard
                key={item.id}
                item={item}
                index={idx}
                staggerSlot={idx}
                aspectClass="aspect-[3/4]"
                sizes="(max-width: 768px) 100vw, 33vw"
                onOpen={() => setActiveIndex(idx)}
              />
            ))}
          </div>

          {/* Row 2: 2-column wide 4:3 diptych */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2">
            {filteredItems.slice(3, 5).map((item, idx) => {
              const globalIdx = idx + 3;
              return (
                <EditorialCard
                  key={item.id}
                  item={item}
                  index={globalIdx}
                  staggerSlot={idx}
                  useWide
                  aspectClass="aspect-[4/3]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onOpen={() => setActiveIndex(globalIdx)}
                />
              );
            })}
          </div>

          {/* Row 3: Featured Monograph Spread */}
          {filteredItems[5] && (
            <article className="grid grid-cols-1 items-center gap-8 border-t border-[var(--border-subtle)] pt-12 lg:grid-cols-12 lg:gap-12">
              <Reveal
                y={24}
                duration={0.62}
                className="lg:col-span-7"
              >
                <button
                  type="button"
                  data-cursor="view"
                  aria-label={`Open ${filteredItems[5].title} in the lightbox`}
                  onClick={() => setActiveIndex(5)}
                  className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                >
                  <motion.div
                    initial={{ scale: 1.05 }}
                    whileInView={{ scale: 1 }}
                    viewport={EDITORIAL_VIEWPORT}
                    transition={{ duration: 0.85, ease: EDITORIAL_EASE }}
                    className="relative h-full w-full"
                  >
                    <Image
                      src={filteredItems[5].widePath ?? filteredItems[5].path}
                      alt={
                        filteredItems[5].alt ||
                        `${filteredItems[5].title} by ${filteredItems[5].brand}`
                      }
                      fill
                      referrerPolicy="no-referrer"
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025]"
                      style={{
                        backgroundImage: fallbackGradient,
                        objectPosition: filteredItems[5].position ?? "50% 35%",
                      }}
                    />
                  </motion.div>
                </button>
              </Reveal>

              <Reveal
                y={20}
                delay={0.1}
                duration={0.58}
                className="lg:col-span-5"
              >
                <p className="font-mono text-xs tabular-nums text-[var(--accent-primary)]">
                  06 · Feature Study
                </p>
                <h3 className="mt-3 font-display text-3xl font-normal text-[var(--text-primary)] md:text-4xl">
                  {filteredItems[5].title}
                </h3>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                  <span>{filteredItems[5].category}</span>
                  <span aria-hidden="true" className="mx-2">
                    ·
                  </span>
                  <span>{filteredItems[5].brand}</span>
                  {filteredItems[5].collection && (
                    <>
                      <span aria-hidden="true" className="mx-2">
                        ·
                      </span>
                      <span>{filteredItems[5].collection}</span>
                    </>
                  )}
                </p>
                <p className="prose-editorial mt-5 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {filteredItems[5].alt}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveIndex(5)}
                  className="cinematic-button-outline mt-8"
                >
                  <span>Open Full Frame</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </Reveal>
            </article>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item, index) => (
            <EditorialCard
              key={item.id}
              item={item}
              index={index}
              staggerSlot={index % 3}
              aspectClass="aspect-[3/4]"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onOpen={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}

      {filteredItems.length === 0 && (
        <p className="border-y border-[var(--border-subtle)] py-16 text-center text-sm text-[var(--text-tertiary)]">
          No studies listed in this category yet.
        </p>
      )}

      <Lightbox
        isOpen={Boolean(activeItem)}
        items={filteredItems}
        activeIndex={activeIndex ?? 0}
        onSelectIndex={setActiveIndex}
        onClose={closeLightbox}
        onPrev={showPrev}
        onNext={showNext}
      />
    </div>
  );
}

interface EditorialCardProps {
  item: PortfolioItem;
  index: number;
  staggerSlot: number;
  aspectClass: string;
  sizes: string;
  useWide?: boolean;
  onOpen: () => void;
}

function EditorialCard({
  item,
  index,
  staggerSlot,
  aspectClass,
  sizes,
  useWide = false,
  onOpen,
}: EditorialCardProps) {
  const imageSrc = useWide && item.widePath ? item.widePath : item.path;
  const rowDelay = staggerSlot * 0.08;

  return (
    <Reveal
      as="article"
      y={26}
      delay={rowDelay}
      duration={0.58}
      className="group"
    >
      <button
        type="button"
        data-cursor="view"
        aria-label={`Open ${item.title} in the lightbox`}
        onClick={onOpen}
        className={`relative block ${aspectClass} w-full cursor-zoom-in overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]`}
      >
        <motion.div
          initial={{ scale: 1.05 }}
          whileInView={{ scale: 1 }}
          viewport={EDITORIAL_VIEWPORT}
          transition={{ duration: 0.85, delay: rowDelay, ease: EDITORIAL_EASE }}
          className="relative h-full w-full"
        >
          <Image
            src={imageSrc}
            alt={item.alt || `${item.title} by ${item.brand}`}
            fill
            referrerPolicy="no-referrer"
            sizes={sizes}
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            style={{
              backgroundImage: fallbackGradient,
              objectPosition: item.position ?? "50% 30%",
            }}
          />
        </motion.div>
      </button>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2.5">
            <span className="font-mono text-xs tabular-nums text-[var(--accent-primary)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="truncate font-display text-xl font-normal text-[var(--text-primary)]">
              {item.title}
            </h3>
          </div>
          <p className="mt-1 truncate text-xs text-[var(--text-tertiary)]">
            <span>{item.category}</span>
            <span aria-hidden="true" className="mx-1.5">
              ·
            </span>
            <span>{item.brand}</span>
            {item.collection && (
              <>
                <span aria-hidden="true" className="mx-1.5">
                  ·
                </span>
                <span>{item.collection}</span>
              </>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpen}
          aria-label={`Inspect ${item.title}`}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-[var(--text-tertiary)] transition-colors duration-200 group-hover:text-[var(--text-primary)]"
        >
          <ArrowUpRight
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </button>
      </div>
    </Reveal>
  );
}

export type { PortfolioItem };
