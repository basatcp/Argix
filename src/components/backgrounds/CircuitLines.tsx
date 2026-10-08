import type { CSSProperties } from 'react';
import type { Trace } from './geometry';
import { useBg } from './context';

/**
 * Static circuit traces (one SVG, painted once). With `draw`, traces draw in
 * the first time the section enters the viewport.
 */
export function CircuitLines({
  traces,
  opacity = 0.14,
  width = 1,
  draw = false,
  depth = 0,
  dash,
  color = '59,130,246',
}: {
  traces: Trace[];
  opacity?: number;
  width?: number;
  draw?: boolean;
  depth?: number;
  dash?: string;
  color?: string;
}) {
  const { w, h, env } = useBg();
  const drawIn = draw && !env.reduced && env.tier !== 'mobile';
  return (
    <svg
      className={`bg-layer absolute inset-0 ${depth ? 'bg-parallax-only' : ''}`}
      style={depth ? ({ ['--depth' as string]: depth } as CSSProperties) : undefined}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
    >
      {traces.map((t, i) => (
        <path
          key={i}
          d={t.d}
          stroke={`rgba(${color},${opacity})`}
          strokeWidth={width}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={dash}
          {...(drawIn ? { pathLength: 1, className: 'bg-draw', style: { ['--d' as string]: `${(i * 0.09).toFixed(2)}s` } } : {})}
        />
      ))}
    </svg>
  );
}
