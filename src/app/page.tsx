"use client";

import { useState } from "react";
import { portfolio } from "../data/portfolio";
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import StatsSection from "./components/StatsSection";
import PortfolioFilter, { type GalleryViewMode } from "./components/PortfolioFilter";
import GallerySection from "./components/GallerySection";
import ContactSection from "./components/ContactSection";
import CreditsSection from "./components/CreditsSection";
import ScrollProgress from "./components/ScrollProgress";
import { preferredScrollBehavior } from "../lib/motion";

export default function Home() {
  const data = portfolio;
  const [viewMode, setViewMode] = useState<GalleryViewMode>("grid");

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: preferredScrollBehavior(),
        block: "start",
      });
    }
  };

  return (
    <main id="main" className="relative min-h-screen overflow-x-clip">
      <ScrollProgress />
      <Navigation onNavigate={scrollToSection} />

      <HeroSection data={data} onNavigate={scrollToSection} />

      <section id="about" className="section-shell" aria-labelledby="about-heading">
        <AboutSection data={data} />
      </section>

      <section
        id="comp-card"
        data-cursor-surface="dark"
        className="bg-[var(--ink-bg)] text-[var(--on-ink)]"
        aria-label="Measurements and disciplines"
      >
        <div className="section-shell">
          <StatsSection data={data} />
        </div>
      </section>

      <section id="portfolio" className="section-shell" aria-label="Portfolio">
        <PortfolioFilter viewMode={viewMode} onViewModeChange={setViewMode} />
        <GallerySection data={data} viewMode={viewMode} />
      </section>

      <section
        id="contact"
        className="section-shell pt-0"
        aria-labelledby="contact-heading"
      >
        <ContactSection />
      </section>

      <CreditsSection />
    </main>
  );
}
