"use client";

import Image from "next/image";
import { portfolio, type Portfolio } from "../../data/portfolio";
import Reveal from "./Reveal";

interface AboutSectionProps {
  data?: Portfolio | null;
}

/**
 * About — the model profile.
 *
 * The previous version was a centred column of text: name, title, one paragraph.
 * On a portfolio page that is the one section where the subject should be seen,
 * so the bio now sits beside her portrait, with the facts an agency actually
 * asks for (representation, base city, nationality) broken out beneath the prose
 * rather than buried in a sentence.
 *
 * The portrait is optional in the data, so the section still renders as a single
 * centred column when no photograph is supplied.
 */
export default function AboutSection({ data }: AboutSectionProps) {
  const currentData = data ?? portfolio;
  const { portrait } = currentData;

  const facts = [
    { label: "Based in", value: currentData.origin ?? "" },
    { label: "Nationality", value: currentData.nationality ?? "" },
    { label: "Represented by", value: currentData.agency ?? "" },
  ].filter((fact): fact is { label: string; value: string } =>
    Boolean(fact.value),
  );

  return (
    <div>
      <Reveal className="mb-14">
        <p className="eyebrow mb-5">About</p>
        <h2
          id="about-heading"
          className="display-title max-w-3xl text-[var(--text-primary)]"
        >
          {currentData.name}, {currentData.title?.toLowerCase()}
        </h2>
      </Reveal>

      <div
        className={
          portrait
            ? "grid grid-cols-1 items-start gap-10 md:grid-cols-12 md:gap-12"
            : "grid grid-cols-1 gap-8"
        }
      >
        {portrait && (
          <Reveal
            className="md:col-span-5"
            duration={0.9}
          >
            <figure className="relative aspect-[3/4] w-full overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <Image
                src={portrait.path}
                alt={portrait.alt}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                style={{ objectPosition: portrait.position ?? "50% 30%" }}
                className="object-cover"
              />
            </figure>
          </Reveal>
        )}

        <Reveal
          className={portrait ? "md:col-span-7" : ""}
          delay={0.12}
          duration={0.9}
        >
          <p className="prose-editorial text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
            {currentData.bio}
          </p>

          {facts.length > 0 && (
            <dl className="mt-10 divide-y divide-[var(--border-subtle)] border-t border-[var(--border-subtle)]">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex flex-wrap items-baseline justify-between gap-3 py-4"
                >
                  <dt className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
                    {fact.label}
                  </dt>
                  <dd className="text-sm text-[var(--text-primary)]">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Reveal>
      </div>
    </div>
  );
}
