import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import StructuredData from "./components/StructuredData";

/**
 * Self-hosted fonts.
 *
 * These replace a render-blocking <link> to fonts.googleapis.com: next/font
 * inlines the @font-face rules and serves the woff2 files from our own origin,
 * so there is no third-party DNS lookup, no FOUT on the hero wordmark, and no
 * extra round trip on the critical path. The CSS variables are what
 * globals.css and tailwind.config.ts read.
 */
// Playfair Display ships 400–900; the old Google Fonts URL asked for a 300
// weight that never existed, so that request silently fell back.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ayaromdhani.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Aya Romdhani — Runway & Editorial Model",
    template: "%s — Aya Romdhani",
  },
  description:
    "Runway and editorial model based in Sousse, Tunisia. Available for runway, editorial, campaign and commercial work.",
  keywords: [
    "runway model",
    "fashion model",
    "editorial model",
    "campaign model",
    "Aya Romdhani",
    "Tunisian model",
    "Tunisia model",
    "model Sousse",
    "high fashion",
    "book a model",
  ],
  authors: [{ name: "Aya Romdhani" }],
  creator: "Aya Romdhani",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Aya Romdhani — Runway & Editorial Model",
    description:
      "Runway and editorial model based in Sousse, Tunisia. Available for runway, editorial, campaign and commercial work.",
    type: "website",
    url: SITE_URL,
    siteName: "Aya Romdhani",
    locale: "en_US",
    images: [
      {
        // Scrapers do not render SVG previews, and the old target was a 400x600
        // portrait placeholder declared as 1200x630.
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Aya Romdhani — runway and editorial portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aya Romdhani — Runway & Editorial Model",
    description: "Runway. Editorial. Campaign.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  category: "fashion",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The gallery white is the ground regardless of the system preference, so the
  // browser chrome matches it in every case.
  themeColor: "#FAF8F4",
  // The site is white-first and does not auto-flip on a dark system preference,
  // so form controls, scrollbars and the default canvas follow the white ground.
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} antialiased`}
    >
      <head>
        {/*
          Scroll-reveal wrappers ship an inline `opacity: 0` so the animation can
          start from hidden. If scripts never run, that would leave the whole page
          blank, so no-JS visitors get the content statically instead.
        */}
        <noscript>
          <style>{`.reveal-block{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {/*
          The hero renders a WebGL canvas rather than an <img>, so no hero image
          preload is needed here; gallery images are prioritised inside
          GallerySection for whichever photos land above the fold.
        */}
      </head>
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-[var(--accent-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--bg-primary)]"
        >
          Skip to content
        </a>
        <div
          className="pointer-events-none fixed inset-0 z-0"
          aria-hidden="true"
        >
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[var(--bg-secondary)]/60 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[var(--bg-secondary)]/60 to-transparent" />
        </div>
        <StructuredData />
        {/*
          framer-motion drives the mobile menu, lightbox and filter dropdown via
          WAAPI/rAF and writes inline transform/opacity, so the reduced-motion
          rules in globals.css cannot reach them. MotionConfig is the supported
          switch: with "user", every descendant animation is reduced to a
          cross-fade (or skipped) when the OS asks for less motion.
        */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}