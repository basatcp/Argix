import type { ReactNode } from 'react';
import { SectionBackground } from '../backgrounds/SectionBackground';
import { Icon } from '../Icons';
import { ConsultButton } from './ConsultButton';

/**
 * Closing call to action for inner pages: the consultation card's styling, with
 * the background's circuit routes converging on it. The button opens the shared
 * consultation popup.
 */
export function FinalCTA({
  id,
  eyebrow = 'Next step',
  heading,
  text,
  cta = 'Book a Free Consultation',
  source,
  secondary,
}: {
  id: string;
  eyebrow?: string;
  heading: ReactNode;
  text?: ReactNode;
  cta?: string;
  source: string;
  secondary?: { label: string; href: string };
}) {
  return (
    <section aria-labelledby={id} className="section-pad relative isolate">
      <SectionBackground variant="cta" blend="top" />
      <div className="container-site">
        <div
          data-reveal
          data-bg-anchor="cta"
          className="relative mx-auto max-w-[920px] overflow-hidden rounded-[28px] border border-[rgba(100,180,255,0.18)] bg-[rgba(11,22,38,0.84)] px-6 py-12 text-center shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md sm:px-12 md:py-16"
        >
          <div aria-hidden="true" className="glow-divider absolute inset-x-10 top-0 opacity-60" />
          <p className="eyebrow justify-center">
            <span className="h-px w-6 bg-cyan" aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 id={id} className="h-section mx-auto mt-4 max-w-[680px]">
            {heading}
          </h2>
          {text && <p className="lead mx-auto mt-5 max-w-[560px]">{text}</p>}
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <ConsultButton source={source} label={cta} />
            {secondary && (
              <a href={secondary.href} className="btn-secondary">
                {secondary.label}
              </a>
            )}
          </div>
          <p className="mt-5 flex items-center justify-center gap-2 text-sm text-muted">
            <Icon name="clock" className="h-4 w-4 text-cyan" />
            30-minute consultation · No obligation
          </p>
        </div>
      </div>
    </section>
  );
}
