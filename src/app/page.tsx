import { portfolio } from "../data/portfolio";
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import StatsSection from "./components/StatsSection";
import GallerySection from "./components/GallerySection";
import ContactSection from "./components/ContactSection";
import CreditsSection from "./components/CreditsSection";
import Cursor from "./components/experience/Cursor";

/*
  Noir: a dark page of full-bleed photographic bands, with About as the one
  bone band. Each section carries an index label (01 to 05).
*/
export default function Home() {
  const data = portfolio;

  return (
    <main id="main" className="surface-ink relative min-h-screen overflow-x-clip">
      <Navigation />
      <Cursor />

      <HeroSection data={data} />

      <section id="portfolio" aria-labelledby="portfolio-heading">
        <GallerySection data={data} />
      </section>

      <section id="about" className="surface-bone" aria-labelledby="about-heading">
        <AboutSection data={data} />
      </section>

      <section id="comp-card" aria-labelledby="comp-card-heading">
        <StatsSection data={data} />
      </section>

      <section id="contact" aria-labelledby="contact-heading">
        <ContactSection />
      </section>

      <CreditsSection />
    </main>
  );
}
