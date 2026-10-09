import type { ReactNode } from 'react';
import { SectionBackground } from '../backgrounds/SectionBackground';
import type { Variant } from '../backgrounds/variants';

/**
 * A content section on an inner page, with the homepage's rhythm: the same
 * vertical padding, alternating tones ("base" = page colour, "raised" =
 * slightly lighter band with a glowing top edge and soft blends), and one
 * shared-system background variant behind the content.
 */
export function PageSection({
  id,
  labelledBy,
  tone = 'base',
  background,
  className = '',
  children,
}: {
  id?: string;
  /** id of the section's heading. */
  labelledBy: string;
  tone?: 'base' | 'raised';
  background?: Variant;
  className?: string;
  children: ReactNode;
}) {
  const raised = tone === 'raised';
  return (
    <section id={id} aria-labelledby={labelledBy} className={`section-pad relative isolate ${raised ? 'bg-ink-900' : ''} ${className}`}>
      {background && <SectionBackground variant={background} blend={raised ? 'both' : 'none'} />}
      {raised && <div aria-hidden="true" className="section-seam glow-divider absolute inset-x-0 top-0 opacity-50" />}
      <div className="container-site">{children}</div>
    </section>
  );
}
