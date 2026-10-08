import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { STEPS } from '../../data/site';
import { Icon } from '../Icons';
import { MiniCore } from '../MiniCore';
import { SectionHeading } from '../ui';

gsap.registerPlugin(ScrollTrigger);

/* SECTION 7: How we work. Each step lights one more layer of the mini core. */
export function Process() {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-step]', list).forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 62%',
          end: 'bottom 62%',
          onEnter: () => setActive(i),
          onEnterBack: () => setActive(i),
        });
      });
      if (progressRef.current) {
        gsap.fromTo(
          progressRef.current,
          { scaleY: 0 },
          { scaleY: 1, ease: 'none', scrollTrigger: { trigger: list, start: 'top 62%', end: 'bottom 62%', scrub: 0.4 } },
        );
      }
    }, list);
    return () => ctx.revert();
  }, []);

  const lit = STEPS.slice(0, active + 1).map((s) => s.layer);
  const focus = STEPS[active].layer;
  const complete = active === STEPS.length - 1;

  return (
    <section id="process" aria-labelledby="process-title" className="section-pad relative">
      <div className="container-site">
        <SectionHeading
          id="process-title"
          eyebrow="How we work"
          title="Security Is Built Into Every Stage"
          lead="Security is not a final checkpoint. It runs through the full project lifecycle."
        />

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          {/* Mini core: sticky panel on desktop, compact sticky bar on smaller screens */}
          <div className="lg:hidden sticky top-[72px] z-20 -mx-4 border-y border-line bg-ink-950/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
            <div className="flex items-center gap-4" aria-live="polite">
              <MiniCore lit={lit} focus={complete ? undefined : focus} className="h-14 w-14 shrink-0" />
              <p className="text-sm">
                <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Step {active + 1} of {STEPS.length}
                </span>
                <span className="font-medium text-text">{STEPS[active].layerLabel}</span>
              </p>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-32">
              <div className="card relative overflow-hidden p-8">
                <div aria-hidden="true" className="grid-bg absolute inset-0 opacity-60" />
                <MiniCore
                  lit={lit}
                  focus={complete ? undefined : focus}
                  className={`relative mx-auto aspect-square w-full max-w-[380px] transition-[filter] duration-700 ${
                    complete ? 'drop-shadow-[0_0_24px_rgba(57,215,255,0.35)]' : ''
                  }`}
                  title={`Cyber Core, step ${active + 1} of ${STEPS.length}: ${STEPS[active].layerLabel}`}
                />
                <div className="relative mt-6 flex items-center justify-between border-t border-line pt-5 text-sm" aria-live="polite">
                  <span className="text-muted">
                    Step {active + 1} / {STEPS.length}
                  </span>
                  <span className="font-medium text-text">{STEPS[active].layerLabel}</span>
                </div>
                <div className="relative mt-4 grid grid-cols-6 gap-1.5" aria-hidden="true">
                  {STEPS.map((s, i) => (
                    <span key={s.title} className={`h-1 rounded-full transition-colors duration-500 ${i <= active ? 'bg-electric' : 'bg-line'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <ol ref={listRef} className="relative">
            <div aria-hidden="true" className="absolute bottom-6 left-[19px] top-6 w-px bg-line" />
            <div ref={progressRef} aria-hidden="true" className="absolute bottom-6 left-[19px] top-6 w-px origin-top bg-gradient-to-b from-cyan to-primary" />
            {STEPS.map((step, i) => {
              const state = i < active ? 'done' : i === active ? 'active' : 'todo';
              return (
                <li key={step.title} data-step className="relative pb-10 pl-14 last:pb-0 md:pb-12">
                  <span
                    className={`absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold transition-colors duration-500 ${
                      state === 'todo' ? 'border-line bg-ink-900 text-muted' : 'border-electric/60 bg-ink-800 text-cyan'
                    } ${state === 'active' ? 'shadow-[0_0_0_4px_rgba(30,167,255,0.12)]' : ''}`}
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div
                    className={`card p-6 transition-colors duration-500 md:p-7 ${state === 'active' ? 'border-electric/40 bg-card' : ''}`}
                    aria-current={state === 'active' ? 'step' : undefined}
                  >
                    <h3 className="text-[19px] font-semibold tracking-[-0.01em] text-text md:text-[21px]">
                      <span className="sr-only">Step {i + 1}: </span>
                      {step.title}
                    </h3>
                    <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-line bg-ink-900/60 p-4">
                        <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-electric">
                          <Icon name="code" className="h-4 w-4" />
                          Build
                        </dt>
                        <dd className="mt-2 text-[14.5px] leading-relaxed text-[#C9D3E0]">{step.build}</dd>
                      </div>
                      <div className="rounded-xl border border-line bg-ink-900/60 p-4">
                        <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan">
                          <Icon name="shield" className="h-4 w-4" />
                          Secure
                        </dt>
                        <dd className="mt-2 text-[14.5px] leading-relaxed text-[#C9D3E0]">{step.secure}</dd>
                      </div>
                    </dl>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
