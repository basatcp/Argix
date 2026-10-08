import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { INDUSTRIES, STATS } from '../../data/site';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import { Icon } from '../Icons';
import { SectionHeading } from '../ui';

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
    <section aria-labelledby="stats-title" className="section-pad relative overflow-hidden">
      <div aria-hidden="true" className="grid-bg absolute inset-0 opacity-50" />
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
    <section id="industries" aria-labelledby="industries-title" className="section-pad relative bg-ink-900">
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
              <article className="card group relative flex h-full min-h-[240px] flex-col overflow-hidden p-7 transition duration-300 hover:-translate-y-1.5 hover:border-primary/70 hover:shadow-[0_24px_60px_-30px_rgba(59,130,246,0.6)] md:p-8">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(30,167,255,0.16),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <span className="icon-tile h-12 w-12">
                  <Icon name={ind.icon} className="h-6 w-6 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:rotate-[-6deg]" />
                </span>
                <h3 className="mt-auto pt-10 text-[22px] font-semibold tracking-[-0.015em] text-text">{ind.title}</h3>
                <p className="mt-2.5 max-w-[440px] text-[15px] leading-relaxed text-muted">{ind.text}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
