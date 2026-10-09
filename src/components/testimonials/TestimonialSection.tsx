import { TESTIMONIALS } from '../../data/testimonials';
import { SectionBackground } from '../backgrounds/SectionBackground';
import { SectionHeading } from '../ui';
import { TestimonialCard } from './TestimonialCard';

/**
 * Homepage "Client Perspective" section: three cards (3 / 2 / 1 columns), no
 * carousel. While the data still contains placeholders, a visible note says so;
 * see src/data/testimonials.ts.
 */
export function TestimonialSection() {
  const hasPlaceholders = TESTIMONIALS.some((t) => t.placeholder);
  return (
    <section id="testimonials" aria-labelledby="testimonials-title" className="section-pad relative isolate bg-ink-900">
      <SectionBackground variant="testimonials" blend="both" />
      <div aria-hidden="true" className="glow-divider absolute inset-x-0 top-0 opacity-50" />
      <div className="container-site">
        <SectionHeading
          id="testimonials-title"
          eyebrow="Client Perspective"
          title="Trusted by Teams Building and Protecting Critical Systems"
          lead="See how organizations describe their experience working with our development and security teams."
        />
        <ul data-bg-anchor="cards" className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <li
              key={i}
              data-reveal
              className={i === 2 ? 'md:col-span-2 md:mx-auto md:w-[calc(50%-10px)] lg:col-span-1 lg:mx-0 lg:w-auto' : undefined}
            >
              <TestimonialCard t={t} />
            </li>
          ))}
        </ul>
        {hasPlaceholders && (
          <p className="mt-8 text-center text-[13px] text-muted/80">Sample testimonials shown for layout. Verified client quotes will replace them before launch.</p>
        )}
      </div>
    </section>
  );
}
