import type { FaqGroup } from '../../data/faq';
import { Icon } from '../Icons';
import { GROUP_ICONS, groupNumber, questionCount } from './meta';

/**
 * Rounds the cells on the panel's bottom corners (inner radius 19px), so the
 * inset focus outline follows the panel's curve instead of being clipped:
 * one column on phones and desktop, 2 x 2 from `sm` to `lg`.
 */
function cornerClass(i: number, n: number) {
  // rounded-none first: it also overrides the global 6px focus radius on the other corners.
  if (i === n - 1) return n % 2 === 0 ? 'rounded-none rounded-b-[19px] sm:rounded-bl-none lg:rounded-bl-[19px]' : 'rounded-none rounded-b-[19px]';
  if (n % 2 === 0 && i === n - 2) return 'rounded-none sm:rounded-bl-[19px] lg:rounded-bl-none';
  return 'rounded-none';
}

/**
 * Hero aside of the FAQ page: an index of the four categories, each row
 * jumping to its group. One column beside the hero copy on desktop, a 2 x 2
 * grid on tablets, stacked rows on phones. The groups' "All topics" links
 * jump back here (it takes focus, so Tab continues into the rows).
 */
export function FaqTopicIndex({ groups }: { groups: FaqGroup[] }) {
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  return (
    <nav
      id="faq-topics"
      tabIndex={-1}
      aria-labelledby="faq-topics-label"
      className="relative scroll-mt-28 overflow-hidden rounded-card border border-line bg-card shadow-[0_40px_100px_-50px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.03)] focus:outline-none lg:ml-auto lg:max-w-[460px]"
    >
      <div aria-hidden="true" className="glow-divider absolute inset-x-8 top-0 opacity-60" />
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
        <p id="faq-topics-label" className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C9D3E0]">
          Browse by topic
        </p>
        <p className="text-[13px] text-muted">{total} questions</p>
      </div>
      {/* 1px gaps over the line colour draw the hairlines between rows and cells. */}
      <ul className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-1">
        {groups.map((g, i) => (
          <li key={g.id} className="bg-card">
            <a
              href={`#${g.id}`}
              // The focus outline is drawn inside the row: outside it, the panel and the next row would cover it.
              className={`group flex min-h-[78px] items-center gap-4 px-5 py-4 transition-colors duration-300 hover:bg-electric/[0.05] focus-visible:outline-offset-[-2px] sm:px-6 ${cornerClass(i, groups.length)}`}
            >
              <span className="icon-tile transition-colors duration-300 group-hover:border-electric/45">
                <Icon name={GROUP_ICONS[g.id] ?? 'fileText'} className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-medium tracking-[-0.005em] text-text">{g.title}</span>
                <span className="mt-0.5 block text-[13px] text-muted">
                  <span aria-hidden="true" className="font-semibold tracking-[0.08em] text-cyan">
                    {groupNumber(i)}
                  </span>
                  <span aria-hidden="true" className="mx-2 text-muted/60">
                    /
                  </span>
                  <span className="sr-only">, </span>
                  {questionCount(g.items.length)}
                </span>
              </span>
              <Icon
                name="arrowRight"
                className="h-4 w-4 shrink-0 rotate-90 text-electric transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-1"
              />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
