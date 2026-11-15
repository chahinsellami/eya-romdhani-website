/**
 * Scroll behaviour that respects the user's motion preference.
 *
 * `globals.css` sets `scroll-behavior: auto` under `prefers-reduced-motion`,
 * but an explicit `behavior: "smooth"` passed to `scrollIntoView`/`scrollTo`
 * overrides that stylesheet rule — the CSS can't win against an inline JS
 * option. Every programmatic scroll therefore has to ask the media query itself.
 */
export function preferredScrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") return "auto";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}
