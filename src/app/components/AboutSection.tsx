"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Printer } from "lucide-react";
import { portfolio, type Portfolio } from "../../data/portfolio";
import Reveal, {
  EDITORIAL_EASE,
  EDITORIAL_VIEWPORT,
  RevealGroup,
  RevealItem,
} from "./Reveal";

interface AboutSectionProps {
  data?: Portfolio | null;
}

export default function AboutSection({ data }: AboutSectionProps) {
  const currentData = data ?? portfolio;
  const { portrait } = currentData;

  const facts = [
    { label: "Base City", value: currentData.origin ?? "" },
    { label: "Nationality", value: currentData.nationality ?? "" },
    {
      label: "Representation",
      value: currentData.agency ?? "Independent · Direct Inquiries",
    },
    { label: "Availability", value: "Runway, Editorial, Campaign & Beauty" },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value));

  return (
    <div>
      <Reveal
        y={20}
        duration={0.55}
        className="mb-12 flex flex-col justify-between gap-6 border-b border-[var(--border-subtle)] pb-8 md:flex-row md:items-end"
      >
        <div>
          <p className="eyebrow mb-3 !text-[var(--accent-primary)]">01. Profile</p>
          <h2 id="about-heading" className="display-title text-[var(--text-primary)]">
            Presence &amp;{" "}
            <span className="italic font-light">Editorial Voice</span>
          </h2>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="no-print cinematic-button-outline self-start md:self-auto"
        >
          <Printer className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Print Comp Card</span>
        </button>
      </Reveal>

      <div
        className={
          portrait
            ? "grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14"
            : "grid grid-cols-1 gap-8"
        }
      >
        {portrait && (
          <Reveal
            as="figure"
            y={26}
            duration={0.65}
            className="lg:col-span-5"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <motion.div
                initial={{ scale: 1.05 }}
                whileInView={{ scale: 1 }}
                viewport={EDITORIAL_VIEWPORT}
                transition={{ duration: 0.85, ease: EDITORIAL_EASE }}
                className="relative h-full w-full"
              >
                <Image
                  src={portrait.path}
                  alt={portrait.alt}
                  fill
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 1024px) 100vw, 38vw"
                  style={{ objectPosition: portrait.position ?? "50% 25%" }}
                  className="object-cover"
                />
              </motion.div>
            </div>
            {portrait.credit && (
              <figcaption className="mt-3 flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                <span>{portrait.credit}</span>
                <span className="font-mono tabular-nums">
                  {currentData.origin ?? "Sousse"}
                </span>
              </figcaption>
            )}
          </Reveal>
        )}

        <div className={portrait ? "lg:col-span-7" : ""}>
          <Reveal y={22} delay={0.08} duration={0.6}>
            <p className="font-display text-2xl font-normal leading-snug text-[var(--text-primary)] md:text-3xl">
              “Drawn to the camera and the catwalk alike — built on stillness,
              architectural lines, and unforced poise.”
            </p>

            <p className="prose-editorial mt-6 text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
              {currentData.bio}
            </p>
          </Reveal>

          {facts.length > 0 && (
            <RevealGroup
              as="dl"
              stagger={0.06}
              delayChildren={0.12}
              className="mt-10 divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]"
            >
              {facts.map((fact) => (
                <RevealItem
                  key={fact.label}
                  y={12}
                  duration={0.48}
                  className="flex flex-wrap items-baseline justify-between gap-4 py-4"
                >
                  <dt className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                    {fact.label}
                  </dt>
                  <dd className="text-sm font-medium text-[var(--text-primary)]">
                    {fact.value}
                  </dd>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </div>
    </div>
  );
}
