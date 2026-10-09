import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import { useActiveSection } from '../../hooks/useActiveSection';
import type { Industry } from '../../data/industries';

/**
 * Sticky in-page navigation for the industry sections, directly under the
 * fixed 72px header. Wide screens: a five-column index bar with full names.
 * Below xl: a row of chips with short names that scrolls sideways inside the
 * container (never the page).
 *
 * The section crossing a line at 40% of the viewport is marked active (shared
 * useActiveSection); a chosen chip is marked at once, without stepping through
 * every section the smooth scroll passes.
 */
export function IndustryNav({ items }: { items: Pick<Industry, 'id' | 'title' | 'short'>[] }) {
  const { active, select } = useActiveSection(
    items.map((i) => i.id),
    { line: 0.4 },
  );
  const scroller = useRef<HTMLOListElement>(null);

  // Keep the active chip in view in the sideways-scrolling row (phones and tablets).
  useEffect(() => {
    const list = scroller.current;
    if (!list || list.scrollWidth <= list.clientWidth + 1) return;
    const link = active ? list.querySelector<HTMLElement>(`[data-target="${active}"]`) : null;
    // Back above the first industry: return to the start of the row.
    const left = link ? link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2 : 0;
    list.scrollTo({ left: Math.max(0, left), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [active]);

  return (
    <nav aria-label="Industries on this page" className="sticky top-[72px] z-30 border-b border-line bg-ink-950/85 backdrop-blur-md">
      <div className="container-site">
        <ol
          ref={scroller}
          className="relative -mx-4 flex gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:mx-0 xl:grid xl:grid-cols-5 xl:gap-0 xl:overflow-visible xl:p-0 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, i) => {
            const on = active === item.id;
            return (
              <li key={item.id} className="shrink-0 xl:border-l xl:border-line xl:last:border-r">
                <a
                  href={`#${item.id}`}
                  data-target={item.id}
                  aria-current={on ? 'location' : undefined}
                  onClick={(e) => {
                    if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) select(item.id); // the router scrolls and moves focus; this only fixes the highlight
                  }}
                  className={`group relative flex h-11 items-center gap-2.5 whitespace-nowrap rounded-lg border px-3.5 text-[14px] font-medium transition-colors duration-300 xl:h-14 xl:rounded-none xl:border-0 xl:px-5 ${
                    on
                      ? 'border-electric/50 bg-electric/[0.08] text-text xl:bg-electric/[0.05]'
                      : 'border-line text-muted hover:border-electric/35 hover:text-text xl:hover:bg-white/[0.02]'
                  }`}
                >
                  <span className={`text-[11px] font-semibold tracking-[0.14em] transition-colors duration-300 ${on ? 'text-cyan' : 'text-muted group-hover:text-[#C9D3E0]'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="xl:hidden">{item.short}</span>
                  <span className="hidden xl:inline">{item.title}</span>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-4 -bottom-px hidden h-px bg-gradient-to-r from-transparent via-cyan to-transparent transition-opacity duration-300 xl:block ${
                      on ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
