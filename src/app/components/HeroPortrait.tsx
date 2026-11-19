import Image from "next/image";

interface HeroPortraitProps {
  src?: string;
  alt?: string;
  caption?: string;
  origin?: string;
  position?: string;
}

export default function HeroPortrait({
  src = "/images/portfolio/portrait-turtleneck-full.webp",
  alt = "Black and white studio portrait of Aya Romdhani in a black turtleneck against architectural window shadows",
  caption = "Turtleneck Study — Studio",
  origin = "Sousse, Tunisia",
  position = "50% 18%",
}: HeroPortraitProps) {
  return (
    <figure className="flex h-full flex-col">
      {/* Architectural Obsidian matte frame with Alabaster inner hairline & Crimson marker */}
      <div className="relative aspect-[3/4] max-h-[72svh] w-full flex-1 overflow-hidden border border-[var(--border-strong)] bg-[var(--ink-bg)] p-2.5 sm:max-h-none sm:p-3.5 lg:aspect-auto lg:min-h-[540px]">
        <div className="relative h-full w-full overflow-hidden border border-white/15 bg-[var(--ink-surface)]">
          <Image
            src={src}
            alt={alt}
            fill
            priority
            fetchPriority="high"
            referrerPolicy="no-referrer"
            sizes="(max-width: 1024px) 100vw, 48vw"
            style={{ objectPosition: position }}
            className="object-cover"
          />
        </div>
      </div>

      {/* Clean unboxed editorial caption */}
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-tertiary)]">
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 bg-[var(--accent-primary)]"
          />
          <span>{caption}</span>
        </span>
        <span className="font-mono text-[11px] tabular-nums">{origin}</span>
      </figcaption>
    </figure>
  );
}
