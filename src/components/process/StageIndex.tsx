import type { Ref } from 'react';
import { pad, type ProcessStage } from '../../data/process';
import { Icon } from '../Icons';

/**
 * Sticky companion to the process timeline (desktop): which stage is being
 * read, a progress line that follows the scroll, and an index of all stages
 * as in-page links. The readout reserves two lines for the stage title so the
 * card keeps the same height for every stage.
 */
export function StageIndex({
  stages,
  active,
  reduced,
  barRef,
}: {
  stages: ProcessStage[];
  /** Stage being read; -1 before the first one is reached. */
  active: number;
  reduced: boolean;
  /** Progress line, scaled by the timeline as the page scrolls. */
  barRef: Ref<HTMLSpanElement>;
}) {
  const shown = Math.max(0, active);
  const last = stages.length - 1;
  const complete = active === last;

  return (
    <nav aria-label="Process stages" className="card relative overflow-hidden p-6 xl:p-7">
      <div aria-hidden="true" className="grid-bg absolute inset-0 opacity-50" />
      <div aria-hidden="true" className="glow-divider absolute inset-x-8 top-0 opacity-50" />

      <div className="relative px-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{active < 0 ? 'First stage' : complete ? 'Final stage' : 'Current stage'}</p>
        <p className="mt-3 flex items-baseline gap-2">
          <span className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-text tabular-nums">{pad(shown + 1)}</span>
          <span className="text-sm font-medium text-muted tabular-nums">/ {pad(stages.length)}</span>
        </p>
        <p className="mt-2.5 min-h-[2.75em] text-[16px] font-medium leading-snug text-[#D5DDE8]">{stages[shown].title}</p>
      </div>

      <div aria-hidden="true" className="relative mt-4 h-px overflow-hidden bg-line">
        <span
          ref={barRef}
          className="absolute inset-0 origin-left bg-gradient-to-r from-cyan via-electric to-primary"
          style={{ transform: reduced ? 'none' : 'scaleX(0)' }}
        />
      </div>

      <ol className="relative mt-4 space-y-0.5">
        {stages.map((s, i) => {
          const state = i === active ? 'active' : i < active ? 'passed' : 'future';
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={state === 'active' ? 'step' : undefined}
                className={`group relative flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2 text-[14px] leading-snug transition-colors duration-300 ${
                  state === 'active'
                    ? 'bg-electric/[0.08] text-text'
                    : state === 'passed'
                      ? 'text-[#C9D3E0] hover:bg-white/[0.03] hover:text-text'
                      : 'text-muted hover:bg-white/[0.03] hover:text-text'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-2.5 left-0 w-[2px] rounded-full bg-cyan transition-opacity duration-300 ${state === 'active' ? 'opacity-100' : 'opacity-0'}`}
                />
                <span
                  className={`w-6 shrink-0 text-xs font-semibold tabular-nums transition-colors duration-300 ${
                    state === 'future' ? 'text-muted' : 'text-electric'
                  }`}
                >
                  {pad(i + 1)}
                </span>
                <span className="min-w-0 flex-1">{s.title}</span>
                {/* State marker in a fixed 16px box, so a title wraps the same way in every state */}
                <span aria-hidden="true" className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {state === 'passed' ? (
                    <Icon name="check" className="h-4 w-4 text-electric/80" />
                  ) : (
                    <span
                      className={`h-1.5 w-1.5 rotate-45 transition-colors duration-300 ${
                        state === 'active' ? 'bg-cyan shadow-[0_0_10px_rgba(57,215,255,0.8)]' : 'border border-[rgba(90,150,220,0.45)]'
                      }`}
                    />
                  )}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
