import type { CSSProperties } from 'react';
import { hexagon, type Pt } from './geometry';
import { useBg } from './context';

/**
 * Concentric security rings: faint circles, a tick ring, a hexagonal perimeter,
 * an optional slow scanning arc (compositor-only rotation) and an optional
 * controlled pulse ring that expands every few seconds.
 */
export function SecurityRings({
  c,
  r,
  opacity = 0.16,
  scan = true,
  pulse = true,
  perimeter = true,
  ticks = true,
  scanPeriod = 22,
  pulseEvery = 6.5,
}: {
  c: Pt;
  r: number;
  opacity?: number;
  scan?: boolean;
  pulse?: boolean;
  perimeter?: boolean;
  ticks?: boolean;
  scanPeriod?: number;
  pulseEvery?: number;
}) {
  const { w, h, animate } = useBg();
  const [cx, cy] = c;
  const stroke = (a: number) => `rgba(59,130,246,${(opacity * a).toFixed(3)})`;
  const tickCount = 60;
  const ticksD = ticks
    ? Array.from({ length: tickCount }, (_, i) => {
        const a = (i / tickCount) * Math.PI * 2;
        const r0 = r * 0.86;
        const r1 = r * (i % 5 === 0 ? 0.9 : 0.88);
        return `M${(cx + Math.cos(a) * r0).toFixed(1)} ${(cy + Math.sin(a) * r0).toFixed(1)}L${(cx + Math.cos(a) * r1).toFixed(1)} ${(cy + Math.sin(a) * r1).toFixed(1)}`;
      }).join('')
    : '';
  // Scanning arc: 70° of the outer ring with a fading tail.
  const a0 = -Math.PI / 2;
  const a1 = a0 + (70 * Math.PI) / 180;
  const arcR = r * 0.98;
  const arc = `M${(cx + Math.cos(a0) * arcR).toFixed(1)} ${(cy + Math.sin(a0) * arcR).toFixed(1)}A${arcR} ${arcR} 0 0 1 ${(cx + Math.cos(a1) * arcR).toFixed(1)} ${(cy + Math.sin(a1) * arcR).toFixed(1)}`;
  const origin = { transformOrigin: `${cx}px ${cy}px`, transformBox: 'view-box' } as CSSProperties;
  const gid = `scan-${Math.round(cx)}-${Math.round(cy)}`;

  return (
    <svg className="bg-layer absolute inset-0" width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <defs>
        <linearGradient id={gid} x1={cx + Math.cos(a0) * arcR} y1={cy + Math.sin(a0) * arcR} x2={cx + Math.cos(a1) * arcR} y2={cy + Math.sin(a1) * arcR} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgb(56,189,248)" stopOpacity="0" />
          <stop offset="1" stopColor="rgb(56,189,248)" stopOpacity={Math.min(0.6, opacity * 3.2)} />
        </linearGradient>
      </defs>
      <g className="bg-reveal">
        <circle cx={cx} cy={cy} r={r} stroke={stroke(1)} strokeWidth={1} />
        <circle cx={cx} cy={cy} r={r * 0.72} stroke={stroke(0.8)} strokeWidth={1} strokeDasharray="2 6" />
        <circle cx={cx} cy={cy} r={r * 0.46} stroke={stroke(0.7)} strokeWidth={1} />
        {ticks && <path d={ticksD} stroke={stroke(0.9)} strokeWidth={1} />}
        {perimeter && <path d={hexagon(cx, cy, r * 1.16)} stroke={stroke(0.7)} strokeWidth={1} />}
      </g>
      {animate && scan && (
        <g className="bg-spin" style={{ ...origin, animationDuration: `${scanPeriod}s` }}>
          <path d={arc} stroke={`url(#${gid})`} strokeWidth={1.6} strokeLinecap="round" />
        </g>
      )}
      {animate && pulse && (
        <circle
          cx={cx}
          cy={cy}
          r={r * 0.95}
          stroke="rgba(56,189,248,0.35)"
          strokeWidth={1}
          className="bg-ring-pulse"
          style={{ ...origin, animationDuration: `${pulseEvery}s` }}
        />
      )}
    </svg>
  );
}
