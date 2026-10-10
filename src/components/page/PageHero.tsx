import { useLayoutEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import { hasNavigated } from '../../router';
import { SectionBackground } from '../backgrounds/SectionBackground';
import type { Variant } from '../backgrounds/variants';
import { Icon } from '../Icons';
import { Breadcrumbs } from './Breadcrumbs';
import { ConsultButton } from './ConsultButton';

/**
 * Hero for inner pages. Same language as the homepage hero (gradient field,
 * eyebrow, display heading, primary + secondary CTA, entrance motion) but
 * lighter: shorter, a smaller heading, and a page-specific technical diagram
 * instead of the Cyber Core, which stays the homepage's signature moment.
 *
 * The background `variant` (one of the `page-*` variants) routes its lines into
 * the diagram, which is marked data-bg-anchor="visual". It sits beside the
 * copy from 768px (smaller on tablets); on phones it is hidden and the
 * background alone carries the hero.
 */
export function PageHero({
  id,
  crumb,
  eyebrow,
  title,
  lead,
  variant,
  primary = { label: 'Book a Free Consultation', source: 'page-hero' },
  secondary,
  visual,
  aside,
  note = '30-minute consultation · No obligation',
}: {
  /** id of the <h1>. */
  id: string;
  /** Breadcrumb label for this page. */
  crumb: string;
  eyebrow: string;
  title: ReactNode;
  lead: ReactNode;
  variant: Variant;
  primary?: { label: string; source: string } | null;
  secondary?: { label: string; href: string };
  /** Decorative technical diagram (aria-hidden), shown beside the copy from 768px up. */
  visual?: ReactNode;
  /** Instead of a diagram: real content for the right column (e.g. quick links). Shown on every screen size. */
  aside?: ReactNode;
  note?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    // First load only: after in-app navigation the page transition already brings the page in.
    if (prefersReducedMotion() || hasNavigated()) return;
    const ctx = gsap.context(() => {
      // The shared reveal values: headings rise 24px, copy 14px, the rest 20px; 650ms, 80ms apart.
      gsap.from('[data-hero]', {
        opacity: 0,
        y: (_: number, el: Element) => (el.tagName === 'H1' ? 24 : el.tagName === 'P' ? 14 : 20),
        duration: 0.65,
        ease: 'power4.out',
        stagger: 0.08,
        delay: 0.05,
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} aria-labelledby={id} className="page-hero relative isolate overflow-hidden pb-16 pt-28 md:pb-20 md:pt-32 lg:pb-24 lg:pt-36">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_70%_at_72%_38%,#0A1E38_0%,#07111F_48%,#050B14_100%)]" />
      <div aria-hidden="true" className="grid-bg absolute inset-0 -z-10 opacity-40" />
      <SectionBackground variant={variant} />
      <div aria-hidden="true" className="glow-divider absolute inset-x-0 bottom-0 opacity-70" />

      {/* Copy starts at the same height on every page; the diagram is centred beside it. A diagram
          sits beside the copy from 768px (smaller on tablets); an aside stacks until 1024px. */}
      <div
        className={`container-site grid items-start gap-12 ${
          visual
            ? 'md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-8 lg:gap-12 xl:gap-16'
            : aside
              ? 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12 xl:gap-16'
              : ''
        }`}
      >
        <div data-bg-anchor="copy" className="relative max-w-[660px]">
          <div data-hero>
            <Breadcrumbs current={crumb} />
          </div>
          <p data-hero className="eyebrow mt-8">
            <span className="h-px w-6 bg-cyan" aria-hidden="true" />
            {eyebrow}
          </p>
          <h1
            id={id}
            data-hero
            tabIndex={-1}
            className={`mt-5 text-balance text-[38px] font-semibold leading-[1.06] tracking-[-0.032em] text-text sm:text-[46px] lg:text-[58px] xl:text-[62px] ${
              visual ? 'md:text-[44px]' : 'md:text-[52px]'
            }`}
          >
            {title}
          </h1>
          <p data-hero className="lead mt-6 max-w-[580px] md:!text-[18px]">
            {lead}
          </p>
          {(primary || secondary) && (
            <div data-hero className={`mt-9 flex flex-col gap-3 sm:flex-row ${visual ? 'md:flex-col lg:flex-row' : ''}`}>
              {primary && <ConsultButton source={primary.source} label={primary.label} />}
              {secondary && (
                <a href={secondary.href} className="btn-secondary">
                  {secondary.label}
                </a>
              )}
            </div>
          )}
          {primary && note && (
            <p data-hero className="mt-5 flex items-center gap-2 text-sm text-muted">
              <Icon name="check" className="h-4 w-4 text-cyan" />
              {note}
            </p>
          )}
        </div>

        {visual && (
          <div data-hero data-bg-anchor="visual" aria-hidden="true" className="relative mx-auto hidden w-full max-w-[320px] self-center md:block lg:max-w-[460px]">
            {visual}
          </div>
        )}
        {aside && !visual && (
          <div data-hero data-bg-anchor="visual" className="relative w-full lg:self-center">
            {aside}
          </div>
        )}
      </div>
    </section>
  );
}
