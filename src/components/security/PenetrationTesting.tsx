import { pad2 } from '../../lib/format';
import { PENTEST } from '../../data/security';
import { Icon } from '../Icons';
import { ConsultButton } from '../page/ConsultButton';
import { PageSection } from '../page/PageSection';
import { SecurityIntro } from './SecurityIntro';

/**
 * 01 Penetration testing: split intro + "What we test" index, then the
 * engagement as a four-step sequence joined by a drawn line.
 */
export function PenetrationTesting() {
  return (
    <PageSection id="penetration-testing" labelledBy="pentest-title" background="secure" className="scroll-mt-[134px] lg:scroll-mt-[60px]">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 xl:gap-20">
        <div>
          <SecurityIntro id="pentest-title" eyebrow={PENTEST.eyebrow} title={PENTEST.title} lead={PENTEST.lead} />
          <p data-reveal className="mt-8 flex max-w-[520px] gap-3 border-t border-line pt-6 text-[14.5px] leading-relaxed text-muted">
            <Icon name="lock" className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
            {PENTEST.note}
          </p>
          <div data-reveal className="mt-7">
            <ConsultButton source="security-pentest" label="Scope a Penetration Test" variant="link" className="min-h-[44px]" />
          </div>
        </div>

        {/* lg:pt-1.5 puts this label on the eyebrow's line (the eyebrow sits in a taller line box). */}
        <div className="lg:pt-1.5">
          <h3 data-reveal className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            What we test
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
          </h3>
          <ul className="mt-5 grid gap-3">
            {PENTEST.targets.map((t) => (
              <li
                key={t.title}
                data-reveal
                className="card group flex items-start gap-5 p-5 transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] hover:border-electric/45 hover:bg-card md:items-center md:p-6 lg:items-start xl:items-center"
              >
                <span className="icon-tile transition-colors duration-300 group-hover:border-electric/50">
                  <Icon name={t.icon} className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                </span>
                {/* Title beside text where the column is wide (md, xl+); stacked in the narrower split column at lg. */}
                <div className="min-w-0 md:grid md:flex-1 md:grid-cols-[minmax(0,190px)_minmax(0,1fr)] md:items-center md:gap-6 lg:block xl:grid">
                  <p className="text-[17px] font-semibold tracking-[-0.01em] text-text">{t.title}</p>
                  <p className="mt-1 text-[14.5px] leading-relaxed text-muted md:mt-0 lg:mt-1 xl:mt-0">{t.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-16 lg:mt-24">
        <h3 data-reveal className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          How a test runs
          <span aria-hidden="true" className="h-px flex-1 bg-line" />
        </h3>
        <ol className="mt-8 grid gap-0 md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-4">
          {PENTEST.steps.map((s, i) => {
            const last = i === PENTEST.steps.length - 1;
            return (
              <li key={s.title} data-reveal className="relative pb-9 pl-16 last:pb-0 md:pb-0 md:pl-0">
                {/* Connector: vertical on phones, horizontal from 1024px */}
                {!last && <span aria-hidden="true" className="absolute bottom-0 left-5 top-12 w-px bg-gradient-to-b from-electric/50 to-line md:hidden" />}
                {!last && (
                  <span
                    aria-hidden="true"
                    data-draw
                    className="absolute left-14 right-[-1.5rem] top-5 hidden h-px origin-left bg-gradient-to-r from-electric/60 to-line lg:block"
                  />
                )}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-xl border border-electric/50 bg-ink-800 text-sm font-semibold tabular-nums text-cyan shadow-[0_0_0_4px_rgba(30,167,255,0.07)] md:relative"
                >
                  {pad2(i + 1)}
                </span>
                <p className="pt-2 text-[18px] font-semibold tracking-[-0.01em] text-text md:mt-5 md:pt-0">
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.title}
                </p>
                <p className="mt-2 max-w-[320px] text-[14.5px] leading-relaxed text-muted">{s.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </PageSection>
  );
}
