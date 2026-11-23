import Image from "next/image";
import { portfolio, type Portfolio } from "../../data/portfolio";

interface AboutSectionProps {
  data?: Portfolio | null;
}

/*
  The one bone band. Left: index label, a huge thin serif title, the bio and a
  tracked-caps meta block. Right: a turtleneck portrait bleeding off the
  edge.
*/
export default function AboutSection({ data }: AboutSectionProps) {
  const currentData = data ?? portfolio;
  const { portrait } = currentData;

  const facts = [
    { label: "Based in", value: currentData.origin ?? "" },
    { label: "Nationality", value: currentData.nationality ?? "" },
    { label: "Representation", value: currentData.agency ?? "Independent, booked directly" },
    { label: "Available for", value: "Runway, editorial, campaign, beauty" },
  ].filter((fact) => Boolean(fact.value));

  return (
    <div className="relative grid grid-cols-1 overflow-hidden lg:min-h-[100svh] lg:grid-cols-12">
      <div className="flex flex-col justify-between gap-14 px-[var(--space-gutter)] py-[var(--space-section)] lg:col-span-6 lg:pr-0">
        <p className="type-label flex items-center gap-3">
          03 <span aria-hidden="true" className="inline-block h-px w-8 bg-current" /> Profile
        </p>

        <div>
          <h2 id="about-heading" className="type-serif relative z-10 text-[clamp(3.5rem,1.5rem+7vw,9.5rem)] leading-[0.88]">
            Stillness
            <br />
            and strong
            <br />
            lines
          </h2>
          <p className="mt-10 max-w-[44ch] text-[var(--text-secondary)] lg:max-w-[38ch]">{currentData.bio}</p>
        </div>

        {facts.length > 0 && (
          <dl className="grid grid-cols-2 gap-x-8 gap-y-5 border-t border-[var(--border-subtle)] pt-6 lg:max-w-[78%]">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="type-label">{fact.label}</dt>
                <dd className="mt-1 text-[0.8125rem] font-medium uppercase tracking-[0.14em]">{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {portrait && (
        <figure className="relative min-h-[80svh] lg:col-span-6 lg:min-h-0">
          <div data-gl className="absolute inset-0">
            <Image
              src={portrait.path}
              alt={portrait.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              style={{ objectPosition: portrait.position ?? "50% 25%" }}
              className="object-cover"
            />
          </div>
          {portrait.credit && (
            <figcaption className="type-label absolute bottom-6 right-[var(--space-gutter)] z-10 !text-[var(--ink)]">
              {portrait.credit}
            </figcaption>
          )}
        </figure>
      )}
    </div>
  );
}
