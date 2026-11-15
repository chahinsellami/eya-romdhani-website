"use client";

import Reveal from "./Reveal";
import { portfolio } from "../../data/portfolio";
import ContactForm from "./ContactForm";

export default function ContactSection() {
  const { contact, social } = portfolio;

  return (
    <Reveal>
      <p className="eyebrow mb-6">Contact</p>
      <h2 id="contact-heading" className="display-title mb-8 text-[var(--text-primary)]">
        Inquiries
      </h2>
      <p className="mb-10 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
        For booking inquiries, press requests, or collaborations, please write to{" "}
        <a href={`mailto:${contact.management}`} className="link-underline text-[var(--text-primary)]">
          {contact.management}
        </a>
        {contact.phone ? (
          <>
            {" "}or call{" "}
            <a
              href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}
              className="link-underline text-[var(--text-primary)]"
            >
              {contact.phone}
            </a>
          </>
        ) : null}
        .
      </p>

      <ContactForm />

      <div className="mt-16 space-y-3 text-sm">
        {contact.agencyName && (
          <>
            <p className="eyebrow">Agency</p>
            <p className="text-[var(--text-primary)]">{contact.agencyName}</p>
            {contact.agencyAddress && (
              <p className="text-[var(--text-tertiary)]">{contact.agencyAddress}</p>
            )}
          </>
        )}

        <ul className="mt-6 flex flex-wrap gap-6">
          {social.instagram && (
            <li>
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-[var(--text-secondary)] transition-colors duration-300 hover:text-[var(--text-primary)]"
              >
                Instagram
              </a>
            </li>
          )}
          {social.website && (
            <li>
              <a
                href={social.website}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-[var(--text-secondary)] transition-colors duration-300 hover:text-[var(--text-primary)]"
              >
                Agency profile
              </a>
            </li>
          )}
          {social.tiktok && (
            <li>
              <a
                href={social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-[var(--text-secondary)] transition-colors duration-300 hover:text-[var(--text-primary)]"
              >
                TikTok
              </a>
            </li>
          )}
        </ul>
      </div>
    </Reveal>
  );
}
