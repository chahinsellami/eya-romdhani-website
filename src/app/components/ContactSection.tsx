"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import Reveal from "./Reveal";
import { portfolio } from "../../data/portfolio";
import ContactForm from "./ContactForm";

const INQUIRY_TYPES = [
  "Runway Booking",
  "Editorial Shoot",
  "Brand Campaign",
  "Commercial & Beauty",
];

export default function ContactSection() {
  const { contact, social, origin } = portfolio;
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.management);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${contact.management}`;
    }
  };

  return (
    <div>
      <Reveal
        y={20}
        duration={0.55}
        className="mb-12 border-b border-[var(--border-subtle)] pb-8"
      >
        <p className="eyebrow mb-3 !text-[var(--accent-primary)]">04. Inquiries</p>
        <h2 id="contact-heading" className="display-title text-[var(--text-primary)]">
          Direct Booking &amp;{" "}
          <span className="italic font-light">Commissions</span>
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left column: Direct coordinates + quick inquiry presets */}
        <Reveal y={22} delay={0.05} duration={0.58} className="space-y-8 lg:col-span-5">
          <p className="prose-editorial text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
            Available for runway, editorial, campaign, and beauty commissions
            locally and internationally. Direct inquiries are answered promptly.
          </p>

          <dl className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
            <div className="flex flex-wrap items-center justify-between gap-3 py-4">
              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                Direct Email
              </dt>
              <dd className="flex min-w-0 flex-wrap items-center gap-3">
                <a
                  href={`mailto:${contact.management}`}
                  className="link-underline break-all text-sm font-medium text-[var(--text-primary)] sm:break-normal"
                >
                  {contact.management}
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  aria-label="Copy email address"
                  className="inline-flex min-h-[40px] items-center gap-1.5 border border-[var(--border-subtle)] px-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)] transition-colors duration-200 hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] sm:min-h-0 sm:h-8 sm:px-2.5"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-[var(--accent-primary)]" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" aria-hidden="true" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </dd>
            </div>

            <div className="flex items-baseline justify-between gap-3 py-4">
              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                Location
              </dt>
              <dd className="text-sm text-[var(--text-primary)]">
                {origin ?? "Sousse, Tunisia"} · Travel ready
              </dd>
            </div>

            {social.instagram && (
              <div className="flex items-baseline justify-between gap-3 py-4">
                <dt className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                  Instagram
                </dt>
                <dd>
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--text-primary)] transition-colors duration-200 hover:text-[var(--accent-primary)]"
                  >
                    <span>@aya__romdhani21</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </dd>
              </div>
            )}

            {contact.agencyName && (
              <div className="flex items-baseline justify-between gap-3 py-4">
                <dt className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                  Agency
                </dt>
                <dd className="text-right text-sm text-[var(--text-primary)]">
                  <span>{contact.agencyName}</span>
                  {contact.agencyAddress && (
                    <span className="block text-xs text-[var(--text-tertiary)]">
                      {contact.agencyAddress}
                    </span>
                  )}
                </dd>
              </div>
            )}
          </dl>

          {/* Interactive quick-select booking type */}
          <div>
            <p className="eyebrow mb-3">Quick Inquiry Subject</p>
            <div className="flex flex-wrap gap-2">
              {INQUIRY_TYPES.map((type) => {
                const isSelected = selectedSubject === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedSubject(type)}
                    aria-pressed={isSelected}
                    className={`border px-3.5 py-2 text-xs font-medium transition-colors duration-200 whitespace-nowrap shrink-0 ${
                      isSelected
                        ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white"
                        : "border-[var(--border-subtle)] bg-[var(--bg-secondary)]/60 text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Right column: Booking form */}
        <Reveal
          y={24}
          delay={0.12}
          duration={0.62}
          className="border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/45 p-6 sm:p-8 lg:col-span-7"
        >
          <ContactForm selectedSubject={selectedSubject} />
        </Reveal>
      </div>
    </div>
  );
}
