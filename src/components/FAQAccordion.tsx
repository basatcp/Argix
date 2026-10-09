import { useId, useState } from 'react';
import { Icon } from './Icons';

export interface FaqEntry {
  q: string;
  a: string;
  /** Optional anchor id, for deep links to one question. */
  id?: string;
}

function FaqItem({ item, open, onToggle }: { item: FaqEntry; open: boolean; onToggle: () => void }) {
  const id = useId();
  const btnId = `${id}-btn`;
  const panelId = `${id}-panel`;
  return (
    <li id={item.id} className="scroll-mt-28 border-b border-line last:border-b-0">
      <h3>
        <button
          id={btnId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-6 py-6 text-left text-[17px] font-medium text-text transition-colors hover:text-cyan md:text-[18px]"
        >
          {item.q}
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition duration-300 ${
              open ? 'rotate-180 border-electric/50 text-cyan' : 'border-line text-muted'
            }`}
            aria-hidden="true"
          >
            <Icon name="chevronDown" className="h-4 w-4" />
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        className={`grid transition-[grid-template-rows,visibility] duration-300 ease-out ${open ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <p
            className={`max-w-[680px] pb-6 pr-2 text-[15.5px] sm:pr-12 leading-relaxed text-muted transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              open ? 'translate-y-0 opacity-100 delay-75' : '-translate-y-1 opacity-0'
            }`}
          >
            {item.a}
          </p>
        </div>
      </div>
    </li>
  );
}

/**
 * Accessible accordion (one panel open at a time): buttons with aria-expanded,
 * labelled regions, smooth height, the answer fading in and the chevron
 * turning. Used by the homepage FAQ and every group on the FAQ page.
 */
export function FAQAccordion({
  items,
  initialOpen = 0,
  reveal = true,
  className = '',
}: {
  items: FaqEntry[];
  /** Index open at first, or null for all closed. */
  initialOpen?: number | null;
  /** Fade in with the shared scroll reveal. */
  reveal?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(initialOpen);
  return (
    <ul data-reveal={reveal || undefined} className={`card px-6 md:px-8 ${className}`}>
      {items.map((item, i) => (
        <FaqItem key={item.q} item={item} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
      ))}
    </ul>
  );
}
