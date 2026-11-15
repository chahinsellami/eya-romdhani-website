"use client";

import { portfolio, type Portfolio } from "../../data/portfolio";
import Reveal from "./Reveal";

interface StatsSectionProps {
  data?: Portfolio | null;
}

/** Measurements, physical stats and professional history. */
export default function StatsSection({ data }: StatsSectionProps) {
  const currentData = data ?? portfolio;

  const measurements = [
    { label: "Height", value: `${currentData.height} cm` },
    { label: "Bust", value: currentData.measurements.bust },
    { label: "Waist", value: currentData.measurements.waist },
    { label: "Hips", value: currentData.measurements.hips },
    { label: "Shoe", value: currentData.stats.shoeSize },
  ];

  const features = [
    { label: "Hair", value: currentData.stats.hair },
    { label: "Eyes", value: currentData.stats.eyes },
    // Only shown when there is an agency to name — an independent model gets no
    // "Agency:" row with nothing after the colon.
    ...(currentData.agency
      ? [{ label: "Agency", value: currentData.agency }]
      : []),
  ];

  return (
    // Spans the shared shell so its edges line up with every other section.
    <Reveal className="mx-auto w-full">
      <div className="grid grid-cols-1 gap-12 border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 md:grid-cols-2 md:p-10">
        {/* Physical profile */}
        <div className="space-y-8">
          <section aria-labelledby="measurements-heading">
            <h3 id="measurements-heading" className="eyebrow mb-4">
              Measurements
            </h3>
            <dl className="space-y-2 text-sm">
              {measurements.map((item) => (
                <div key={item.label} className="flex gap-2">
                  <dt className="text-[var(--text-tertiary)]">{item.label}:</dt>
                  <dd className="text-[var(--text-primary)]">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="features-heading">
            <h3 id="features-heading" className="eyebrow mb-4">
              Features
            </h3>
            <dl className="space-y-2 text-sm">
              {features.map((item) => (
                <div key={item.label} className="flex gap-2">
                  <dt className="text-[var(--text-tertiary)]">{item.label}:</dt>
                  <dd className="text-[var(--text-primary)]">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {currentData.nationality && currentData.origin && (
            <div className="space-y-2 border-t border-[var(--border-subtle)] pt-4">
              <h3 className="eyebrow mb-2">Origin</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {currentData.nationality} · {currentData.origin}
              </p>
            </div>
          )}
        </div>

        {/* Professional history */}
        <div className="space-y-8">
          <section aria-labelledby="runway-heading">
            <h3 id="runway-heading" className="eyebrow mb-4">
              Runway Shows
            </h3>
            {currentData.runwayShows.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {currentData.runwayShows.slice(0, 8).map((show) => (
                  <li
                    key={`${show.brand}-${show.collection}`}
                    className="flex flex-wrap items-baseline gap-x-2"
                  >
                    <span className="font-medium text-[var(--text-primary)]">
                      {show.brand}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {show.collection}
                    </span>
                    {show.city && (
                      <span className="text-xs text-[var(--text-tertiary)]">
                        · {show.city}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs italic text-[var(--text-tertiary)]">
                No runway shows listed
              </p>
            )}
          </section>

          <section aria-labelledby="campaigns-heading">
            <h3 id="campaigns-heading" className="eyebrow mb-4">
              Featured Campaigns
            </h3>
            {currentData.featuredCampaigns.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {currentData.featuredCampaigns.map((campaign) => (
                  <li
                    key={`${campaign.brand}-${campaign.collection ?? "campaign"}`}
                    className="flex flex-wrap items-baseline gap-x-2"
                  >
                    {campaign.url ? (
                      <a
                        href={campaign.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline font-medium text-[var(--text-primary)]"
                      >
                        {campaign.brand}
                      </a>
                    ) : (
                      <span className="font-medium text-[var(--text-primary)]">
                        {campaign.brand}
                      </span>
                    )}
                    {campaign.collection && (
                      <span className="text-xs text-[var(--text-secondary)]">
                        · {campaign.collection}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs italic text-[var(--text-tertiary)]">
                No featured campaigns listed
              </p>
            )}
          </section>

          {currentData.lookbooks.length > 0 && (
            <section
              aria-labelledby="lookbooks-heading"
              className="space-y-4 border-t border-[var(--border-subtle)] pt-4"
            >
              <h3 id="lookbooks-heading" className="eyebrow">
                Lookbooks
              </h3>
              <ul className="space-y-3 text-sm">
                {currentData.lookbooks.map((lookbook) => (
                  <li key={lookbook.id}>
                    <p className="font-medium text-[var(--text-primary)]">
                      {lookbook.title}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {lookbook.brand} · {lookbook.editorial}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </Reveal>
  );
}
