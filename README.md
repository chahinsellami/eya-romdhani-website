# Aya Romdhani — Runway & Editorial Model

Portfolio site for runway and editorial model Aya Romdhani (Sousse, Tunisia),
built with Next.js (App Router), TypeScript, Tailwind CSS, three.js and GSAP.

## Design

Noir, after two reference sites the owner chose: a dark page of full-bleed
photographic bands with one bone band (About), huge thin serif, tiny tracked
capital labels with an index (01 Home to 05 Booking), hairline rules.

- **Colour** (tokens in `src/app/globals.css`): ink `#0B0A09`, bone `#E8E2D9`,
  ash `#9A948B` for secondary text. No colour accent: the photographs carry the
  colour. `.surface-ink` / `.surface-bone` flip the semantic tokens per band.
  A static film-grain overlay sits over everything.
- **Type**: Cormorant at weight 300 for all display type (name, titles,
  figures, "PRESENCE"); Archivo for body text and the tracked caps labels.
- **WebGL** (`components/experience/WebGLStage.tsx`): one fixed three.js canvas
  redraws every element marked `data-gl` as a shader plane that matches its box.
  Prints develop in on first view and bend slightly with scroll speed; there
  is deliberately no hover zoom. `data-gl-depth` adds mouse parallax. At rest the photo is untouched.
  Without WebGL, or with reduced motion, the canvas is never created and the
  plain `<img>` stays.
- **Motion**: Lenis smooth scrolling drives GSAP ScrollTrigger
  (`experience/SmoothScroll.tsx`). The work is an editorial index: the four series listed in huge
  thin serif; pointing at or focusing one crossfades its prints onto the stage
  (WebGLStage follows each print's inline opacity). Phones list each series
  with its prints.

## Setup

```bash
npm install
npm run dev      # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

Always run `npm run build` before `npm start` — `next start` refuses to boot without a
production build in `.next/`.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript (strict)
- Tailwind CSS 3 (colour values come from CSS custom properties in `globals.css`)
- motion (menu, lightbox)
- three.js (WebGL photo planes)
- GSAP + ScrollTrigger, Lenis
- Zod (content schema + contact-form validation)

## Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout: metadata, fonts, skip link
│   ├── page.tsx                # Page composition and section order
│   ├── globals.css             # Design tokens, light/dark schemes, type scale
│   ├── icon.svg                # Favicon / app icon
│   ├── robots.ts / sitemap.ts  # Generated SEO routes
│   └── components/
│       ├── Hero3D.tsx          # WebGL starfield hero (client-only, dynamic)
│       ├── Navigation.tsx      # Responsive nav with mobile menu
│       ├── PortfolioFilter.tsx # Sticky category filter
│       ├── GallerySection.tsx  # Image grid + lightbox
│       ├── Lightbox.tsx        # Focus-trapped image viewer
│       ├── AboutSection.tsx    # Bio
│       ├── StatsSection.tsx    # Measurements + professional history
│       ├── ContactSection.tsx  # Contact details + socials
│       ├── ContactForm.tsx     # Validated form (opens a mail draft)
│       ├── SocialProofBar.tsx  # Fixed agency/campaign bar
│       ├── ScrollProgress.tsx  # Reading-progress rule
│       ├── CreditsSection.tsx  # Copyright footer
│       ├── Reveal.tsx          # Scroll-reveal wrapper (reduced-motion safe)
│       └── StructuredData.tsx  # JSON-LD
├── lib/
│   └── portfolio-filter.ts     # Shared filter store (hash is source of truth)
└── data/
    └── portfolio.ts            # Typed content, validated by Zod at import
```

## Content

Everything on the page is driven by `src/data/portfolio.ts`, which is parsed
through a Zod schema at import time — invalid content fails the build rather than
rendering broken.

### Images — currently placeholders

**Every photograph on this site is licensed stock standing in for the real
shots.** There are no photographs of the model in the repository yet, so the
hero, the About portrait and all six gallery tiles point at Unsplash URLs and
carry `placeholder: true`.

That flag is not cosmetic. While any image has it:

- the gallery states "Placeholder imagery — real photographs to follow" under
  its heading,
- the credits block adds "Photography shown is licensed placeholder imagery",
- and the `alt` text begins with "Placeholder:" and describes the stock photo
  rather than claiming it depicts the model.

#### Swapping in the real photographs

1. Put the files in `public/images/portfolio/` (JPEG or WebP, ~1600 px on the
   long edge for the hero, ~1200 px for tiles).
2. Repoint `path` in `src/data/portfolio.ts` to a root-relative URL, e.g.
   `/images/portfolio/look-01.jpg`.
3. Rewrite `alt` to describe the actual photograph. Do not start it with
   "Placeholder".
4. Delete the `placeholder: true` line, and adjust `position` (a CSS
   `object-position`, e.g. `"50% 30%"`) so the crop keeps the face in frame.
5. Once no image has the flag, the two disclosures disappear on their own.

Remote URLs need their host allow-listed in `next.config.ts` under
`images.remotePatterns`; local files need no config.

Each gallery item accepts an optional `alt`; when omitted the component falls
back to `"<title> by <brand>"`.

## Filtering

`#portfolio=<Category>` in the URL is the single source of truth. Both the sticky
filter bar and the gallery subscribe through `src/lib/portfolio-filter.ts`, which
bridges `history.replaceState` with a custom event (a plain hash write does not
fire `hashchange`, which is why the two used to disagree).

## Accessibility

- Skip link, landmark structure, and `aria-labelledby` on each section.
- Lightbox is a focus-trapped `role="dialog"` that restores focus on close.
- All colour pairs meet WCAG AA in both schemes (verified values are noted inline
  in `globals.css`).
- `prefers-reduced-motion` disables reveals and the animated hero; content stays
  visible either way.
- A `<noscript>` rule reveals scroll-animated sections when JS does not run.

## 3D Hero

- Loaded via `next/dynamic` with `ssr: false`, so WebGL stays out of the initial
  bundle. Run `npm run build` for the current figure rather than trusting a
  number written down here; it moves with every dependency change.
- Capped pixel ratio (max 1.75), local lights only — no remote HDRI fetch, so the
  hero renders offline.
- Canvas background follows the opt-in `data-theme` attribute (cream-white or
  charcoal), read through a `MutationObserver`; the starfield only renders in the
  charcoal scheme.

## Deployment

Build, then run the Node server (`npm start`). Any Node host works; Vercel needs
no configuration.

## License

© Aya Romdhani. All rights reserved.
