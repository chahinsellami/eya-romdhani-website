"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { portfolio } from "../../data/portfolio";
import ContactForm from "./ContactForm";

gsap.registerPlugin(ScrollTrigger);

const INQUIRY_TYPES = [
  "Runway booking",
  "Editorial shoot",
  "Brand campaign",
  "Commercial and beauty",
];

/* The mosaic strip: crops edge to edge, different widths, like a contact sheet */
const STRIP = [
  { src: "/images/portfolio/flash-choker.webp", width: "w-[34%]", position: "50% 38%", alt: "Low-angle flash portrait in a black choker" },
  { src: "/images/portfolio/tile-closeup.webp", width: "w-[16%]", position: "50% 30%", alt: "Colour close-up, hands in her hair" },
  { src: "/images/portfolio/flash-shoulder.webp", width: "w-[20%]", position: "45% 40%", alt: "Flash portrait looking back over a bare shoulder" },
  { src: "/images/portfolio/tile-turtleneck-back.webp", width: "w-[12%]", position: "50% 30%", alt: "Black and white portrait in a turtleneck, looking back" },
  { src: "/images/portfolio/tile-hands.webp", width: "w-[18%]", position: "50% 35%", alt: "Colour close-up with a hand raised beside her face" },
];

export default function ContactSection() {
  const { contact, social, origin } = portfolio;
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  // The headline opens out of tight tracking as it scrolls in
  useEffect(() => {
    const el = headlineRef.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el,
        { letterSpacing: "0.12em", opacity: 0.2 },
        {
          letterSpacing: "-0.03em",
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 95%", end: "top 45%", scrub: true },
        },
      );
    });
    return () => mm.revert();
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.management);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${contact.management}`;
    }
  };

  const instagramHandle = social.instagram
    ? `@${social.instagram.replace(/\/+$/, "").split("/").pop()}`
    : "";

  return (
    <div className="overflow-hidden">
      <div className="relative">
        <p className="type-label absolute bottom-5 left-[var(--space-gutter)] z-10 flex items-center gap-3 !text-[var(--bone)]">
          05 <span aria-hidden="true" className="inline-block h-px w-8 bg-current" /> Booking
        </p>
        <div className="flex h-[34svh] gap-px lg:h-[56svh]">
          {STRIP.map((print) => (
            <div key={print.src} data-gl className={`relative h-full ${print.width}`}>
              <Image
                src={print.src}
                alt={print.alt}
                fill
                sizes="34vw"
                style={{ objectPosition: print.position }}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="section-shell !pt-16">
        <h2
          id="contact-heading"
          ref={headlineRef}
          className="type-serif whitespace-nowrap text-[clamp(4.5rem,17vw,18rem)] leading-[0.85]"
        >
          Book Aya
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-16 border-t border-[var(--border-subtle)] pt-12 lg:grid-cols-12 lg:gap-[clamp(3rem,5vw,6rem)]">
          <div className="lg:col-span-5">
            <p className="max-w-[40ch] text-[var(--text-secondary)]">
              Available for runway, editorial, campaign and beauty work in{" "}
              {origin ?? "Tunisia"} and abroad. Send dates, location and usage, and Aya will
              reply to you directly.
            </p>

            <div className="mt-12">
              <p className="type-label">Email</p>
              <a
                href={`mailto:${contact.management}`}
                className="link-underline type-serif mt-3 block break-all text-[clamp(1.75rem,1.1rem+2.2vw,3.25rem)] leading-tight"
              >
                {contact.management}
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="mt-3 min-h-[44px] text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <span aria-live="polite">{copied ? "Email copied" : "Copy email"}</span>
              </button>
            </div>

            <dl className="mt-10 grid grid-cols-1 gap-6 border-t border-[var(--border-subtle)] pt-6 sm:grid-cols-2">
              {social.instagram && (
                <div>
                  <dt className="type-label">Instagram</dt>
                  <dd className="mt-1">
                    <a
                      href={social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline text-[0.875rem] tracking-[0.06em]"
                    >
                      {instagramHandle}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="type-label">Based in</dt>
                <dd className="mt-1 text-[0.875rem]">{origin ?? "Sousse, Tunisia"}, travels for work</dd>
              </div>
              {contact.agencyName && (
                <div>
                  <dt className="type-label">Agency</dt>
                  <dd className="mt-1 text-[0.875rem]">
                    {contact.agencyName}
                    {contact.agencyAddress && (
                      <span className="block text-[var(--text-tertiary)]">{contact.agencyAddress}</span>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="lg:col-span-7">
            <fieldset>
              <legend className="type-label mb-4">What is the booking for?</legend>
              <div className="flex flex-wrap gap-2">
                {INQUIRY_TYPES.map((type) => {
                  const isSelected = selectedSubject === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedSubject(type)}
                      aria-pressed={isSelected}
                      className={`min-h-[44px] cursor-pointer border px-4 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] transition-colors duration-200 whitespace-nowrap ${
                        isSelected
                          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]"
                          : "border-[var(--border-strong)] hover:border-[var(--text-primary)]"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-10 border border-[var(--border-subtle)] p-6 sm:p-10">
              <ContactForm selectedSubject={selectedSubject} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
