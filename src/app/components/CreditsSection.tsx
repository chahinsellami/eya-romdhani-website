"use client";

import Reveal from "./Reveal";
import { portfolio } from "../../data/portfolio";

export default function CreditsSection() {
  // Computed at render time so the copyright never goes stale.
  const year = new Date().getFullYear();

  const hasPlaceholders =
    Boolean(portfolio.hero?.placeholder) ||
    Boolean(portfolio.portrait?.placeholder) ||
    portfolio.portfolio.some((item) => item.placeholder);

  return (
    <Reveal className="space-y-3" duration={0.6}>
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
        © {year} {portfolio.name}. All rights reserved.
      </p>
      {portfolio.agency && (
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
          Represented by {portfolio.agency}
        </p>
      )}
      {/*
        Stated plainly rather than hidden: until the real photographs are in,
        every image on the site is licensed stock. Saying so costs one line and
        prevents anyone — the model included — from assuming this is final.
      */}
      {hasPlaceholders && (
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-tertiary)] opacity-70">
          Photography shown is licensed placeholder imagery
        </p>
      )}
    </Reveal>
  );
}
