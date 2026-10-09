import { pad2 } from '../../lib/format';
import type { FaqGroup } from '../../data/faq';
import { FAQAccordion } from '../FAQAccordion';
import { Icon } from '../Icons';
import { GROUP_ICONS } from './meta';

/**
 * One FAQ category: a decorative index line (icon, number, drawn rule), the
 * group's h2 and intro, and the shared accordion. The section carries the
 * group's anchor id (/faq#compliance) and takes focus when a jump link lands
 * on it, so Tab continues into its questions; each question keeps its own id too.
 */
export function FaqGroupSection({
  group,
  index,
  initialOpen,
  accordionKey,
  revealList = true,
}: {
  group: FaqGroup;
  index: number;
  /** Question open at first, or null for all closed. */
  initialOpen: number | null;
  /** Changing it remounts the accordion (used to open a deep-linked question). */
  accordionKey: string;
  /**
   * Fade the question list in with the scroll reveal. Off for the group a deep
   * link lands in: the reveal's initial offset would shift the question after
   * the browser has scrolled to it.
   */
  revealList?: boolean;
}) {
  const titleId = `${group.id}-title`;
  return (
    <section id={group.id} tabIndex={-1} aria-labelledby={titleId} className="scroll-mt-28 focus:outline-none">
      <div data-reveal aria-hidden="true" className="flex items-center gap-4">
        <span className="icon-tile">
          <Icon name={GROUP_ICONS[group.id] ?? 'fileText'} className="h-5 w-5" />
        </span>
        <span className="text-xs font-semibold tracking-[0.16em] text-cyan">{pad2(index + 1)}</span>
        <span data-draw className="h-px min-w-6 flex-1 origin-left bg-line" />
      </div>
      <h2 id={titleId} data-reveal className="mt-7 text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-text md:text-[34px]">
        {group.title}
      </h2>
      <p data-reveal className="mt-3 max-w-[600px] text-pretty text-[15.5px] leading-relaxed text-muted">
        {group.intro}
      </p>
      <div data-reveal={revealList || undefined} className="mt-8">
        <FAQAccordion key={accordionKey} items={group.items} initialOpen={initialOpen} reveal={false} />
      </div>
      {/* Phones and tablets have no category rail: a way back to the topic index. */}
      <a
        href="#faq-topics"
        className="group mt-3 inline-flex min-h-[44px] items-center gap-2 text-[13.5px] font-medium text-muted transition-colors duration-300 hover:text-cyan lg:hidden"
      >
        <Icon name="arrowRight" className="h-4 w-4 -rotate-90 text-electric transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5" />
        All topics
      </a>
    </section>
  );
}
