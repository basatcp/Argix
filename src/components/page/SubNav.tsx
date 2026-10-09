import { isPlainClick } from '../../router';
import { pad2 } from '../../lib/format';
import { useEffect, useRef, type CSSProperties } from 'react';
import { useActiveSection } from '../../hooks/useActiveSection';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';

export interface SubNavItem {
  id: string;
  label: string;
  /** Shorter label for the chip row on smaller screens. */
  short?: string;
}

/**
 * Sticky in-page navigation directly under the fixed 72px header (Industries,
 * Security). From 1280px: one numbered cell per section with a cyan underline
 * on the section being read. Below: a row of 44px chips that scrolls sideways
 * inside the container (never the page) and keeps the current chip in view.
 *
 * Sections it points to need a scroll margin that clears header + bar:
 * `scroll-mt-[134px] xl:scroll-mt-[130px]` (or less if their own top padding
 * already clears the bar).
 */
export function SubNav({ label, items }: { label: string; items: SubNavItem[] }) {
  const { active, select } = useActiveSection(
    items.map((i) => i.id),
    { line: 0.4 },
  );
  const scroller = useRef<HTMLOListElement>(null);

  // Keep the current chip in view in the sideways-scrolling row; back to the start above the first section.
  useEffect(() => {
    const list = scroller.current;
    if (!list || list.scrollWidth <= list.clientWidth + 1) return;
    const link = active ? list.querySelector<HTMLElement>(`[data-target="${active}"]`) : null;
    const left = link ? link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2 : 0;
    list.scrollTo({ left: Math.max(0, left), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [active]);

  return (
    <nav aria-label={label} className="sticky top-[72px] z-30 border-b border-line bg-ink-950/85 backdrop-blur-md">
      <div className="container-site">
        <ol
          ref={scroller}
          style={{ ['--cols' as string]: items.length } as CSSProperties}
          className="relative -mx-4 flex gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:mx-0 xl:grid xl:grid-cols-[repeat(var(--cols),minmax(max-content,1fr))] xl:gap-0 xl:overflow-visible xl:p-0 [&::-webkit-scrollbar]:hidden"
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
                    // The router scrolls and moves focus; this only fixes the highlight during the scroll.
                    if (isPlainClick(e)) select(item.id);
                  }}
                  className={`group relative flex h-11 items-center gap-2.5 whitespace-nowrap rounded-lg border px-3.5 text-[14px] font-medium transition-colors duration-300 xl:h-14 xl:rounded-none xl:border-0 xl:px-5 ${
                    on
                      ? 'border-electric/50 bg-electric/[0.08] text-text xl:bg-electric/[0.05]'
                      : 'border-line text-muted hover:border-electric/35 hover:text-text xl:hover:bg-white/[0.02]'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`text-[11px] font-semibold tracking-[0.14em] transition-colors duration-300 ${on ? 'text-cyan' : 'text-muted group-hover:text-[#C9D3E0]'}`}
                  >
                    {pad2(i + 1)}
                  </span>
                  {item.short ? (
                    <>
                      <span className="xl:hidden">{item.short}</span>
                      <span className="hidden xl:inline">{item.label}</span>
                    </>
                  ) : (
                    <span>{item.label}</span>
                  )}
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
