import type { ReactNode } from 'react';
import { SectionHeading } from '../ui';

/**
 * Section heading for the Security page: the shared SectionHeading, with the
 * service name (the eyebrow) also inside the <h2> as a visually hidden prefix.
 * The visible heading is the section's tagline, but heading and landmark
 * navigation (and /security#vciso deep links) announce the service itself:
 * "Virtual CISO: Security Leadership Without a Full-Time Hire".
 */
export function SecurityIntro({
  id,
  eyebrow,
  title,
  lead,
  align = 'left',
}: {
  /** id of the <h2>; the section's aria-labelledby points here. */
  id: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
}) {
  return (
    <SectionHeading
      id={id}
      eyebrow={eyebrow}
      align={align}
      lead={lead}
      title={
        <>
          <span className="sr-only">{eyebrow}: </span>
          {title}
        </>
      }
    />
  );
}
