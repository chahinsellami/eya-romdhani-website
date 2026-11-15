# Change Log

## 2026-11-15 (final) - Palette: gallery white, charcoal, terracotta

The site was warm-black-first with a mint accent, then briefly cream/ink-green/
oxblood. The client reviewed the cream build and rejected it, so the palette was
replaced wholesale with a third option chosen from a four-way preview
(`.pi/palettes.html`): gallery white ground, charcoal structure, terracotta
accent. Only colour changed — no layout, copy or structure.

### Gallery white is the dominant ground

Three families in strict hierarchy. Gallery white (`#FAF8F4`) carries the page
background, the navigation, the filter bar, every section and every card — it is
warm-neutral rather than a pure `#FFF`, so the photographs read as prints pinned
to a wall. Charcoal (`#1A1A1A`) is the structural dark: all body type on the
white (16.6:1) and the hero's photographic scrim. Terracotta (`#B4532A`) is the
single accent, kept to links, focus rings, buttons and the small uppercase
labels. Graphite (`#242424`) and Stone (`#7A736A`) are supporting tones;
Terracotta lit (`#E8855C`) is the accent where it has to sit on charcoal.

### What changed structurally, not just in value

- **The scheme default stayed opt-in.** The white is the design, so it must not
  be overridden by a system preference — this machine reports
  `prefers-color-scheme: dark`, so an automatic dark override would have flipped
  the whole page to charcoal for the client. The charcoal scheme lives in
  `[data-theme="dark"]` on `<html>`; `viewport.colorScheme` is `"light"` and
  `:root` declares `color-scheme: light` so native scrollbars and form controls
  match the white ground. `Hero3D` reads the `data-theme` attribute through a
  `MutationObserver` rather than a media query.
- **Palette primitives are named tokens** (`--bone`, `--charcoal`, `--graphite`,
  `--terracotta`, `--terracotta-lit`, `--stone`, `--stone-lit`) and the semantic
  tokens map onto them, so no hex value is written twice.
- **The hero stays dark, but dark is now near-black charcoal.** `--hero-solid` is
  `#141414`, the scrims are charcoal, and the on-photo accent is Terracotta lit —
  the deep terracotta would have measured ≈3.4:1 on the photograph, marginal for
  button text. `Hero3D`'s two ground constants and its particle colour were moved
  to white/charcoal to match.
- **The favicon followed the palette.** `src/app/icon.svg` was a warm-black tile
  with a champagne-gold border (from the very first build, two palettes ago); it
  is now a charcoal tile with a terracotta border and a bone monogram.

### Verified

- `npx tsc --noEmit` clean; ESLint clean on the changed files.
- Live in Chromium at 1280×900 with the OS preferring dark: body background
  `rgb(250,248,244)` (gallery white), body colour `rgb(26,26,26)` (charcoal),
  `--accent-primary` `#B4532A`, `--hero-solid` `#141414`. Setting
  `data-theme="dark"` flips to background `rgb(26,26,26)` / text
  `rgb(250,248,244)` / accent `#E8855C`, and removing it restores the white.
- Full-page screenshot confirmed: white page, terracotta filter chip and card
  tags, near-black hero, all six gallery photographs rendering.

## 2026-11-15 (later) - Design and audit pass

The repair pass made the site work. This pass makes it look like a model's
portfolio rather than a template, and fixes what a second audit found.

### The hero was the main problem

The first screen was a centred wordmark on a near-black field with a faint
starfield behind it: the name floated in an empty void and no photograph
appeared anywhere above the fold. On a portfolio for one person, the first screen
has to show the face. It is now an editorial split — the name set large in the
left gutter, the portrait bleeding toward the right edge, both sitting on the same
grid as every section below, with a short fact row (height, show count, base city).
The WebGL field stays as a backdrop layer rather than the main event. Collapses to
stacked text-over-photo below `lg`.

`AboutSection` got the same treatment: portrait beside the bio, with
representation, base city and nationality broken out as a fact table instead of
buried in a paragraph.

### Photographs are placeholders, and now say so

There are no photographs of the model in the repository, so every image is
licensed stock. The alt text used to assert these *were* her ("Evelyn Rose
walking the runway..."), which is a lie told to every screen-reader user. Every
image now carries `placeholder: true`, the alt text begins "Placeholder:" and
describes what the stock photo actually shows, and the gallery plus the credits
block say so in one quiet line each. `README.md` documents the five-step swap.

### Two of six gallery photos were men

A page for one female model showed a man on a stool as "Vogue Editorial" and a
male headshot as "Prada Spring Campaign". Replaced. Added a `position` field so a
3:4 tile keeps the face in frame instead of cropping through it.

### Real bugs found by making `npm run lint` work

The lint script existed but there was no ESLint config and no eslint installed, so
it dropped into Next's interactive setup prompt and hung — it had never linted
anything. With ESLint installed it immediately found:

- **`SocialProofBar.tsx` called hooks after an early `return null`.** Conditional
  hooks — a page-level crash the moment the campaign list was empty.
- **A `(p as any)[0]` cast** in `validatePortfolio` that reduced every Zod error
  path to its first character.

### The sticky filter was never sticky

`<main>` had `overflow-x-hidden`. Per CSS Overflow, a hidden x-axis with a visible
y-axis forces the y-axis to `auto`, making `<main>` a scroll container — so the
sticky filter stuck to a container that never scrolls and scrolled away with the
page. Measured: filter top at -51px while scrolled. Changed to `overflow-x-clip`,
which trims overflow without creating a scroll container. Filter now pins at 80px.

### Accessibility

- **Form errors failed contrast in light mode.** `text-red-400` on `#F2EEE7`
  measured 2.39:1, far under the 4.5:1 floor. Replaced the hardcoded reds with
  `--danger-text/-border/-bg` tokens: 7.05:1 light, 10.03:1 dark.
- **Programmatic smooth scrolling ignored `prefers-reduced-motion`.** A JS
  `behavior: "smooth"` overrides the CSS `scroll-behavior: auto` rule. Added
  `src/lib/motion.ts` and used it at all three scroll sites. Verified: with
  reduced motion the page jumps 0→2856 instantly; without it animates.
- **framer-motion animations had no reduced-motion escape** (mobile menu, lightbox,
  filter dropdown) because they drive WAAPI and write inline styles the CSS rules
  cannot reach. Wrapped the app in `<MotionConfig reducedMotion="user">`.
- **Mobile menu was transparent** — the hero wordmark showed through the links.
- **Focus was lost on menu item selection**; now returns to the toggle.
- `aria-controls` removed where it pointed at elements that only exist while
  expanded. Lightbox dialog no longer duplicates the image alt as its own name;
  the slide counter went from 3.7:1 to 10:1. The gallery's `View →` duplicate
  tab stop is now decorative, halving tab stops through the grid.

### Housekeeping

Self-hosted fonts via `next/font` (the old URL also requested a Playfair weight
that does not exist). Removed dead CSS (`.glass-nav`, `.image-zoom-hover`,
`.gradient-overlay`, `.rule-gold`, `.text-balance`, `.scrollbar-hide`,
`.content-visible-auto`), unused tokens, the unused `lucide-react` dependency and
the stray empty `src/public/` tree. Fixed Tailwind content globs that pointed at
two directories that do not exist. Added `.gitignore`; there was none.

### Verified

`npx tsc --noEmit` clean · `npx next lint` clean · `npm run build` clean
(66.2 kB page) · `node test-browser.js` **15/15** · no horizontal overflow at
1440 or 390 · sticky filter measured at 80px · reduced-motion jump verified.

## 2026-11-15 — Repair pass

A browser-level audit found the site building successfully but failing for users.
This pass fixes those defects and the accessibility problems found alongside them,
without changing the stack or the design direction.

### Root cause

`PortfolioFilter.tsx` wrote the URL hash with `window.history.replaceState()`, which
does **not** fire a `hashchange` event, and `GallerySection.tsx` listened only for
`hashchange`. Selecting a category updated the hash and highlighted the pill, but
the gallery never re-rendered — the site's primary interaction was dead. Separately,
the gallery rendered only CSS placeholder gradients: the Unsplash `path` values in
the data were never drawn, so no photography appeared at all.

### Fixes

**Filtering** — new `src/lib/portfolio-filter.ts` owns the `#portfolio=<Category>`
hash as the single source of truth and bridges `replaceState` with a custom
`portfolio:filter` event. Both components subscribe to it, so writes from either
side stay in sync and back/forward navigation works.

**Gallery** — renders real photographs through `next/image` (`fill`, responsive
`sizes`, `priority` for the first row), with a gradient fallback behind each frame.
Added a shared host allow-list (`images.remotePatterns`) in `next.config.ts` without
which the optimizer rejects the remote URLs.

**Lightbox** — previously showed a permanent "Loading…" overlay (no `onLoad`) and
had no focus management. Now tracks load/error state, traps Tab, closes on Escape or
backdrop click only, locks background scroll, and restores focus to the opening
button on close.

**SocialProofBar** — the wrapper had `pointer-events-none`, making campaign links
impossible to click, and `currentIndex` was stored but never rendered so prev/next
did nothing. Both fixed; the active brand is now marked with `aria-current`.

**Page overlap** — the fixed bar covered the end of the page. `body` now reserves
`--social-bar-height` of padding.

**Light scheme** — components hardcoded `neutral-*` classes, so the light scheme
produced near-black text on near-invisible backgrounds (hero measured ~1.1:1).
Replaced with `var(--text-*)`/`var(--bg-*)` tokens and retuned the light palette;
`tailwind.config.ts` now maps to the same tokens instead of duplicating hex values.

**Contrast** — `--text-tertiary` was `#6B6660`, 3.52:1 on the page background
(below AA). Changed to `#9A938B` (6.60:1). The focus ring was an 18%-opacity glow
measuring ~1.3:1; it is now a solid accent outline (≥5.2:1) with an offset.

**Reduced motion / no-JS** — Framer renders `opacity: 0` in the SSR markup, so whole
sections stayed invisible when JS did not run. New `Reveal.tsx` wrapper plus a
`<noscript>` rule and a `prefers-reduced-motion` rule both force content visible.

**Mobile navigation** — tapping a menu item while the menu was open did nothing,
because the body was scroll-locked and `scrollIntoView()` is a no-op against a locked
body. The menu now closes first and scrolls on the next frame.

**Hero** — removed the remote HDRI fetch (`Environment preset="sunset"`), which made
the hero depend on a third-party CDN, and replaced the flat grey
`MeshReflectorMaterial` panel with a CSS-driven glow. The canvas now follows the
colour scheme (it was hardcoded `#050505`, which broke the light scheme), and
`matchMedia` runs in an effect instead of during render. Loaded via `next/dynamic`
with `ssr: false`: initial page JS dropped from 299 kB to 66 kB.

**Contact form** — claimed "Message sent. Thank you" after a fake 1 s timer despite
having no backend. It now validates, then opens a prefilled `mailto:` draft and says
exactly that, and offers the address as a fallback.

**Smaller items** — `/favicon.ico` 404 (added `icon.svg`); `ScrollProgress` divided by
zero on short pages; `CreditsSection` hardcoded a stale 2024 copyright; section
`aria-labelledby` targets that did not exist; gallery category chips were exposed to
screen readers as stray text; a hero image preload pointed at an SVG the hero never
used. Removed a stray build artifact (`--full-page`) and an empty stray directory.

### Verified

- `npx tsc --noEmit` clean; `npm run build` succeeds (page 66.2 kB / 166 kB first load).
- Production server renders 200 with no console or network errors.
- Filter sync, image loading, lightbox keyboard/focus behaviour, mobile nav scrolling,
  fixed-bar overlap, and both colour schemes checked in a real Chromium session.
- All foreground/background pairs re-measured against WCAG AA in both schemes.
