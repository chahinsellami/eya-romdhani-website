import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { MotionConfig } from "motion/react";
import "./globals.css";
import StructuredData from "./components/StructuredData";
import CustomCursor from "./components/CustomCursor";

const cormorant = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-300-normal.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-300-italic.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

const jakarta = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
  ],
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