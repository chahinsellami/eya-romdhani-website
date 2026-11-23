"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Portfolio } from "../../data/portfolio";
import { scrollToSectionById } from "../../lib/motion";

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  data: Portfolio;
}

/*
  Hero in the same build as the comp card's "Presence" band, which the owner
  picked: a dark left column of tracked caps, a darkened flash portrait bleeding
  off the right, and her name in giant thin serif caps across it.
*/
export default function HeroSection({ data }: HeroSectionProps) {
  const root = useRef<HTMLElement>(null);
  const [first = data.name, ...rest] = data.name.trim().split(/\s+/);
  const last = rest.join(" ");

  const lines: [string, string][] = [
    ["Model", "Runway, editorial"],
    ["Based in", data.origin ?? "Sousse, Tunisia"],
    ["Height", `${data.height} cm`],
    ["Booking", data.agency ? data.agency : "Direct"],
  ];

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(root);
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(q("[data-line] > span"), { yPercent: 110, duration: 1.7, stagger: 0.14 }, 0.25)
        .from(q("[data-rule]"), { scaleX: 0, transformOrigin: "left", duration: 1.4 }, 0.6)
        .from(q("[data-fade]"), { opacity: 0, y: 12, duration: 1.1, stagger: 0.08 }, 1);

      // The name drifts against the photograph as the hero scrolls away
      const out = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(q("[data-name]"), { xPercent: -6, yPercent: -30, ease: "none", scrollTrigger: out });
      gsap.to(q("[data-photo]"), { yPercent: 10, ease: "none", scrollTrigger: out });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="top" aria-label="Introduction" className="relative h-[100svh] min-h-[620px] overflow-hidden">
      <h1 className="sr-only">
        {data.name}, {data.title ?? "runway and editorial model"}
      </h1>

      {/* The photograph: full-bleed on mobile, the right two thirds on desktop */}
      <div data-photo className="absolute inset-0 lg:left-auto lg:w-[66%]">
        <div data-gl className="relative h-full w-full">
          <Image
            src="/images/portfolio/flash-shearling.webp"
            alt={`Flash portrait of ${data.name} in a cream shearling jacket and black choker, looking at the camera`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            style={{ objectPosition: "55% 35%" }}
            className="object-cover"
          />
        </div>
      </div>
      {/* Above the WebGL canvas (z-5): darkens the print where the type sits */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[6] bg-[linear-gradient(to_top,var(--ink)_0%,rgba(11,10,9,0.55)_45%,rgba(11,10,9,0.25)_100%)] lg:left-[34%] lg:-ml-2 lg:bg-[linear-gradient(to_right,var(--ink)_0%,rgba(11,10,9,0.72)_32%,rgba(11,10,9,0.3)_70%,rgba(11,10,9,0.12)_100%)]"
      />

      {/* Left column */}
      <div className="relative z-10 flex h-full flex-col justify-between px-[var(--space-gutter)] pb-10 pt-24 lg:w-[34%] lg:pb-14 lg:pt-28">
        <p data-fade className="type-label flex items-center gap-3 !text-[var(--bone)]">
          01 <span aria-hidden="true" className="inline-block h-px w-8 bg-current" /> {data.title ?? "Runway & editorial model"}
        </p>

        <div>
          <dl data-fade className="space-y-3">
            {lines.map(([label, value]) => (
              <div key={label} className="flex gap-4 text-[0.75rem] font-medium uppercase tracking-[0.24em]">
                <dt className="w-24 text-[var(--ash)]">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div data-fade className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 lg:mt-12">
            <button type="button" onClick={() => scrollToSectionById("contact")} className="button-solid">
              Book Aya
            </button>
            <button
              type="button"
              onClick={() => scrollToSectionById("portfolio")}
              className="type-label min-h-[44px] !text-[var(--bone)] underline-offset-[0.6em] hover:underline"
            >
              See her work
            </button>
          </div>
        </div>
      </div>

      {/* Her name, spanning the band: hairline into AYA, ROMDHANI beneath */}
      <div
        data-name
        aria-hidden="true"
        className="type-serif pointer-events-none absolute inset-x-0 top-[47svh] z-10 uppercase leading-[0.86] text-[var(--bone)] lg:left-[22vw] lg:top-1/2 lg:-translate-y-[55%]"
      >
        <span data-line className="flex items-center gap-[2.5vw] overflow-hidden pl-[var(--space-gutter)] lg:pl-0">
          <span data-rule className="hidden h-px w-[12vw] bg-[var(--bone)] lg:block" />
          <span className="block text-[clamp(4.5rem,23vw,9rem)] lg:text-[clamp(6rem,12.5vw,16rem)]">{first}</span>
        </span>
        {last && (
          <span data-line className="block overflow-hidden pl-[var(--space-gutter)] lg:pl-0">
            <span className="block whitespace-nowrap text-[clamp(3.2rem,16.5vw,9rem)] lg:text-[clamp(6rem,12.5vw,16rem)]">
              {last}
            </span>
          </span>
        )}
      </div>

      {/* Right rail */}
      <div aria-hidden="true" data-fade className="absolute bottom-10 right-[var(--space-gutter)] z-10 hidden flex-col items-center gap-4 lg:flex">
        <span className="type-label !text-[var(--bone)] [writing-mode:vertical-rl]">Scroll</span>
        <span className="h-16 w-px bg-[var(--bone)] opacity-60" />
      </div>
    </section>
  );
}
