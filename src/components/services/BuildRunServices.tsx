import { useEffect, useRef, useState } from 'react';
import { BUILD_RUN, BUILD_RUN_INTRO } from '../../data/services';
import { Icon } from '../Icons';
import { SectionHeading } from '../ui';
import { pad } from './format';
import { ServiceCard } from './ServiceCard';

/** Compact jump index of the Build & Run services. */
function ServiceIndex() {
  return (
    <nav aria-label="Build & Run services" data-reveal className="rounded-card border border-line bg-ink-900/60 p-2 backdrop-blur-sm">
      <p className="px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">In this section</p>
      <ol className="grid sm:grid-cols-2 lg:grid-cols-1">
        {BUILD_RUN.map((s, i) => (
          <li key={s.slug}>
            <a
              href={`#${s.slug}`}
              className="group flex min-h-[44px] items-center gap-3.5 rounded-xl px-3 lg:min-h-[40px] text-[14.5px] text-[#C9D3E0] transition-colors duration-300 hover:bg-white/[0.03] hover:text-text"
            >
              <span className="w-5 text-xs font-semibold tabular-nums text-muted transition-colors duration-300 group-hover:text-cyan">{pad(i + 1)}</span>
              <span className="flex-1">{s.title}</span>
              <Icon
                name="arrowRight"
                className="h-4 w-4 shrink-0 text-electric opacity-0 transition duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
              />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Build & Run: heading with a jump index, then one hairline index row per
 * service. The row crossing the middle of the viewport is "active" and lights up.
 */
export function BuildRunServices() {
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.row));
        });
      },
      { rootMargin: '-46% 0px -46% 0px' },
    );
    list.querySelectorAll('[data-row]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-16 xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* data-bg-anchor="copy" keeps the section background's pulse lanes off the heading */}
        <div data-bg-anchor="copy" className="relative">
          <SectionHeading id="build-run-title" align="left" eyebrow={BUILD_RUN_INTRO.eyebrow} title={BUILD_RUN_INTRO.title} lead={BUILD_RUN_INTRO.lead} />
        </div>
        <ServiceIndex />
      </div>

      <div className="relative mt-12 md:mt-14 lg:mt-16">
        {/* data-bg-anchor="lane": the section's build flows run along each row's divider, never through its text */}
        <ol ref={listRef} className="border-b border-line">
          {BUILD_RUN.map((s, i) => (
            <li key={s.slug} data-row={i} data-reveal data-bg-anchor="lane">
              <ServiceCard service={s} index={i} active={active === i} />
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
