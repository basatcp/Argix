import { TESTIMONIALS } from '../../data/testimonials';
import { PageSection } from '../page/PageSection';
import { SectionHeading } from '../ui';
import { TestimonialCard } from './TestimonialCard';

/**
 * Homepage "Client Perspective" section: cards in 3 / 2 / 1 columns, no
 * carousel. On tablets an odd last card is centred under the others. While the
 * data still contains placeholders, a visible note says so; see
 * src/data/testimonials.ts.
 */
export function TestimonialSection() {
  const hasPlaceholders = TESTIMONIALS.some((t) => t.placeholder);
  const oddLast = (i: number) => i === TESTIMONIALS.length - 1 && TESTIMONIALS.length % 2 === 1;
  return (
    <PageSection id="testimonials" labelledBy="testimonials-title" tone="raised" background="testimonials">
      <SectionHeading
        id="testimonials-title"
        eyebrow="Client Perspective"
        title="Trusted by Teams Building and Protecting Critical Systems"
        lead="See how organizations describe their experience working with our development and security teams."
      />
      <ul data-bg-anchor="cards" className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <li
            key={`${t.name}-${t.company}-${i}`}
            data-reveal
            className={oddLast(i) ? 'md:col-span-2 md:mx-auto md:w-[calc(50%-10px)] lg:col-span-1 lg:mx-0 lg:w-auto' : undefined}
          >
            <TestimonialCard t={t} />
          </li>
        ))}
      </ul>
      {hasPlaceholders && (
        <p className="mt-8 text-center text-[13.5px] text-muted">Sample testimonials shown for layout. Verified client quotes will replace them before launch.</p>
      )}
    </PageSection>
  );
}
