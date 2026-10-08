import { FRAMEWORKS, PILLARS, SERVICES, type CoreLayer, type Pillar } from '../../data/site';
import { Icon } from '../Icons';
import { MiniCore } from '../MiniCore';
import { SectionHeading } from '../ui';
import { SectionBackground } from '../backgrounds/SectionBackground';

/* SECTION 2: Trust framework strip */
export function FrameworkStrip() {
  return (
    <section aria-labelledby="frameworks-title" className="relative isolate border-b border-line bg-ink-900 py-10 md:py-12">
      <SectionBackground variant="strip" />
      <div className="container-site flex flex-col items-center gap-6 lg:flex-row lg:gap-10">
        <h2 id="frameworks-title" className="shrink-0 text-[13px] font-semibold uppercase tracking-[0.16em] text-muted">
          Frameworks We Build and Test For
        </h2>
        <ul className="flex flex-wrap justify-center gap-2.5 lg:justify-start">
          {FRAMEWORKS.map((f) => (
            <li
              key={f}
              data-reveal
              className="rounded-lg border border-line px-3.5 py-2 text-[13.5px] font-medium tracking-wide text-[#C9D3E0] transition-[border-color,color,box-shadow] duration-300 hover:border-electric/45 hover:text-text hover:shadow-[0_0_16px_-6px_rgba(59,130,246,0.55)]"
            >
              {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* SECTION 3: Build / Run / Secure */
const PILLAR_LAYERS: Record<Pillar['key'], { lit: CoreLayer[]; focus: CoreLayer }> = {
  build: { lit: ['core'], focus: 'core' },
  run: { lit: ['core', 'rings', 'structure', 'pipeline'], focus: 'rings' },
  secure: { lit: ['core', 'rings', 'structure', 'pipeline', 'shield', 'modules'], focus: 'shield' },
};

export function BuildRunSecure() {
  return (
    <section id="pillars" aria-labelledby="pillars-title" className="section-pad relative isolate">
      <SectionBackground variant="pillars" />
      <div className="container-site">
        <SectionHeading
          id="pillars-title"
          eyebrow="One team, every layer"
          title="Build It. Run It. Secure It."
          lead="Software, cloud and security from one team, so the people who build your system also understand how it can fail."
        />

        <div data-bg-anchor="pillars" className="relative mt-14 grid gap-5 md:mt-16 lg:grid-cols-3">
          {PILLARS.map((p, i) => (
            <article
              key={p.key}
              data-reveal
              aria-labelledby={`pillar-${p.key}`}
              data-bg-anchor={p.key === 'secure' ? 'secure' : undefined}
              className="card group relative flex flex-col overflow-hidden p-7 transition-colors duration-300 hover:border-electric/40 md:p-8"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    0{i + 1} · {p.layer}
                  </p>
                  <h3 id={`pillar-${p.key}`} className="mt-3 text-[30px] font-semibold tracking-[-0.02em] text-text">
                    {p.title}
                  </h3>
                </div>
                <MiniCore {...PILLAR_LAYERS[p.key]} className="h-24 w-24 shrink-0 -mr-2 -mt-2" />
              </div>
              <p className="mt-4 text-[15.5px] leading-relaxed text-muted">{p.description}</p>
              <div data-draw className="glow-divider my-6 origin-left opacity-60" aria-hidden="true" />
              <ul className="space-y-3">
                {p.services.map((s) => (
                  <li key={s} className="flex items-center gap-3 text-[15px] text-[#D5DDE8]">
                    <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-electric" aria-hidden="true" />
                    {s}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* SECTION 4: Selected service cards */
export function ServiceCards() {
  return (
    <section id="services" aria-labelledby="services-title" className="section-pad relative isolate bg-ink-900">
      <SectionBackground variant="network" blend="both" />
      <div aria-hidden="true" className="glow-divider absolute inset-x-0 top-0 opacity-50" />
      <div className="container-site">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            id="services-title"
            align="left"
            eyebrow="Services"
            title="Engineering and security services that work together"
          />
          <a data-reveal href="#contact" className="btn-secondary shrink-0">
            Discuss your project
            <Icon name="arrowRight" className="h-4 w-4" />
          </a>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <li key={s.title} data-reveal>
              <a
                href="#contact"
                className="card group flex h-full flex-col p-6 transition duration-300 hover:-translate-y-1 hover:border-electric/45 hover:bg-card"
              >
                <div className="flex items-center justify-between">
                  <span className="icon-tile transition-colors duration-300 group-hover:border-electric/50">
                    <Icon name={s.icon} className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted/80">{s.group}</span>
                </div>
                <h3 className="mt-6 text-[17.5px] font-semibold leading-snug tracking-[-0.01em] text-text">{s.title}</h3>
                <p className="mt-2.5 flex-1 text-[14.5px] leading-relaxed text-muted">{s.text}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-electric">
                  Learn more
                  <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  <span className="sr-only">about {s.title}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
