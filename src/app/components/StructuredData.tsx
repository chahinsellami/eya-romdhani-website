const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ayaromdhani.com";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Aya Romdhani",
  jobTitle: "Runway & Editorial Model",
  description:
    "Runway and editorial model based in Sousse, Tunisia. Available for runway, editorial, campaign and commercial work.",
  url: SITE_URL,
  image: `${SITE_URL}/og-image.png`,
  nationality: "Tunisian",
  homeLocation: {
    "@type": "Place",
    name: "Sousse, Tunisia",
  },
  sameAs: [
    "https://www.instagram.com/aya__romdhani21/",
  ],
  knowsAbout: [
    "Runway modeling",
    "Editorial modeling",
    "Fashion campaigns",
    "Haute couture",
  ],
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Aya Romdhani — Runway & Editorial Model",
  url: SITE_URL,
  description:
    "Portfolio of Aya Romdhani, runway and editorial model based in Sousse, Tunisia.",
  inLanguage: "en-US",
  publisher: {
    "@type": "Person",
    name: "Aya Romdhani",
  },
};

/**
 * Injects JSON-LD structured data for rich results.
 * Rendered as raw <script> tags; React escapes the content, so we use
 * dangerouslySetInnerHTML with JSON.stringify to emit valid JSON-LD.
 */
export default function StructuredData() {
  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify output contains no user input, so this is safe.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
    </>
  );
}