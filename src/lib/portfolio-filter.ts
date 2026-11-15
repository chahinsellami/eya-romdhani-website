/**
 * Shared category-filter store.
 *
 * The URL hash (`#portfolio=Editorial`) is the single source of truth so the
 * sticky filter bar and the gallery grid can never disagree. `history.replaceState`
 * does NOT fire `hashchange`, so we also broadcast a custom event; every consumer
 * subscribes through `subscribeFilter` and therefore sees writes from any caller.
 */

export const FILTERS = [
  "All",
  "Runway",
  "Editorial",
  "Campaign",
  "Commercial",
] as const;

export type Filter = (typeof FILTERS)[number];

/** Dispatched on `window` after the hash is rewritten in place. */
export const FILTER_EVENT = "portfolio:filter";

const HASH_KEY = "portfolio";

export function isFilter(value: string | null): value is Filter {
  return value !== null && (FILTERS as readonly string[]).includes(value);
}

/** Read the active category from `#portfolio=<Category>`, defaulting to "All". */
export function readFilterFromHash(): Filter {
  if (typeof window === "undefined") return "All";
  const [, query] = window.location.hash.replace(/^#/, "").split("=");
  const candidate: string = query ?? "";
  return isFilter(candidate) ? candidate : "All";
}

/** Write the active category to the hash without polluting history. */
export function setFilter(category: Filter): void {
  if (typeof window === "undefined") return;

  const next =
    category === "All"
      ? window.location.pathname + window.location.search
      : `#${HASH_KEY}=${category}`;

  window.history.replaceState(null, "", next);
  window.dispatchEvent(new CustomEvent<Filter>(FILTER_EVENT, { detail: category }));
}

/**
 * Re-broadcast whatever the hash currently says.
 *
 * Navigation writes `#about` / `#portfolio` / `#contact` to the same hash the
 * filter owns, which means the URL can stop describing an active filter without
 * any filter write happening. Calling this after such a write keeps the grid and
 * the address bar in agreement.
 */
export function syncFilterFromHash(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<Filter>(FILTER_EVENT, { detail: readFilterFromHash() }),
  );
}

/** Run `onChange` for local writes and for browser back/forward navigation. */
export function subscribeFilter(onChange: (category: Filter) => void): () => void {
  const onHashChange = () => onChange(readFilterFromHash());
  const onLocalWrite = (event: Event) => {
    const detail = (event as CustomEvent<Filter>).detail;
    onChange(isFilter(detail ?? null) ? detail : readFilterFromHash());
  };

  window.addEventListener("hashchange", onHashChange);
  window.addEventListener(FILTER_EVENT, onLocalWrite);

  return () => {
    window.removeEventListener("hashchange", onHashChange);
    window.removeEventListener(FILTER_EVENT, onLocalWrite);
  };
}
