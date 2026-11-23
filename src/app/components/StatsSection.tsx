"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { portfolio, type Portfolio } from "../../data/portfolio";

gsap.registerPlugin(ScrollTrigger);

interface StatsSectionProps {
  data?: Portfolio | null;
}

const BOOKING_DISCIPLINES = [
  {
    title: "Runway",
    detail: "Collection presentations, fashion weeks and fittings.",
  },
  {
    title: "Editorial",
    detail: "Magazine stories and studio portrait work.",
  },
  {
    title: "Campaigns and lookbooks",
    detail: "Seasonal brand stories, resort collections and e-commerce.",
  },
  {
    title: "Beauty and commercial",
    detail: "Close-up work for skincare, jewellery and eyewear.",
  },
];

export default function StatsSection({ data }: StatsSectionProps) {
  const currentData = data ?? portfolio;
  const bandRef = useRef<HTMLDivElement>(null);

  const lines = [
    ["Height", `${currentData.height} cm`],
    ["Bust", currentData.measurements.bust],
    ["Waist", currentData.measurements.waist],
    ["Hips", currentData.measurements.hips],
    ["Shoes", currentData.stats.shoeSize],
    ["Hair", currentData.stats.hair],
    ["Eyes", currentData.stats.eyes],
  ];

  const hasProfessionalCredits =
    currentData.runwayShows.length > 0 ||
    currentData.featuredCampaigns.length > 0 ||
    currentData.lookbooks.length > 0;

  // One moment: the hairline draws in and the giant word drifts as the band crosses the screen
  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(band.querySelector("[data-rule]"), {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: { trigger: band, start: "top 70%", once: true },
      });
      gsap.fromTo(
        band.querySelector("[data-word]"),
        { xPercent: 6 },
        {
          xPercent: -4,
          ease: "none",
          scrollTrigger: { trigger: band, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <div>
      {/* The band: measurements on the left, the giant word over a darkened close-up */}
      <div ref={bandRef} className="relative grid grid-cols-1 overflow-hidden lg:min-h-[100svh] lg:grid-cols-12">
        <div className="relative lg:absolute lg:inset-y-0 lg:right-0 lg:w-[66%]">
          <div data-gl className="relative h-[62svh] w-full lg:h-full">
            <Image
              src="/images/portfolio/flash-choker.webp"
              alt={`Low-angle flash portrait of ${currentData.name} in a black choker, chin raised`}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              style={{ objectPosition: "50% 38%" }}
              className="object-cover"
            />
          </div>
          {/* Above the WebGL canvas (z-5): darkens the print so the word and the list stay readable */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[6] lg:-left-2 bg-[linear-gradient(to_top,var(--ink)_0%,rgba(11,10,9,0.3)_45%,rgba(11,10,9,0.15)_100%)] lg:bg-[linear-gradient(to_right,var(--ink)_0%,rgba(11,10,9,0.72)_32%,rgba(11,10,9,0.3)_70%,rgba(11,10,9,0.12)_100%)]"
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between gap-12 px-[var(--space-gutter)] py-14 lg:col-span-4 lg:py-[var(--space-section)]">
          <p className="type-label flex items-center gap-3">
            04 <span aria-hidden="true" className="inline-block h-px w-8 bg-current" /> Comp card
          </p>

          <div>
            <h2 id="comp-card-heading" className="sr-only">
              Comp card
            </h2>
            <dl className="space-y-3">
              {lines.map(([label, value]) => (
                <div key={label} className="flex gap-4 text-[0.75rem] font-medium uppercase tracking-[0.24em]">
                  <dt className="w-20 text-[var(--ash)]">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <button type="button" onClick={() => window.print()} className="no-print button-solid mt-12">
              Print comp card
            </button>
          </div>
        </div>

        {/* Hairline into the giant word, spanning the band */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[36svh] z-10 flex items-center gap-[3vw] lg:top-1/2 lg:-translate-y-1/2 lg:pl-[22vw]"
        >
          <span data-rule className="hidden h-px w-[14vw] bg-[var(--bone)] lg:block" />
          <span
            data-word
            className="type-serif whitespace-nowrap pl-[var(--space-gutter)] text-[clamp(4rem,19vw,22rem)] uppercase leading-none lg:pl-0"
          >
            Presence
          </span>
        </div>
      </div>

      <div className="section-shell border-t border-[var(--border-on-ink)] !pt-12">
        {hasProfessionalCredits ? (
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {currentData.runwayShows.length > 0 && (
              <CreditList title="Runway">
                {currentData.runwayShows.slice(0, 8).map((show) => (
                  <li key={`${show.brand}-${show.collection}`}>
                    <span className="type-serif text-[1.75rem]">{show.brand}</span>
                    <span className="block text-[var(--ash)]">
                      {[show.collection, show.city].filter(Boolean).join(", ")}
                    </span>
                  </li>
                ))}
              </CreditList>
            )}
            {currentData.featuredCampaigns.length > 0 && (
              <CreditList title="Campaigns">
                {currentData.featuredCampaigns.map((campaign) => (
                  <li key={`${campaign.brand}-${campaign.collection ?? "campaign"}`}>
                    {campaign.url ? (
                      <a
                        href={campaign.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline type-serif text-[1.75rem]"
                      >
                        {campaign.brand}
                      </a>
                    ) : (
                      <span className="type-serif text-[1.75rem]">{campaign.brand}</span>
                    )}
                    {campaign.collection && (
                      <span className="block text-[var(--ash)]">{campaign.collection}</span>
                    )}
                  </li>
                ))}
              </CreditList>
            )}
            {currentData.lookbooks.length > 0 && (
              <CreditList title="Lookbooks">
                {currentData.lookbooks.map((lookbook) => (
                  <li key={lookbook.id}>
                    <span className="type-serif text-[1.75rem]">{lookbook.title}</span>
                    <span className="block text-[var(--ash)]">
                      {lookbook.brand}, {lookbook.editorial}
                    </span>
                  </li>
                ))}
              </CreditList>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_3fr]">
            <h3 className="type-label">Books for</h3>
            <ul className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2">
              {BOOKING_DISCIPLINES.map((discipline) => (
                <li key={discipline.title} className="border-t border-[var(--border-on-ink)] pt-5">
                  <p className="type-serif text-[clamp(2rem,1.4rem+1.6vw,3rem)]">{discipline.title}</p>
                  <p className="mt-3 max-w-[36ch] text-[var(--ash)]">{discipline.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function CreditList({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="type-label">{title}</h3>
      <ul className="mt-4 space-y-4">{children}</ul>
    </section>
  );
}
