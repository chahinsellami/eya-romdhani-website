"use client";

import { useEffect, useRef, useState } from "react";
import { portfolio } from "../../data/portfolio";

/**
 * Fixed agency/campaign bar.
 *
 * The bar is interactive (campaign links, carousel controls), so it must not be
 * pointer-events-none. Its height is reserved in globals.css via
 * `--social-bar-height` so it never covers the end of the page.
 */
export default function SocialProofBar() {
  const campaigns = portfolio.featuredCampaigns;
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const activeIndex = Math.min(currentIndex, campaigns.length - 1);

  // On a narrow viewport the list scrolls, so highlighting a brand that is off
  // screen would look like the buttons do nothing. Bring it into view instead.
  //
  // This effect must stay above the early return below: a hook that is skipped
  // on some renders breaks the order React relies on, and would crash the whole
  // page (not just this bar) the moment the campaign list was empty.
  useEffect(() => {
    if (campaigns.length === 0) return;
    const item = listRef.current?.children[activeIndex];
    item?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeIndex, campaigns.length]);

  if (campaigns.length === 0) return null;

  const next = () =>
    setCurrentIndex((prev) => (prev + 1) % campaigns.length);
  const prev = () =>
    setCurrentIndex((prev) => (prev - 1 + campaigns.length) % campaigns.length);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      <div className="shell">
        <div className="flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/95 py-2.5 backdrop-blur-md">
          <ul
            ref={listRef}
            className="scroll-slim flex min-w-0 items-center gap-4 overflow-x-auto"
          >
            {campaigns.map((campaign, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={campaign.brand}>
                  <a
                    href={campaign.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`whitespace-nowrap text-xs font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] ${
                      isActive
                        ? "text-[var(--text-primary)] underline decoration-[var(--accent-primary)] underline-offset-4"
                        : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                    }`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {campaign.brand}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={prev}
              className="p-3 text-[var(--text-tertiary)] transition-colors duration-200 hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
              aria-label="Previous featured brand"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>

            {portfolio.agency && (
              <p className="hidden items-center gap-2 text-xs sm:flex">
                <span className="text-[var(--text-tertiary)]">Represented by:</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {portfolio.agency}
                </span>
              </p>
            )}

            <button
              type="button"
              onClick={next}
              className="p-3 text-[var(--text-tertiary)] transition-colors duration-200 hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
              aria-label="Next featured brand"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
