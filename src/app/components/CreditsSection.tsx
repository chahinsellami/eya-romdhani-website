"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { portfolio } from "../../data/portfolio";
import { scrollToSectionById } from "../../lib/motion";

gsap.registerPlugin(ScrollTrigger);

const LINKS = [
  { id: "portfolio", index: "02", label: "Work" },
  { id: "about", index: "03", label: "Profile" },
  { id: "comp-card", index: "04", label: "Comp card" },
  { id: "contact", index: "05", label: "Booking" },
];

const CAPS = "text-[0.6875rem] font-semibold uppercase tracking-[0.24em]";

export default function CreditsSection() {
  const year = new Date().getFullYear();
  const nameRef = useRef<HTMLParagraphElement>(null);

  // End titles: the letters of her name rise into place as the page runs out
  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el.querySelectorAll("[data-letter]"),
        { yPercent: 110 },
        {
          yPercent: 0,
          ease: "none",
          stagger: 0.05,
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true },
        },
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <footer className="overflow-hidden border-t border-[var(--border-on-ink)] bg-[var(--ink)] text-[var(--bone)]">
      <div className="shell pt-16 md:pt-24">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-start">
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-10 gap-y-1">
            {LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSectionById(link.id)}
                className={`${CAPS} inline-flex min-h-[44px] items-center gap-3 underline-offset-[0.4em] hover:underline`}
              >
                <span className="text-[var(--ash)]">{link.index}</span>
                {link.label}
              </button>
            ))}
            {portfolio.social.instagram && (
              <a
                href={portfolio.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={`${CAPS} inline-flex min-h-[44px] items-center underline-offset-[0.4em] hover:underline`}
              >
                Instagram
              </a>
            )}
          </nav>
          <p className={`${CAPS} leading-[2] text-[var(--ash)] md:text-right`}>
            © {year} {portfolio.name}
            <br />
            {portfolio.agency ? `Represented by ${portfolio.agency}` : "Independent, booked directly"}
          </p>
        </div>
      </div>

      {/* Font size fills the width: in Cormorant 300 the name measures about 5.55× its font size */}
      <p
        ref={nameRef}
        className="type-name mt-12 flex overflow-hidden whitespace-nowrap px-[var(--space-gutter)] pb-[0.3em] !text-[length:calc((100vw-2*var(--space-gutter))/5.62)] md:mt-20"
      >
        <span className="sr-only">{portfolio.name}</span>
        {[...portfolio.name].map((ch, i) => (
          <span key={i} data-letter aria-hidden="true" className="inline-block whitespace-pre">
            {ch}
          </span>
        ))}
      </p>
    </footer>
  );
}
