import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { MotionConfig } from "motion/react";
import "./globals.css";
import StructuredData from "./components/StructuredData";
import WebGLStage from "./components/experience/WebGLStage";
import SmoothScroll from "./components/experience/SmoothScroll";

// Archivo across its width axis (62–125%): condensed for the name, normal for reading.
const archivo = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  variable: "--font-archivo",
  display: "swap",
});

// Cormorant at its lightest: the thin, high-contrast display serif of the site.
const cormorant = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/cormorant/files/cormorant-latin-wght-normal.woff2",
      weight: "300 700",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource-variable/cormorant/files/cormorant-latin-wght-italic.woff2",
      weight: "300 700",
      style: "italic",
    },
  ],
  variable: "--font-cormorant",
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
  themeColor: "#0B0A09",
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
      className={`${archivo.variable} ${cormorant.variable} antialiased`}
    >
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased selection:bg-[var(--accent)] selection:text-[var(--on-accent)]">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--on-accent)]"
        >
          Skip to content
        </a>
        <StructuredData />
        <MotionConfig reducedMotion="user">
          <SmoothScroll />
          {children}
          <WebGLStage />
          <div className="grain" aria-hidden="true" />
        </MotionConfig>
      </body>
    </html>
  );
}