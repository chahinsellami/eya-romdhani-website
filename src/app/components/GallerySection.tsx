"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { gsap } from "gsap";
import type { Portfolio, PortfolioItem } from "../../data/portfolio";

const Lightbox = dynamic(() => import("./Lightbox"), { ssr: false });

interface FrameSpec {
  itemId: string;
  src?: string; // defaults to the item's own path
  position?: string;
  caption?: string;
}

interface SeriesSpec {
  name: string;
  note: string;
  frames: FrameSpec[];
}

const ID = {
  turtleI: "ebcd7890-1234-5678-90ab-cdef01234569",
  turtleII: "ebcd7890-1234-5678-90ab-cdef0123456a",
  close: "ebcd7890-1234-5678-90ab-cdef0123456c",
  hand: "ebcd7890-1234-5678-90ab-cdef0123456d",
  shearling: "ebcd7890-1234-5678-90ab-cdef0123456f",
  choker: "ebcd7890-1234-5678-90ab-cdef01234570",
  shoulder: "ebcd7890-1234-5678-90ab-cdef01234571",
};

const SERIES: SeriesSpec[] = [
  {
    name: "Flash",
    note: "Night, an on-camera flash, a shearling jacket and a black choker.",
    frames: [{ itemId: ID.shearling }, { itemId: ID.choker }, { itemId: ID.shoulder }],
  },
  {
    name: "Window light",
    note: "Black and white, in the studio, with the window drawing lines across the wall.",
    frames: [{ itemId: ID.turtleI }, { itemId: ID.turtleII }],
  },
  {
    name: "Close",
    note: "Colour, close to the lens.",
    frames: [{ itemId: ID.close }, { itemId: ID.hand, src: "/images/portfolio/hand-over-face.webp", position: "50% 40%" }],
  },
];

/* How a series' prints share the stage: one fills it, two split it, three go one large and two stacked. */
const STAGE_LAYOUT: Record<number, string[]> = {
  1: ["inset-0"],
  2: ["inset-y-0 left-0 right-[calc(50%+1px)]", "inset-y-0 right-0 left-[calc(50%+1px)]"],
  3: [
    "inset-y-0 left-0 right-[calc(40%+1px)]",
    "top-0 right-0 bottom-[calc(50%+1px)] left-[calc(60%+1px)]",
    "bottom-0 right-0 top-[calc(50%+1px)] left-[calc(60%+1px)]",
  ],
};

interface Frame {
  item: PortfolioItem; // what the lightbox shows: the item with this print's path
  series: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

/*
  Editorial index: a contents page. The series are listed in huge thin serif on
  the left; pointing at one (or focusing it) crossfades its prints onto the
  stage on the right. On phones each title is simply followed by its prints.
*/
export default function GallerySection({ data }: { data: Portfolio }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hasOpenedLightbox, setHasOpenedLightbox] = useState(false);

  // Resolve the series against the data; prints whose item is missing are skipped.
  const { series, frames } = useMemo(() => {
    const byId = new Map(data.portfolio.map((item) => [item.id, item]));
    const all: Frame[] = [];
    const kept: (SeriesSpec & { start: number; count: number })[] = [];
    SERIES.forEach((spec) => {
      const start = all.length;
      spec.frames.forEach((f) => {
        const base = byId.get(f.itemId);
        if (!base) return;
        all.push({
          series: kept.length,
          item: {
            ...base,
            id: `${base.id}-${all.length}`,
            path: f.src ?? base.path,
            position: f.position ?? base.position,
            collection: f.caption ?? base.collection,
          },
        });
      });
      const count = Math.min(all.length - start, 3);
      if (count > 0) kept.push({ ...spec, start, count });
      all.length = start + count; // a stage holds three prints at most
    });
    return { series: kept, frames: all };
  }, [data.portfolio]);

  const items = useMemo(() => frames.map((f) => f.item), [frames]);

  // Crossfade the stage. GSAP writes inline opacity, which the WebGL planes follow.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stage.querySelectorAll<HTMLElement>("[data-print]").forEach((el) => {
      const on = Number(el.dataset.series) === active;
      gsap.to(el, { opacity: on ? 1 : 0, duration: reduce ? 0 : on ? 0.9 : 0.5, ease: "power2.out", overwrite: true });
    });
  }, [active]);

  const open = (index: number) => {
    setHasOpenedLightbox(true);
    setActiveIndex(index);
  };

  const now = series[active];

  return (
    <div className="section-shell">
      <div className="flex items-center justify-between gap-6">
        <IndexLabel index="02" name="Work" />
        <p className="type-label hidden lg:block">
          {series.length} series, {frames.length} photographs
        </p>
      </div>
      <h2 id="portfolio-heading" className="sr-only">
        Work
      </h2>

      {/* Desktop: index left, stage right */}
      <div className="mt-12 hidden gap-[4vw] lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col justify-between">
          <ol className="border-t border-[var(--border-subtle)]" aria-label="Series">
            {series.map((s, si) => (
              <li key={s.name} className="border-b border-[var(--border-subtle)]">
                <button
                  type="button"
                  onMouseEnter={() => setActive(si)}
                  onFocus={() => setActive(si)}
                  onClick={() => setActive(si)}
                  aria-pressed={si === active}
                  className={`group flex w-full items-baseline gap-6 py-5 text-left transition-opacity duration-500 ${
                    si === active ? "opacity-100" : "opacity-35 hover:opacity-70"
                  }`}
                >
                  <span className="type-label w-8 shrink-0 !text-current">{pad(si + 1)}</span>
                  <span className="type-serif text-[clamp(3rem,5.6vw,6.5rem)] leading-[0.95]">{s.name}</span>
                  <span className="type-label ml-auto shrink-0 !text-current">{pad(s.count)}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="mt-10 min-h-[5rem]" aria-live="polite">
            <p className="type-label !text-[var(--bone)]">{now?.name}</p>
            <p className="mt-2 max-w-[38ch] text-[var(--ash)]">{now?.note}</p>
          </div>
        </div>

        <div ref={stageRef} className="relative h-[78svh] min-h-[520px]">
          {series.map((s, si) =>
            frames.slice(s.start, s.start + s.count).map((f, k) => {
              const index = s.start + k;
              return (
                <button
                  key={f.item.id}
                  type="button"
                  data-print
                  data-series={si}
                  data-gl
                  onClick={() => open(index)}
                  aria-label={`Open ${f.item.title} full screen`}
                  aria-hidden={si !== active}
                  tabIndex={si === active ? 0 : -1}
                  style={{ opacity: si === 0 ? 1 : 0 }}
                  className={`absolute ${STAGE_LAYOUT[s.count][k]} ${si === active ? "" : "pointer-events-none"}`}
                >
                  <Image
                    src={f.item.path}
                    alt={f.item.alt || f.item.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    style={{ objectPosition: f.item.position ?? "50% 35%" }}
                    className="object-cover"
                  />
                  <span className="type-label absolute bottom-3 left-3 z-10 !text-[var(--bone)] [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
                    {f.item.title}
                  </span>
                </button>
              );
            }),
          )}
        </div>
      </div>

      {/* Phones and tablets: each title followed by its prints */}
      <div className="mt-10 space-y-16 lg:hidden">
        {series.map((s, si) => (
          <section key={s.name} aria-label={s.name} className="border-t border-[var(--border-subtle)] pt-5">
            <div className="flex items-baseline gap-4">
              <span className="type-label !text-current">{pad(si + 1)}</span>
              <h3 className="type-serif text-[clamp(2.75rem,13vw,5rem)] leading-[0.95]">{s.name}</h3>
            </div>
            <p className="mt-3 max-w-[38ch] text-[0.9375rem] text-[var(--ash)]">{s.note}</p>
            <div className="mt-6 grid grid-cols-2 gap-[2px]">
              {frames.slice(s.start, s.start + s.count).map((f, k) => (
                <button
                  key={f.item.id}
                  type="button"
                  data-gl
                  onClick={() => open(s.start + k)}
                  aria-label={`Open ${f.item.title} full screen`}
                  className={`relative ${k === 0 && s.count !== 2 ? "col-span-2 aspect-[4/3]" : "aspect-[3/4]"}`}
                >
                  <Image
                    src={f.item.path}
                    alt={f.item.alt || f.item.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1px"
                    style={{ objectPosition: f.item.position ?? "50% 35%" }}
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {hasOpenedLightbox && (
        <Lightbox
          isOpen={activeIndex !== null}
          items={items}
          activeIndex={activeIndex ?? 0}
          onSelectIndex={setActiveIndex}
          onClose={() => setActiveIndex(null)}
          onPrev={() => setActiveIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length))}
          onNext={() => setActiveIndex((i) => (i === null ? null : (i + 1) % items.length))}
        />
      )}
    </div>
  );
}

/** "02 —— WORK": tracked caps with a 1px hairline as the dash. */
function IndexLabel({ index, name }: { index: string; name: string }) {
  return (
    <p className="type-label flex items-center gap-3 !text-current">
      <span>{index}</span>
      <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
      <span>{name}</span>
    </p>
  );
}
