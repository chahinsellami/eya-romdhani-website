import { portfolio } from "../data/portfolio";
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import StatsSection from "./components/StatsSection";
import PortfolioShowcase from "./components/PortfolioShowcase";
import ContactSection from "./components/ContactSection";
import CreditsSection from "./components/CreditsSection";
import ScrollProgress from "./components/ScrollProgress";

export default function Home() {
  const data = portfolio;

  return (
    <main id="main" className="relative min-h-screen overflow-x-clip">
      <ScrollProgress />
      <Navigation />

      <HeroSection data={data} />

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
        <PortfolioShowcase data={data} />
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
