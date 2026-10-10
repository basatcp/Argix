import { pad2 } from '../../lib/format';
import { useEffect, useId, useState } from 'react';
import type { BuildService } from '../../data/services';
import { useRouter } from '../../router';
import { Icon } from '../Icons';
import { ConsultButton } from '../page/ConsultButton';

/**
 * One Build & Run service as an index row on a hairline: number and icon, title,
 * summary and a consultation link, then key capabilities and typical use cases
 * in two columns. `active` (the row crossing the middle of the viewport) lights
 * the row's rule and number. On phones the two lists sit behind a disclosure
 * button so the section stays scannable; a link to the service
 * (/services#ai-solutions, or the jump index) opens it.
 */
export function ServiceCard({ service, index, active = false }: { service: BuildService; index: number; active?: boolean }) {
  const { location } = useRouter();
  // Open from the first render when the page is entered on this service, so the jump to it
  // happens against the final layout (opening it afterwards would shift the scroll position).
  const [open, setOpen] = useState(() => location.hash === `#${service.slug}`);
  const panelId = useId();
  const titleId = `${service.slug}-title`;

  useEffect(() => {
    if (location.hash === `#${service.slug}`) setOpen(true);
  }, [location.hash, service.slug]);

  return (
    <article id={service.slug} aria-labelledby={titleId} className="group relative scroll-mt-28 border-t border-line py-8 md:py-9 lg:py-9">
      {/* active marker: the row's rule lights from the left */}
      <span
        aria-hidden="true"
        className={`absolute -top-px left-0 h-px w-48 bg-gradient-to-r from-cyan via-cyan/50 to-transparent transition-opacity duration-500 ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div className="grid gap-5 md:gap-6 lg:grid-cols-[52px_minmax(0,4fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-0 xl:gap-x-12">
        <div className="flex items-center gap-4 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:flex-col lg:items-start lg:gap-3.5">
          <span className={`icon-tile transition-colors duration-500 group-hover:border-electric/50 ${active ? 'border-electric/50' : ''}`}>
            <Icon name={service.icon} className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
          </span>
          <span
            aria-hidden="true"
            className={`text-xs font-semibold tabular-nums tracking-[0.16em] transition-colors duration-500 lg:pl-0.5 ${active ? 'text-cyan' : 'text-muted'}`}
          >
            {pad2(index + 1)}
          </span>
        </div>

        <div className="lg:col-start-2 lg:row-start-1">
          <h3 id={titleId} className="text-[22px] font-semibold leading-snug tracking-[-0.015em] text-text md:text-[24px] lg:-mt-0.5">
            {service.title}
          </h3>
          <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-muted md:text-[15.5px]">{service.summary}</p>
        </div>

        {/* phones: the lists open on demand */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-[48px] w-full items-center justify-between gap-4 rounded-xl border border-line bg-ink-900/60 px-4 text-left text-[14.5px] font-medium text-[#D5DDE8] transition-colors duration-300 hover:border-electric/45 md:hidden"
        >
          <span>
            Capabilities and use cases<span className="sr-only"> for {service.title}</span>
          </span>
          <Icon name="chevronDown" className={`h-4 w-4 shrink-0 text-electric transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </button>

        <div
          id={panelId}
          className={`${open ? 'grid' : 'hidden'} gap-6 px-1 md:grid md:grid-cols-2 md:gap-8 md:px-0 md:pt-1 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:gap-10 lg:pt-0.5`}
        >
          <div>
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-electric">
              <Icon name="layers" className="h-4 w-4" />
              Key capabilities
            </h4>
            <ul className="mt-4 space-y-2.5">
              {service.capabilities.map((c) => (
                <li key={c} className="flex gap-3 text-[14.5px] leading-snug text-[#D5DDE8]">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-electric" aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan">
              <Icon name="target" className="h-4 w-4" />
              Typical use cases
            </h4>
            <ul className="mt-4 space-y-2.5">
              {service.useCases.map((u) => (
                <li key={u} className="flex gap-3 text-[14.5px] leading-snug text-[#D5DDE8]">
                  <Icon name="check" className="mt-px h-4 w-4 shrink-0 text-cyan" />
                  {u}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* After the details in reading and tab order; beside the summary on desktop (grid placement). */}
        <div className="-mt-1 lg:col-start-2 lg:row-start-2 lg:mt-0 lg:pt-3">
          <ConsultButton source={`services-${service.slug}`} label="Discuss this service" context={`(${service.title})`} variant="link" className="min-h-[44px]" />
        </div>
      </div>
    </article>
  );
}
