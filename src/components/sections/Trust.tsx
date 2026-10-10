import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { INDUSTRIES, STATS } from '../../data/site';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import { SectionHeading } from '../ui';
import { SectionBackground } from '../backgrounds/SectionBackground';
import { IndustryCard } from '../industries/IndustryCard';

gsap.registerPlugin(ScrollTrigger);

/* SECTION 5: Trust / stats */
export function Stats() {
  const ref = useRef<HTMLDListElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const target = Number(el.dataset.count);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.v));
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section aria-labelledby="stats-title" className="section-pad relative isolate overflow-hidden">
      <div aria-hidden="true" className="grid-bg absolute inset-0 opacity-50" />
      <SectionBackground variant="metrics" />
      <div className="container-site relative">
        <SectionHeading id="stats-title" eyebrow="Track record" title="Built for Software and Security That Matters" />
        {/* TODO: Replace with verified client metrics. Values in STATS are placeholders. */}
        <dl ref={ref} className="mt-14 grid grid-cols-2 overflow-hidden rounded-card border border-line bg-card/50 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              data-reveal
              className={`flex flex-col-reverse justify-end gap-2 p-6 md:p-9 ${i % 2 === 1 ? 'border-l border-line' : ''} ${
                i >= 2 ? 'border-t border-line lg:border-t-0' : ''
              } ${i === 2 ? 'lg:border-l' : ''}`}
            >
              <dt className="text-sm leading-snug text-muted md:text-[15px]">{s.label}</dt>
              {/* Shown between number and label (flex-col-reverse); draws in once on entry. */}
              <span aria-hidden="true" data-draw className="my-1 block h-px w-10 origin-left bg-gradient-to-r from-electric to-transparent" />
              <dd className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-text md:text-[56px]">
                <span data-count={s.value}>{s.value}</span>
                <span className="text-electric">{s.suffix}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* SECTION 6: Industries */
export function Industries() {
  return (
    <section id="industries" aria-labelledby="industries-title" className="section-pad relative isolate bg-ink-900">
      <SectionBackground variant="industries" blend="both" />
      <div aria-hidden="true" className="glow-divider absolute inset-x-0 top-0 opacity-50" />
      <div className="container-site">
        <SectionHeading
          id="industries-title"
          eyebrow="Industries"
          title="Built for Industries Where Security Matters"
          lead="Each sector has different rules, integrations and data risks."
        />
        <ul className="mt-14 grid gap-5 md:grid-cols-6">
          {INDUSTRIES.map((ind, i) => (
            <li key={ind.title} data-reveal className={i < 2 ? 'md:col-span-3' : 'md:col-span-2'}>
              <IndustryCard industry={ind} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
