import { pad2 } from '../../lib/format';
import type { ProcessStage } from '../../data/process';
import { hexagon } from '../backgrounds/geometry';
import { Icon } from '../Icons';

/** Where a stage is relative to the reader: not reached yet, the one being read, or already passed. */
export type StageState = 'future' | 'active' | 'passed';

const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]';
const NODE_HEX = hexagon(17, 17, 14.5);

/**
 * One stage on the process timeline: a hexagonal node on the spine, a short
 * tap from the node into the card, and the card itself (number, title, what
 * the stage produces, and the Build / Secure work as two tracks side by side).
 *
 * The two tracks share one divider; when the stage is reached an electric
 * (Build) and a cyan (Secure) rule draw across it and the details rise into
 * place. Future stages dim only their chrome (borders, node, icon, markers);
 * their text drops to the muted colour, never below it.
 */
export function StageCard({ stage, index, total, state }: { stage: ProcessStage; index: number; total: number; state: StageState }) {
  const lit = state !== 'future';
  const active = state === 'active';
  const titleId = `${stage.id}-title`;

  return (
    <li
      id={stage.id}
      tabIndex={-1}
      data-stage
      data-state={state}
      className="relative scroll-mt-28 pb-5 pl-9 focus:outline-none last:pb-0 md:pb-10 md:pl-[76px]"
    >
      {/* Node on the spine (centre 12px / 17px from the left; level with the stage label on phones, the icon tile from md) */}
      <span data-node aria-hidden="true" className="absolute left-0 top-4 h-6 w-6 md:top-[37px] md:h-[34px] md:w-[34px]">
        <span
          className={`absolute -inset-3 rounded-full bg-[radial-gradient(circle,rgba(57,215,255,0.32)_0%,rgba(57,215,255,0)_68%)] transition-opacity duration-700 ${EASE} ${
            active ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <span data-burst className="absolute inset-0 rounded-full border border-cyan/70 opacity-0" />
        <svg viewBox="0 0 34 34" className="relative block h-full w-full" fill="none">
          <path
            d={NODE_HEX}
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
            className={`transition-colors duration-500 ${
              active ? 'fill-[#0B2036] stroke-cyan' : lit ? 'fill-ink-800 stroke-electric/60' : 'fill-ink-900 stroke-[rgba(90,150,220,0.4)]'
            }`}
          />
          <circle
            cx={17}
            cy={17}
            r={active ? 4 : 3.2}
            className={`transition-colors duration-500 ${active ? 'fill-[#CFF4FF]' : lit ? 'fill-electric' : 'fill-[rgba(90,150,220,0.5)]'}`}
          />
        </svg>
      </span>

      {/* Tap from the node into the card; draws in when the stage is reached */}
      <span aria-hidden="true" className="absolute left-7 top-7 h-px w-2 overflow-hidden bg-line md:left-[38px] md:top-[54px] md:w-[38px]">
        <span
          className={`block h-full w-full origin-left bg-gradient-to-r from-cyan to-electric/50 transition-transform duration-700 ${EASE} ${
            lit ? 'scale-x-100 delay-150' : 'scale-x-0'
          }`}
        />
      </span>

      <article
        data-reveal
        aria-labelledby={titleId}
        className={`card relative overflow-hidden p-5 transition-[border-color,background-color,box-shadow] duration-500 md:p-8 ${
          active
            ? 'border-electric/45 bg-card shadow-[0_30px_80px_-44px_rgba(30,167,255,0.6)]'
            : lit
              ? 'border-electric/20 bg-card/70'
              : 'bg-card/45'
        }`}
      >
        <div
          aria-hidden="true"
          className={`glow-divider absolute inset-x-8 top-0 transition-opacity duration-700 ${active ? 'opacity-100' : lit ? 'opacity-30' : 'opacity-0'}`}
        />

        <header className="flex items-start gap-4">
          <span className={`icon-tile hidden transition-colors duration-500 md:flex ${active ? 'border-electric/50' : lit ? '' : 'text-muted'}`}>
            <Icon name={stage.icon} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              <span className={`transition-colors duration-500 ${lit ? 'text-electric' : ''}`}>Stage {pad2(index + 1)}</span>
              <span aria-hidden="true"> / {pad2(total)}</span>
            </p>
            <h3 id={titleId} className="mt-1.5 text-[20px] font-semibold leading-snug tracking-[-0.015em] text-text md:text-[24px]">
              {stage.title}
            </h3>
          </div>
        </header>

        <p className="mt-4 max-w-[600px] text-[15px] leading-relaxed text-muted [text-wrap:pretty] md:mt-5 md:text-[15.5px]">{stage.summary}</p>

        <div className="mt-6 grid sm:grid-cols-2 md:mt-7">
          <Track kind="build" items={stage.build} id={`${stage.id}-build`} state={state} />
          <Track kind="secure" items={stage.secure} id={`${stage.id}-secure`} state={state} />
        </div>
      </article>
    </li>
  );
}

function Track({ kind, items, id, state }: { kind: 'build' | 'secure'; items: string[]; id: string; state: StageState }) {
  const lit = state !== 'future';
  const build = kind === 'build';
  return (
    <div className={`relative border-t border-line pt-5 ${build ? 'sm:pr-6' : 'mt-5 sm:mt-0 sm:border-l sm:pl-6'}`}>
      {/* Track rule: draws across the shared divider when the stage is reached (Build first, then Secure) */}
      <span
        aria-hidden="true"
        className={`absolute -top-px left-0 h-px w-full origin-left bg-gradient-to-r transition-[transform,opacity] duration-700 ${EASE} ${
          build ? 'from-electric to-electric/25 delay-150' : 'from-cyan to-cyan/25 delay-300'
        } ${lit ? 'scale-x-100' : 'scale-x-0'} ${state === 'active' ? 'opacity-100' : 'opacity-50'}`}
      />
      {/* Where the tracks split: the hairline between the columns lights on the active stage */}
      {!build && (
        <span
          aria-hidden="true"
          className={`absolute -left-px top-0 hidden h-full w-px origin-top bg-gradient-to-b from-cyan/60 to-transparent transition-transform duration-700 ${EASE} sm:block ${
            state === 'active' ? 'scale-y-100 delay-300' : 'scale-y-0'
          }`}
        />
      )}
      <div className={`transition-transform duration-700 ${EASE} ${build ? '' : 'md:delay-100'} ${lit ? '' : 'md:translate-y-3'}`}>
        <h4
          id={id}
          className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors duration-700 ${
            lit ? (build ? 'text-electric' : 'text-cyan') : 'text-muted'
          }`}
        >
          <Icon name={build ? 'code' : 'shield'} className="h-4 w-4" />
          {build ? 'Build' : 'Secure'}
        </h4>
        <ul aria-labelledby={id} className="mt-3.5 space-y-2.5">
          {items.map((item) => (
            <li
              key={item}
              className={`flex items-center gap-2 text-[14.5px] leading-snug transition-colors duration-700 ${lit ? 'text-[#D5DDE8]' : 'text-muted'}`}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">
                {build ? (
                  <span className={`h-1.5 w-1.5 rotate-45 transition-colors duration-500 ${lit ? 'bg-electric' : 'bg-electric/40'}`} />
                ) : (
                  <Icon name="check" className={`h-4 w-4 transition-colors duration-500 ${lit ? 'text-cyan' : 'text-cyan/40'}`} />
                )}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
