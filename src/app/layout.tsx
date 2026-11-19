import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { MotionConfig } from "motion/react";
import "./globals.css";
import StructuredData from "./components/StructuredData";
import CustomCursor from "./components/CustomCursor";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
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
  themeColor: "#F7F7F5",
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
      className={`${cormorant.variable} ${jakarta.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <head>
        <noscript>
          <style>{`.reveal-block{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased selection:bg-[var(--accent-primary)] selection:text-white">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[var(--accent-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        <StructuredData />
        <MotionConfig reducedMotion="user">
          <CustomCursor />
          {children}
        </MotionConfig>
      </body>
    </html>
  );
}