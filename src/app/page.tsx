"use client";

import dynamic from "next/dynamic";

import { portfolio } from "../data/portfolio";
import { motion } from "framer-motion";
import AboutSection from "./components/AboutSection";
import GallerySection from "./components/GallerySection";
import StatsSection from "./components/StatsSection";
import ContactSection from "./components/ContactSection";
import CreditsSection from "./components/CreditsSection";
import Navigation from "./components/Navigation";
import PortfolioFilter from "./components/PortfolioFilter";
import SocialProofBar from "./components/SocialProofBar";
import ScrollProgress from "./components/ScrollProgress";
import HeroBoundary from "./components/HeroBoundary";
import { preferredScrollBehavior } from "../lib/motion";

// The WebGL hero is the single heaviest dependency on the page (three +
// @react-three/drei). Loading it as a client-only chunk keeps it out of the
// initial bundle and off the server, so first paint never waits on WebGL.
const Hero3D = dynamic(() => import("./components/Hero3D"), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  const data = portfolio;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: preferredScrollBehavior(), block: "start" });
    }
  };

  // `overflow-x-clip`, not `overflow-x-hidden`: pairing a hidden x-axis with a
  // visible y-axis forces the y-axis to `auto`, which turns <main> into a scroll
  // container — and a sticky child then sticks to that container (which never
  // scrolls) instead of the viewport, silently killing the sticky filter bar.
  // `clip` trims overflow without creating a scroll container.
  return (
    <main id="main" className="relative min-h-screen overflow-x-clip">
      <ScrollProgress />
      <SocialProofBar />

      <Navigation onNavigate={scrollToSection} />

      {/*
              Hero — full-bleed photograph, name set over it.

              Three earlier versions of this got it wrong in different ways: a centred
              wordmark floating in a void (no face at all), then an editorial split
              (photo demoted to a sidebar on a page whose whole proposition is "this
              person"). The photograph is the hero, so it covers the screen edge to
              edge and the type sits on top of it.

              Legibility over a photograph cannot rely on the photo being dark, so the
              name is set on a two-part scrim: a left-to-right gradient that guarantees
              the type column has a floor under it, and a bottom gradient that carries
              the fact row and the fixed bar. Both are `pointer-events-none`.

              The WebGL layer switched to `mode="overlay"`: transparent, additive
              motes drifting in front of the image. As an opaque `scene` it painted a
              solid opaque ground over the photograph and hid it completely.
            */}
            <section
              id="top"
              className="relative isolate flex min-h-[100svh] items-end overflow-hidden sm:items-center"
              aria-label="Introduction"
            >
              {/* The photograph, full-bleed, behind everything. */}
              {data.hero && (
                <motion.div
                  initial={{ scale: 1.06, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.6, ease: "easeOut" }}
                  className="absolute inset-0 -z-10"
                >
                  {/*
                    Two crops, one <picture>. The wide shot is a 16:9 frame built
                    for a desktop hero; on a phone that same file is squeezed into
                    a tall viewport and the face ends up tiny and off-frame. Below
                    `md` the portrait crop takes over.

                    `object-cover` on both, so neither crop is ever letterboxed —
                    the image always fills the section and the scrim does the work
                    of keeping the type readable.
                  */}
                  <picture>
                    {data.hero.widePath && (
                      <source
                        media="(min-width: 768px)"
                        srcSet={data.hero.widePath}
                      />
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.hero.path}
                      alt={data.hero.alt}
                      fetchPriority="high"
                      decoding="async"
                      style={{ objectPosition: data.hero.position ?? "50% 25%" }}
                      /*
                        Darkened in the browser, not in the file. This is a bright
                        black-and-white frame — a pale studio wall behind it — and the
                        page's type is bone-white, so the unmodified image puts the
                        name at roughly 1.4:1. Dimming the image keeps its texture and
                        makes the type legible; baking the darkening into the asset
                        would lose the option of using the same file bright elsewhere.
                      */
                      className="h-full w-full object-cover brightness-[0.8] contrast-[1.05]"
                    />
                  </picture>
                </motion.div>
              )}

              {/*
                Scrim. Two layers, because the photograph is bright: a vertical
                gradient that grounds the type where it actually sits (bottom on
                narrow screens, middle-left on wide ones), then a left-to-right
                wash that guarantees the name column has a floor under it. Neither
                covers the face — the type block and the face occupy opposite thirds.

                These use the `--hero-scrim-*` tokens, which stay dark in both
                colour schemes. Tied to `--bg-primary` they inverted in light mode:
                the photograph became a pale ghost and the dark navigation text
                on top of it disappeared.
              */}
              <div
                className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[var(--hero-solid)] via-[var(--hero-scrim-strong)] to-transparent"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[var(--hero-solid)] via-[var(--hero-scrim-soft)] to-transparent"
                aria-hidden="true"
              />
              {/* Extra floor at the very bottom, for the fact row and the fixed bar. */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[var(--hero-solid)] to-transparent"
                aria-hidden="true"
              />

              {/*
                WebGL motes, over the photograph and under the type. Decorative, so it
                is `aria-hidden` inside Hero3D, and HeroBoundary drops it entirely
                where WebGL is unavailable instead of taking the page down.
              */}
              <HeroBoundary>
                <Hero3D mode="overlay" />
              </HeroBoundary>

              <div className="shell relative z-10 w-full">
                <div className="flex flex-col justify-end gap-8 pb-28 pt-32 sm:pb-24 sm:pt-24">
                  <div className="max-w-4xl">
                    <motion.p
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                      className="reveal-block eyebrow mb-6 !text-[var(--on-photo-dim)]"
                    >
                      {data.title}
                    </motion.p>

                    <motion.h1
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
                      className="reveal-block display-hero text-[var(--on-photo)]"
                    >
                      {/*
                        One word per line. The spans are `block` for a deterministic
                        break, and every word but the last keeps a trailing space so
                        the markup reads "Aya Romdhani" rather than "AyaRomdhani" —
                        glued words break screen readers and search snippets alike.
                        Nothing decorative goes in here: the h1 is the accessible
                        name of the site, so it carries the name and nothing else.
                      */}
                      {data.name.split(" ").map((word, index, words) => (
                        <span key={word} className="block">
                          {index === words.length - 1 ? word : `${word} `}
                        </span>
                      ))}
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
                      className="reveal-block mt-8 max-w-md text-sm leading-relaxed text-[var(--on-photo-dim)] md:text-base"
                    >
                      {data.tagline} Based in {data.origin}
                      {data.agency ? `, represented by ${data.agency}` : ", independent"}.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
                      className="reveal-block mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center"
                    >
                      <button
                        type="button"
                        onClick={() => scrollToSection("portfolio")}
                        className="cinematic-button-on-photo"
                      >
                        View the work
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollToSection("contact")}
                        /*
                          Tailwind cannot hold both `text-[13px]` and a colour in
                          one `text-[…]` utility: `text-[var(--step--1)]` and
                          `text-[var(--on-photo-dim)]` collide in the same class
                          list and only one survives, so the size was silently
                          winning and the button rendered near-black on the
                          photograph. Size and colour are two different
                          properties and need two different utilities.
                        */
                        className="link-underline text-[length:var(--step--1)] uppercase tracking-[0.28em] text-[var(--on-photo-dim)] transition-colors duration-300 hover:text-[var(--on-photo)]"
                      >
                        Book her
                      </button>
                    </motion.div>
                  </div>

                  {/*
                    One hard fact on the first screen, plus where she is. `Shows`
                    tolerates an empty history: a brand-new portfolio should read "0"
                    here rather than claim invented credits.
                  */}
                  <motion.dl
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.85, ease: "easeOut" }}
                    className="reveal-block flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-white/15 pt-6 sm:gap-x-14"
                  >
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.22em] text-[var(--on-photo-dim)]">
                        Height
                      </dt>
                      <dd className="mt-1 font-display text-lg text-[var(--on-photo)]">
                        {data.height} cm
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.22em] text-[var(--on-photo-dim)]">
                        Based
                      </dt>
                      <dd className="mt-1 font-display text-lg text-[var(--on-photo)]">
                        {data.origin ?? "Sousse, Tunisia"}
                      </dd>
                    </div>
                  </motion.dl>
                </div>
              </div>
      </section>

      <section id="about" className="section-shell" aria-labelledby="about-heading">
        <AboutSection data={data} />
      </section>

      <section
        className="section-shell pt-0"
        aria-label="Measurements and professional history"
      >
        <StatsSection data={data} />
      </section>

      {/*
        The filter bar is `sticky` and must live inside the element it scrolls
        with. Wrapped in its own short div it unstuck as soon as that div left the
        viewport, so the pills vanished while the grid was still on screen.
      */}
      <section id="portfolio" className="section-shell" aria-label="Portfolio">
        <PortfolioFilter />
        <GallerySection data={data} />
      </section>

      <section
        id="contact"
        className="section-shell"
        aria-labelledby="contact-heading"
      >
        <ContactSection />
      </section>

      <section className="section-shell pt-0 text-center">
        <CreditsSection />
      </section>
    </main>
  );
}
