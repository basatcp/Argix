import { SOC } from '../../data/security';
import { Icon } from '../Icons';
import { Diagram, INK, Pulse } from '../page/Diagram';
import { PageSection } from '../page/PageSection';
import { SecurityIntro } from './SecurityIntro';

/**
 * The monitoring line behind the flow's markers (desktop): it runs through all
 * five stages and fades out past the last one ("ongoing"), with two pulses
 * moving along it. The opaque markers sit on top, so pulses read as passing
 * from stage to stage.
 */
function FlowLine() {
  return (
    <Diagram w={1200} h={12}>
      {(animate) => (
        <>
          <defs>
            <linearGradient id="soc-flow-line" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="rgb(59,130,246)" stopOpacity="0.45" />
              <stop offset="0.82" stopColor="rgb(56,189,248)" stopOpacity="0.4" />
              <stop offset="1" stopColor="rgb(56,189,248)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 6H1200" stroke="url(#soc-flow-line)" strokeWidth={1} pathLength={1} className="d-draw" />
          <path d="M0 6H1200" stroke={INK.faint} strokeWidth={1} strokeDasharray="1 7" className="d-reveal" />
          {animate && (
            <>
              <Pulse pts={[[0, 6], [1200, 6]]} cycle={11} speed={150} tail={60} />
              <Pulse pts={[[0, 6], [1200, 6]]} cycle={11} delay={5.5} speed={150} tail={40} width={1.2} />
            </>
          )}
        </>
      )}
    </Diagram>
  );
}

/**
 * 04 SOC monitoring: the five activities as one monitoring flow, left to right
 * on desktop and top to bottom on smaller screens. No SLAs or response times.
 */
export function SocMonitoring() {
  return (
    <PageSection id="soc-monitoring" labelledBy="soc-title" tone="raised" background="monitor" className="lg:!scroll-mt-[60px]">
      <SecurityIntro id="soc-title" eyebrow={SOC.eyebrow} title={SOC.title} lead={SOC.lead} align="center" />

      <div className="relative mt-12 overflow-hidden rounded-[28px] border border-[rgba(100,180,255,0.16)] bg-ink-950/60 px-5 py-8 shadow-[0_40px_100px_-50px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-sm sm:px-8 md:px-10 md:py-12 lg:mt-16 lg:px-12 lg:py-14">
        <div aria-hidden="true" className="glow-divider absolute inset-x-10 top-0 opacity-50" />
        <div aria-hidden="true" className="grid-bg absolute inset-0 opacity-40" />

        <div className="relative">
          <div aria-hidden="true" className="absolute inset-x-0 top-6 hidden -translate-y-1/2 lg:block">
            <FlowLine />
          </div>
          <ol className="relative grid gap-0 lg:grid-cols-5 lg:gap-6">
            {SOC.flow.map((s, i) => {
              const last = i === SOC.flow.length - 1;
              return (
                <li key={s.title} data-reveal className="group relative pb-8 pl-[68px] last:pb-0 lg:pb-0 lg:pl-0">
                  {!last && <span aria-hidden="true" className="absolute bottom-0 left-6 top-14 w-px bg-gradient-to-b from-electric/45 to-line lg:hidden" />}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-xl border border-electric/40 bg-ink-800 text-cyan shadow-[0_0_0_5px_rgba(5,11,20,0.9)] transition-colors duration-300 group-hover:border-cyan/70 lg:relative"
                  >
                    <Icon name={s.icon} className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  </span>
                  <p aria-hidden="true" className="pt-0.5 text-[11px] font-semibold uppercase tabular-nums tracking-[0.16em] text-electric lg:mt-6 lg:pt-0">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-1.5 text-[18px] font-semibold tracking-[-0.01em] text-text">{s.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted lg:max-w-[220px]">{s.text}</p>
                </li>
              );
            })}
          </ol>
        </div>

        <p className="relative mt-10 flex items-start justify-center gap-2.5 border-t border-line pt-6 text-[14px] leading-relaxed text-muted lg:mt-12 lg:text-center">
          <Icon name="fileText" className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
          {SOC.note}
        </p>
      </div>
    </PageSection>
  );
}
