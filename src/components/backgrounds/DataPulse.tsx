import type { CSSProperties } from 'react';
import { lengthOf, type Trace } from './geometry';
import { useBg } from './context';

/**
 * CSS for one pulse along a path of `len` px: a dash of `tail` px moving at
 * `speed` px/s, repeating every `cycle` s (rest time = cycle - travel time).
 * Use with className="bg-pulse" and pathLength={1000}.
 */
export function pulseStyle(len: number, { speed = 150, cycle, tail = 34, delay = 0 }: { speed?: number; cycle: number; tail?: number; delay?: number }): CSSProperties {
  const unit = 1000 / Math.max(1, len);
  const dash = tail * unit;
  const c = Math.max(cycle, (len + tail) / speed);
  return {
    ['--from' as string]: dash.toFixed(2),
    ['--to' as string]: (-(speed * c - tail) * unit).toFixed(2),
    strokeDasharray: `${dash.toFixed(2)} 1000000`,
    animationDuration: `${c.toFixed(2)}s`,
    animationDelay: `${(-(delay % c)).toFixed(2)}s`,
  } as CSSProperties;
}

/**
 * Light pulses travelling along traces, entirely in CSS. Each pulse is one
 * short dash whose offset moves linearly at `speed`; after leaving the end of
 * the trace it keeps "travelling" invisibly, which is the rest time before the
 * next run. Nothing renders for reduced motion.
 */
export function DataPulse({
  traces,
  speed = 150,
  every = 7,
  tail = 34,
  seed = 0,
  depth = 0,
  intensity = 1,
}: {
  traces: Trace[];
  /** px per second */
  speed?: number;
  /** Seconds between runs on one trace (at least the travel time). */
  every?: number;
  /** Visible pulse length, px. */
  tail?: number;
  seed?: number;
  depth?: number;
  intensity?: number;
}) {
  const { w, h, animate } = useBg();
  if (!animate || !traces.length) return null;
  return (
    <svg
      className={`bg-layer absolute inset-0 ${depth ? 'bg-parallax-only' : ''}`}
      style={depth ? ({ ['--depth' as string]: depth } as CSSProperties) : undefined}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
    >
      {traces.map((t, i) => {
        const len = Math.max(1, lengthOf(t.pts));
        const travel = (len + tail) / speed;
        const cycle = Math.max(travel * 1.15, every * (0.85 + ((i * 0.37 + seed) % 0.3)));
        const style = pulseStyle(len, { speed, cycle, tail, delay: i * 2.71 + seed * 1.3 });
        return (
          <g key={i}>
            <path d={t.d} pathLength={1000} className="bg-pulse" stroke={`rgba(56,189,248,${(0.16 * intensity).toFixed(3)})`} strokeWidth={4} strokeLinecap="round" style={style} />
            <path d={t.d} pathLength={1000} className="bg-pulse" stroke={`rgba(186,230,253,${(0.7 * intensity).toFixed(3)})`} strokeWidth={1.4} strokeLinecap="round" style={style} />
          </g>
        );
      })}
    </svg>
  );
}
