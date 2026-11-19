"use client";

import { ArrowUpRight, ArrowDown } from "lucide-react";
import type { Portfolio } from "../../data/portfolio";
import { scrollToSectionById } from "../../lib/motion";
import HeroPortrait from "./HeroPortrait";

interface HeroSectionProps {
  data: Portfolio;
  onNavigate?: (id: string) => void;
}

const MARQUEE_ITEMS = [
  "Runway",
  "Editorial",
  "Campaign",
  "Lookbook",
  "Beauty",
  "Sousse, Tunisia",
  "International Bookings",
];

export default function HeroSection({ data, onNavigate }: HeroSectionProps) {
  const navigate = onNavigate ?? scrollToSectionById;
  const nameParts = data.name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? data.name;
  const lastName = nameParts.slice(1).join(" ");

  const heroSpecs = [
    { label: "Height", value: `${data.height} cm` },
    { label: "Bust", value: data.measurements.bust },
    { label: "Waist", value: data.measurements.waist },
    { label: "Hips", value: data.measurements.hips },
    { label: "Features", value: `${data.stats.eyes} eyes · ${data.stats.hair}` },
  ];

  return (
    <section id="top" aria-label="Introduction" className="pt-16 md:pt-20">
      <div className="shell pt-6 pb-10 md:pt-14 md:pb-16">
        <div className="grid grid-cols-1 items-stretch gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left column: Immediate-paint editorial masthead */}
          <div className="flex flex-col justify-between lg:col-span-6 lg:py-4">
            <div>
              <p className="eyebrow text-[var(--accent-primary)]">
                {data.title ?? "Runway & Editorial Model"}
                <span aria-hidden="true" className="mx-2 text-[var(--text-tertiary)]">
                  ·
                </span>
                <span className="text-[var(--text-tertiary)]">
                  {data.origin ?? "Sousse, Tunisia"}
                </span>
              </p>

              <h1 className="display-hero mt-5 text-[var(--text-primary)] sm:mt-6">
                <span className="block">{firstName}</span>
                {lastName && (
                  <span className="block font-light italic text-[var(--text-primary)]">
                    {lastName}
                  </span>
                )}
              </h1>

              <p className="prose-editorial mt-6 text-base leading-relaxed text-[var(--text-secondary)] sm:mt-8 md:text-lg">
                {data.bio}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <button
                  type="button"
                  onClick={() => navigate("portfolio")}
                  className="cinematic-button w-full sm:w-auto"
                >
                  <span>Explore Portfolio</span>
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("contact")}
                  className="cinematic-button-outline w-full sm:w-auto"
                >
                  <span>Booking Inquiries</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mt-8 border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--text-tertiary)] sm:mt-12 sm:pt-5 lg:mt-16">
              <span>{data.tagline}</span>
              <span aria-hidden="true" className="mx-2 text-[var(--accent-primary)]">
                ·
              </span>
              <span>
                {data.agency
                  ? `Represented by ${data.agency}`
                  : "Independent · Direct Bookings"}
              </span>
            </div>
          </div>

          {/* Right column: Single turtleneck editorial portrait showcase */}
          <div className="flex flex-col lg:col-span-6">
            <HeroPortrait
              src={data.hero?.path}
              alt={data.hero?.alt}
              caption={data.hero?.credit}
              origin={data.origin}
              position={data.hero?.position}
            />
          </div>
        </div>
      </div>

      {/* Full-width Obsidian comp-card metric strip below the hero split */}
      <div
        className="bg-[var(--ink-bg)] text-[var(--on-ink)]"
        data-cursor-surface="dark"
      >
        <div className="shell">
          <dl className="grid grid-cols-2 sm:grid-cols-5 sm:divide-x sm:divide-[var(--border-on-ink)]">
            {heroSpecs.map((spec, idx) => {
              const isLast = idx === heroSpecs.length - 1;
              return (
                <div
                  key={spec.label}
                  className={`border-[var(--border-on-ink)] py-3.5 sm:px-5 sm:py-5 sm:first:pl-0 sm:last:pr-0 ${
                    isLast
                      ? "col-span-2 sm:col-span-1"
                      : idx % 2 === 0
                        ? "border-b border-r pr-4 sm:border-b-0 sm:border-r-0"
                        : "border-b pl-4 sm:border-b-0"
                  }`}
                >
                  <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--accent-on-ink)]">
                    {spec.label}
                  </dt>
                  <dd className="mt-1 font-mono text-sm font-medium tabular-nums text-[var(--on-ink)] md:text-base">
                    {spec.value}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>

      {/* Subtle editorial marquee divider */}
      <div
        className="overflow-hidden border-b border-[var(--border-subtle)] py-3"
        aria-hidden="true"
      >
        <div className="animate-editorial-marquee flex w-max items-center gap-8 whitespace-nowrap text-xs uppercase tracking-[0.24em] text-[var(--text-tertiary)]">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map(
            (item, idx) => (
              <span key={`${item}-${idx}`} className="inline-flex items-center gap-8">
                <span className={idx % 2 === 1 ? "font-display text-sm italic normal-case tracking-normal text-[var(--text-secondary)]" : ""}>
                  {item}
                </span>
                <span className="text-[var(--accent-primary)]">·</span>
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
