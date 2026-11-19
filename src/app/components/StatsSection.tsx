"use client";

import { portfolio, type Portfolio } from "../../data/portfolio";
import Reveal, { RevealGroup, RevealItem } from "./Reveal";

interface StatsSectionProps {
  data?: Portfolio | null;
}

const BOOKING_DISCIPLINES = [
  {
    index: "01",
    title: "Runway & Catwalk",
    detail: "Collection presentations, seasonal fashion weeks, and atelier fittings.",
  },
  {
    index: "02",
    title: "Editorial & Print",
    detail: "Studio monographs, magazine spreads, and minimalist portrait studies.",
  },
  {
    index: "03",
    title: "Campaigns & Lookbooks",
    detail: "Seasonal brand storytelling, resort collections, and digital lookbooks.",
  },
  {
    index: "04",
    title: "Beauty & Commercial",
    detail: "Close-up portraiture, skincare, jewelry, and optical lighting tests.",
  },
];

export default function StatsSection({ data }: StatsSectionProps) {
  const currentData = data ?? portfolio;

  const measurements = [
    { label: "Height", value: `${currentData.height} cm` },
    { label: "Bust", value: currentData.measurements.bust },
    { label: "Waist", value: currentData.measurements.waist },
    { label: "Hips", value: currentData.measurements.hips },
    { label: "Shoe Size", value: currentData.stats.shoeSize },
    { label: "Hair", value: currentData.stats.hair },
    { label: "Eyes", value: currentData.stats.eyes },
  ];

  const hasProfessionalCredits =
    currentData.runwayShows.length > 0 ||
    currentData.featuredCampaigns.length > 0 ||
    currentData.lookbooks.length > 0;

  return (
    <div className="w-full">
      <Reveal
        y={20}
        duration={0.55}
        className="mb-10 border-b border-[var(--border-on-ink)] pb-6"
      >
        <p className="eyebrow mb-3 !text-[var(--accent-on-ink)]">02. Comp Card</p>
        <h2 className="display-title text-[var(--on-ink)]">
          Specifications &amp;{" "}
          <span className="italic font-light">Disciplines</span>
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Physical specifications table */}
        <div className="lg:col-span-5">
          <Reveal y={14} delay={0.04} duration={0.5}>
            <h3 className="eyebrow mb-4 !text-[var(--on-ink-tertiary)]">
              Physical Profile
            </h3>
          </Reveal>
          <RevealGroup
            as="dl"
            stagger={0.045}
            delayChildren={0.06}
            className="divide-y divide-[var(--border-on-ink)] border-y border-[var(--border-on-ink)]"
          >
            {measurements.map((item) => (
              <RevealItem
                key={item.label}
                y={12}
                duration={0.45}
                className="flex items-baseline justify-between gap-4 py-3.5"
              >
                <dt className="text-xs uppercase tracking-[0.16em] text-[var(--on-ink-tertiary)]">
                  {item.label}
                </dt>
                <dd className="font-mono text-sm font-medium tabular-nums text-[var(--on-ink)]">
                  {item.value}
                </dd>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        {/* Disciplines or verified credits */}
        <div className="lg:col-span-7">
          {hasProfessionalCredits ? (
            <div className="space-y-10">
              {currentData.runwayShows.length > 0 && (
                <section aria-labelledby="runway-heading">
                  <Reveal y={14} delay={0.06} duration={0.5}>
                    <h3
                      id="runway-heading"
                      className="eyebrow mb-4 !text-[var(--on-ink-tertiary)]"
                    >
                      Runway Shows
                    </h3>
                  </Reveal>
                  <RevealGroup
                    as="ul"
                    stagger={0.045}
                    delayChildren={0.08}
                    className="divide-y divide-[var(--border-on-ink)] border-y border-[var(--border-on-ink)]"
                  >
                    {currentData.runwayShows.slice(0, 8).map((show) => (
                      <RevealItem
                        as="li"
                        key={`${show.brand}-${show.collection}`}
                        y={12}
                        duration={0.45}
                        className="flex flex-wrap items-baseline justify-between gap-2 py-3.5 text-sm"
                      >
                        <span className="font-medium text-[var(--on-ink)]">
                          {show.brand}
                        </span>
                        <span className="text-xs text-[var(--on-ink-secondary)]">
                          {show.collection}
                          {show.city ? ` · ${show.city}` : ""}
                        </span>
                      </RevealItem>
                    ))}
                  </RevealGroup>
                </section>
              )}

              {currentData.featuredCampaigns.length > 0 && (
                <section aria-labelledby="campaigns-heading">
                  <Reveal y={14} delay={0.06} duration={0.5}>
                    <h3
                      id="campaigns-heading"
                      className="eyebrow mb-4 !text-[var(--on-ink-tertiary)]"
                    >
                      Featured Campaigns
                    </h3>
                  </Reveal>
                  <RevealGroup
                    as="ul"
                    stagger={0.045}
                    delayChildren={0.08}
                    className="divide-y divide-[var(--border-on-ink)] border-y border-[var(--border-on-ink)]"
                  >
                    {currentData.featuredCampaigns.map((campaign) => (
                      <RevealItem
                        as="li"
                        key={`${campaign.brand}-${campaign.collection ?? "campaign"}`}
                        y={12}
                        duration={0.45}
                        className="flex flex-wrap items-baseline justify-between gap-2 py-3.5 text-sm"
                      >
                        {campaign.url ? (
                          <a
                            href={campaign.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-underline font-medium text-[var(--on-ink)]"
                          >
                            {campaign.brand}
                          </a>
                        ) : (
                          <span className="font-medium text-[var(--on-ink)]">
                            {campaign.brand}
                          </span>
                        )}
                        {campaign.collection && (
                          <span className="text-xs text-[var(--on-ink-secondary)]">
                            {campaign.collection}
                          </span>
                        )}
                      </RevealItem>
                    ))}
                  </RevealGroup>
                </section>
              )}

              {currentData.lookbooks.length > 0 && (
                <section aria-labelledby="lookbooks-heading">
                  <Reveal y={14} delay={0.06} duration={0.5}>
                    <h3
                      id="lookbooks-heading"
                      className="eyebrow mb-4 !text-[var(--on-ink-tertiary)]"
                    >
                      Lookbooks
                    </h3>
                  </Reveal>
                  <RevealGroup
                    as="ul"
                    stagger={0.045}
                    delayChildren={0.08}
                    className="divide-y divide-[var(--border-on-ink)] border-y border-[var(--border-on-ink)]"
                  >
                    {currentData.lookbooks.map((lookbook) => (
                      <RevealItem
                        as="li"
                        key={lookbook.id}
                        y={12}
                        duration={0.45}
                        className="py-3.5 text-sm"
                      >
                        <p className="font-medium text-[var(--on-ink)]">
                          {lookbook.title}
                        </p>
                        <p className="mt-1 text-xs text-[var(--on-ink-secondary)]">
                          {lookbook.brand} · {lookbook.editorial}
                        </p>
                      </RevealItem>
                    ))}
                  </RevealGroup>
                </section>
              )}
            </div>
          ) : (
            <div>
              <Reveal y={14} delay={0.06} duration={0.5}>
                <h3 className="eyebrow mb-4 !text-[var(--on-ink-tertiary)]">
                  Booking Disciplines
                </h3>
              </Reveal>
              <RevealGroup
                stagger={0.075}
                delayChildren={0.1}
                className="grid grid-cols-1 divide-y divide-[var(--border-on-ink)] border-y border-[var(--border-on-ink)] sm:grid-cols-2 sm:divide-y-0"
              >
                {BOOKING_DISCIPLINES.map((discipline, idx) => (
                  <RevealItem
                    key={discipline.index}
                    y={18}
                    duration={0.55}
                    className={`border-[var(--border-on-ink)] py-6 ${
                      idx % 2 === 0 ? "sm:pr-8" : "sm:border-l sm:pl-8"
                    } ${idx >= 2 ? "sm:border-t" : ""}`}
                  >
                    <p className="font-mono text-xs tabular-nums text-[var(--accent-on-ink)]">
                      {discipline.index}
                    </p>
                    <h4 className="mt-2 font-display text-xl font-normal text-[var(--on-ink)]">
                      {discipline.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--on-ink-secondary)]">
                      {discipline.detail}
                    </p>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
