"use client";

import { ArrowUpRight, Printer } from "lucide-react";
import { portfolio } from "../../data/portfolio";
import { preferredScrollBehavior } from "../../lib/motion";

export default function CreditsSection() {
  const year = new Date().getFullYear();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: preferredScrollBehavior(), block: "start" });
    }
  };

  return (
    <footer
      data-cursor-surface="dark"
      className="border-t border-[var(--border-on-ink)] bg-[var(--ink-bg)] text-[var(--on-ink)]"
    >
      <div className="shell py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-start">
          <div className="md:col-span-5">
            <p className="font-display text-2xl font-normal text-[var(--on-ink)]">
              {portfolio.name}
            </p>
            <p className="mt-2 text-xs text-[var(--on-ink-tertiary)]">
              {portfolio.title ?? "Runway & Editorial Model"}
              <span aria-hidden="true" className="mx-2 text-[var(--accent-on-ink)]">
                ·
              </span>
              {portfolio.origin ?? "Sousse, Tunisia"}
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-8 gap-y-3 md:col-span-4"
          >
            <button
              type="button"
              onClick={() =>
                window.scrollTo({ top: 0, behavior: preferredScrollBehavior() })
              }
              className="link-underline text-xs font-medium uppercase tracking-[0.16em] text-[var(--on-ink-secondary)] hover:text-[var(--on-ink)]"
            >
              Top
            </button>
            <button
              type="button"
              onClick={() => scrollTo("about")}
              className="link-underline text-xs font-medium uppercase tracking-[0.16em] text-[var(--on-ink-secondary)] hover:text-[var(--on-ink)]"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => scrollTo("comp-card")}
              className="link-underline text-xs font-medium uppercase tracking-[0.16em] text-[var(--on-ink-secondary)] hover:text-[var(--on-ink)]"
            >
              Comp Card
            </button>
            <button
              type="button"
              onClick={() => scrollTo("portfolio")}
              className="link-underline text-xs font-medium uppercase tracking-[0.16em] text-[var(--on-ink-secondary)] hover:text-[var(--on-ink)]"
            >
              Portfolio
            </button>
            <button
              type="button"
              onClick={() => scrollTo("contact")}
              className="link-underline text-xs font-medium uppercase tracking-[0.16em] text-[var(--on-ink-secondary)] hover:text-[var(--on-ink)]"
            >
              Inquiries
            </button>
          </nav>

          <div className="flex flex-wrap items-center gap-6 md:col-span-3 md:justify-end">
            {portfolio.social.instagram && (
              <a
                href={portfolio.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.16em] text-[var(--on-ink-secondary)] transition-colors duration-200 hover:text-[var(--accent-on-ink)]"
              >
                <span>Instagram</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-[var(--on-ink-secondary)] transition-colors duration-200 hover:text-[var(--on-ink)]"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Comp Card</span>
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-[var(--border-on-ink)] pt-6 text-xs text-[var(--on-ink-tertiary)] sm:flex-row sm:items-center">
          <p>
            © {year} {portfolio.name}. All rights reserved.
          </p>
          <p>
            {portfolio.agency
              ? `Represented by ${portfolio.agency}`
              : "Independent · Direct Booking Representation"}
          </p>
        </div>
      </div>
    </footer>
  );
}
