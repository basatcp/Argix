import { SECURE_DEV } from '../../data/security';
import { Icon } from '../Icons';
import { PageSection } from '../page/PageSection';
import { SecurityIntro } from './SecurityIntro';

/**
 * 06 Secure development ("Security Starts Before Launch"): the six practices
 * as one delivery flow in two lanes. Design and Code on the build side, Build
 * and Release on the secure side; each practice sits on its stage. The
 * "split" background hands flows from the build card into the security rings
 * on the secure card.
 */
export function SecureDevelopment() {
  return (
    <PageSection id="secure-development" labelledBy="secure-dev-title" tone="raised" background="split" className="scroll-mt-[134px] lg:scroll-mt-[60px]">
      {/* Split header: the heading on the left, the lead and the process link on the right. */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
        <SecurityIntro id="secure-dev-title" eyebrow={SECURE_DEV.eyebrow} title={SECURE_DEV.title} />
        <div className="lg:pb-1">
          <p data-reveal className="lead">
            {SECURE_DEV.lead}
          </p>
          <a
            data-reveal
            href="/process"
            className="group mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded text-[15px] font-medium text-electric transition-colors hover:text-cyan"
          >
            See how security runs through our process
            <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      <div className="relative mt-12 grid gap-5 lg:mt-14 lg:grid-cols-2">
        {SECURE_DEV.lanes.map((lane) => {
          const build = lane.key === 'build';
          return (
            <article
              key={lane.key}
              data-reveal
              data-bg-anchor={build ? 'build-card' : 'secure-card'}
              aria-labelledby={`sd-${lane.key}`}
              className="card relative p-5 sm:p-7 md:p-10"
            >
              <div className="flex items-center gap-4">
                <span className="icon-tile">
                  <Icon name={lane.icon} className="h-5 w-5" />
                </span>
                <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${build ? 'text-electric' : 'text-cyan'}`}>{lane.label}</p>
              </div>
              <h3 id={`sd-${lane.key}`} className="mt-6 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-text md:text-[30px]">
                {lane.title}
              </h3>

              {/* The lane: stages in order on a rail, practices as an index under each stage. */}
              <ol className="relative mt-8">
                {lane.stages.map((s, si) => {
                  const last = si === lane.stages.length - 1;
                  return (
                    <li key={s.stage} className={`relative pl-8 ${last ? '' : 'pb-7'}`}>
                      {!last && <span aria-hidden="true" className="absolute bottom-0 left-[5px] top-5 w-px bg-gradient-to-b from-electric/50 to-line" />}
                      <span
                        aria-hidden="true"
                        className={`absolute left-0 top-[5px] h-[11px] w-[11px] rotate-45 rounded-[2px] border bg-ink-900 ${build ? 'border-electric' : 'border-cyan'}`}
                      />
                      <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${build ? 'text-electric' : 'text-cyan'}`}>{s.stage}</p>
                      <dl className="mt-3 divide-y divide-line border-y border-line">
                        {s.practices.map((p) => (
                          <div key={p.title} className="py-4">
                            <dt className="text-[16.5px] font-semibold tracking-[-0.005em] text-text">{p.title}</dt>
                            <dd className="mt-1 text-[14.5px] leading-relaxed text-muted">{p.text}</dd>
                          </div>
                        ))}
                      </dl>
                    </li>
                  );
                })}
              </ol>
            </article>
          );
        })}
      </div>
    </PageSection>
  );
}
