import type { FaqGroup } from '../../data/faq';
import { ConsultButton } from '../page/ConsultButton';
import { groupNumber } from './meta';
import { useActiveSection } from '../../hooks/useActiveSection';

/** Hexagonal rail node: a quiet outline, with a lit layer cross-faded in (opacity only). */
function RailNode({ lit, current }: { lit: boolean; current: boolean }) {
  return (
    <span aria-hidden="true" className="absolute left-0 top-1/2 h-[18px] w-[18px] -translate-y-1/2">
      <span
        className={`absolute -inset-2 rounded-full bg-cyan/20 blur-md transition-opacity duration-500 ${current ? 'opacity-100' : 'opacity-0'}`}
      />
      <svg viewBox="0 0 20 20" className="relative h-full w-full" fill="none">
        <path d="M10 1.5 17.4 5.75v8.5L10 18.5 2.6 14.25v-8.5Z" fill="#07111F" stroke="rgba(90,150,220,0.38)" strokeWidth="1.3" />
        <g className={`transition-opacity duration-500 ${current ? 'opacity-100' : lit ? 'opacity-50' : 'opacity-0'}`}>
          <path d="M10 1.5 17.4 5.75v8.5L10 18.5 2.6 14.25v-8.5Z" fill="rgba(57,215,255,0.1)" stroke="#39D7FF" strokeWidth="1.3" />
          <circle cx="10" cy="10" r="2.6" fill="#39D7FF" />
        </g>
      </svg>
    </span>
  );
}

/**
 * Sticky sub-navigation of the FAQ page (desktop): the four categories on a
 * vertical circuit rail. The node of the group being read lights up and the
 * rail fills down to it; below it, a short prompt to ask an engineer.
 * It tracks the current group itself, so scrolling re-renders only the rail.
 */
export function FaqCategoryNav({ groups }: { groups: FaqGroup[] }) {
  // Above the first group the first one is current; past the last, the last stays lit.
  const { active: reading, select } = useActiveSection(
    groups.map((g) => g.id),
    { holdAtEnd: true },
  );
  const active = reading ?? groups[0]?.id;
  const index = Math.max(0, groups.findIndex((g) => g.id === active));
  const progress = groups.length > 1 ? index / (groups.length - 1) : 1;
  // The rail runs from the first node's centre to the last (rows are equal height).
  const inset = `${50 / groups.length}%`;
  return (
    <div>
      <nav data-reveal aria-labelledby="faq-categories-label">
        <p id="faq-categories-label" className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Categories
        </p>
        <div className="relative mt-5">
          <span aria-hidden="true" className="absolute left-[8.5px] w-px bg-line" style={{ top: inset, bottom: inset }} />
          <span
            aria-hidden="true"
            className="absolute left-[8.5px] w-px origin-top bg-electric/70 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ top: inset, bottom: inset, transform: `scaleY(${progress})` }}
          />
          <ol>
            {groups.map((g, i) => {
              const current = i === index;
              return (
                <li key={g.id}>
                  <a
                    href={`#${g.id}`}
                    aria-current={current ? 'true' : undefined}
                    onClick={(e) => {
                      if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) select(g.id);
                    }}
                    className="group relative flex min-h-[64px] flex-col-reverse justify-center py-3 pl-10 pr-2"
                  >
                    {/* Title first for assistive tech; shown below the number. */}
                    <RailNode lit={i < index} current={current} />
                    <span
                      className={`mt-1 text-[15.5px] font-medium leading-snug tracking-[-0.005em] transition-colors duration-300 group-hover:text-text ${
                        current ? 'text-text' : 'text-[#C9D3E0]'
                      }`}
                    >
                      {g.title}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`text-[12px] font-semibold tracking-[0.14em] transition-colors duration-300 ${current ? 'text-cyan' : 'text-muted'}`}
                    >
                      {groupNumber(i)}
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      <div data-reveal className="mt-10 rounded-xl border border-line bg-ink-900/60 p-5">
        <p className="text-[15.5px] font-semibold tracking-[-0.005em] text-text">Can’t find your question?</p>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">Ask an engineer directly in a free 30-minute consultation.</p>
        {/* Padding grows the hit area to 32px; the negative bottom margin keeps the card's spacing. */}
        <ConsultButton source="faq-sidebar" label="Ask an engineer" variant="link" className="-mb-1.5 mt-2.5 py-1.5" />
      </div>
    </div>
  );
}
