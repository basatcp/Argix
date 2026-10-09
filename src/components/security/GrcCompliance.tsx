import { GRC } from '../../data/security';
import { Icon } from '../Icons';
import { ConsultButton } from '../page/ConsultButton';
import { PageSection } from '../page/PageSection';
import { SecurityIntro } from './SecurityIntro';

/**
 * Column template shared by the table's header and rows: framework and scope
 * stacked beside the description at md, three columns from lg.
 */
const COLS = 'md:grid-cols-[minmax(0,230px)_minmax(0,1fr)] lg:grid-cols-[minmax(0,230px)_minmax(0,260px)_minmax(0,1fr)]';

/**
 * 02 GRC & compliance. The "readiness, not certification" statement sits in
 * the intro, beside the lead and the call to action, so it is read before the
 * frameworks. The frameworks are a compact table (framework, scope, what
 * readiness covers), each row naming the work ("SOC 2 Readiness"), never the
 * framework alone, so nothing reads as a badge or a claim.
 */
export function GrcCompliance() {
  return (
    <PageSection id="grc-compliance" labelledBy="grc-title" tone="raised" background="blueprint" className="scroll-mt-[134px] lg:scroll-mt-[60px]">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
        <SecurityIntro id="grc-title" eyebrow={GRC.eyebrow} title={GRC.title} lead={GRC.lead} />
        <div>
          <div data-reveal className="flex gap-4 rounded-card border border-electric/25 bg-electric/[0.04] p-5 md:p-6">
            <span className="icon-tile border-electric/40">
              <Icon name="shield" className="h-5 w-5" />
            </span>
            <p className="text-[14.5px] leading-relaxed text-[#C9D3E0]">
              <strong className="block font-semibold text-text">{GRC.noteTitle}</strong>
              <span className="mt-1.5 block">{GRC.note}</span>
            </p>
          </div>
          <div data-reveal className="mt-5 flex flex-col sm:flex-row">
            <ConsultButton source="security-grc" label="Discuss Compliance Readiness" variant="secondary" />
          </div>
        </div>
      </div>

      <h3 data-reveal className="mt-14 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted lg:mt-16">
        Frameworks we work with
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
      </h3>

      <div className="mt-6 overflow-hidden rounded-card border border-line bg-ink-950/55">
        <div aria-hidden="true" className={`hidden gap-8 border-b border-line bg-ink-900/50 px-8 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted md:grid ${COLS}`}>
          <span>Framework</span>
          <span className="hidden lg:block">Scope</span>
          <span>What the work covers</span>
        </div>
        <dl>
          {GRC.frameworks.map((f) => (
            <div
              key={f.name}
              data-reveal
              className={`grid gap-1 border-b border-line px-5 py-5 transition-colors duration-300 hover:bg-card/50 sm:px-6 md:grid-rows-[auto_1fr] md:gap-x-8 md:gap-y-1.5 md:px-8 md:py-6 lg:grid-rows-none lg:gap-y-0 ${COLS}`}
            >
              <dt className="text-[18px] font-semibold tracking-[-0.01em] text-text">
                {f.name} <span className="font-medium text-[#C9D3E0]">{f.kind}</span>
              </dt>
              <dd className="text-xs font-semibold uppercase tracking-[0.14em] text-muted md:col-start-1 md:row-start-2 lg:col-start-2 lg:row-start-1 lg:pt-[5px]">
                {f.scope}
              </dd>
              <dd className="mt-2 text-[14.5px] leading-relaxed text-muted md:col-start-2 md:row-span-2 md:row-start-1 md:mt-0 lg:col-start-3 lg:row-span-1">
                {f.text}
              </dd>
            </div>
          ))}
        </dl>
        {/* From lg: label in the framework column, list from the scope column on. */}
        <div
          data-reveal
          className="grid gap-4 bg-ink-900/40 px-5 py-6 sm:px-6 md:px-8 lg:grid-cols-[minmax(0,230px)_minmax(0,1fr)] lg:items-center lg:gap-8"
        >
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{GRC.supportTitle}</h3>
          <ul className="grid gap-x-7 gap-y-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,auto)] xl:justify-between xl:gap-x-6">
            {GRC.support.map((s) => (
              <li key={s} className="flex items-start gap-2.5 text-[15px] text-[#D5DDE8]">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageSection>
  );
}
