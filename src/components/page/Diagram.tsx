import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { pulseStyle } from '../backgrounds/DataPulse';
import { hexagon, lengthOf, toD, type Pt } from '../backgrounds/geometry';
import { observeVisibility, readEnv } from '../backgrounds/motion';

/**
 * Kit for the technical diagrams on inner pages (hero visuals, flows, motifs).
 * Same strokes, nodes and pulse mechanics as the background system, so a
 * diagram reads as part of it:
 *
 *   <Diagram w={460} h={460}>{(animate) => <>…</>}</Diagram>
 *
 * - draws in once when first on screen (`.d-draw` paths, `.d-reveal` groups)
 * - every animation pauses while the diagram is off screen
 * - with reduced motion nothing moves: `animate` is false, so render static parts only
 *
 * Coordinates are in the diagram's own units (viewBox 0 0 w h); it scales to its box.
 */

export const INK = {
  /** Default line. */
  line: 'rgba(59,130,246,0.35)',
  /** Quiet construction line (grids, guides). */
  faint: 'rgba(59,130,246,0.16)',
  /** Emphasised line (active, secured). */
  strong: 'rgba(56,189,248,0.6)',
  node: 'rgb(56,189,248)',
  /** Fill for modules and gateways (card colour). */
  fill: 'rgba(14,27,44,0.92)',
  pulse: 'rgba(186,230,253,0.85)',
  glow: 'rgba(56,189,248,0.16)',
} as const;

export function Diagram({
  w,
  h,
  className = '',
  children,
}: {
  w: number;
  h: number;
  className?: string;
  children: (animate: boolean) => ReactNode;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [animate] = useState(() => !readEnv().reduced);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!animate) {
      el.dataset.entered = 'true';
      return;
    }
    return observeVisibility(el, (visible) => {
      el.dataset.active = String(visible);
      if (visible) el.dataset.entered = 'true';
    });
  }, [animate]);
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      focusable="false"
      data-active="false"
      data-entered="false"
      className={`tech-diagram block h-auto w-full overflow-visible ${className}`}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
    >
      {children(animate)}
    </svg>
  );
}

/** A light pulse travelling along `pts` every `cycle` seconds. Render only when animating. */
export function Pulse({
  pts,
  cycle,
  delay = 0,
  speed = 80,
  tail = 22,
  width = 1.5,
}: {
  pts: Pt[];
  cycle: number;
  delay?: number;
  speed?: number;
  tail?: number;
  width?: number;
}) {
  const style = pulseStyle(lengthOf(pts), { speed, cycle, tail, delay });
  const d = toD(pts);
  return (
    <g>
      <path d={d} pathLength={1000} className="bg-pulse" stroke={INK.glow} strokeWidth={width * 3} strokeLinecap="round" style={style} />
      <path d={d} pathLength={1000} className="bg-pulse" stroke={INK.pulse} strokeWidth={width} strokeLinecap="round" style={style} />
    </g>
  );
}

/** Round network node; `twinkle` (seconds of offset) adds the slow brightness change. */
export function Dot({ p, r = 2.4, twinkle = 0, ring = true }: { p: Pt; r?: number; twinkle?: number; ring?: boolean }) {
  return (
    <g
      className={twinkle ? 'bg-twinkle' : ''}
      style={twinkle ? ({ ['--lo' as string]: 0.4, ['--hi' as string]: 1, animationDuration: '6.5s', animationDelay: `${-twinkle}s` } as CSSProperties) : undefined}
    >
      {ring && <circle cx={p[0]} cy={p[1]} r={r + 3} stroke={INK.line} strokeWidth={1} />}
      <circle cx={p[0]} cy={p[1]} r={r} fill={INK.node} />
    </g>
  );
}

/** Square "system module" node. */
export function Module({ p, s = 1, lit = false }: { p: Pt; s?: number; lit?: boolean }) {
  return (
    <g>
      <rect x={p[0] - 5 * s} y={p[1] - 5 * s} width={10 * s} height={10 * s} rx={2} stroke={lit ? INK.strong : INK.line} strokeWidth={1} fill={INK.fill} />
      <rect x={p[0] - 1.6 * s} y={p[1] - 1.6 * s} width={3.2 * s} height={3.2 * s} fill={INK.node} opacity={lit ? 1 : 0.7} />
    </g>
  );
}

/** Pointy-top hexagon outline path. */
export function Hex({ c, r, stroke = INK.line, dash, fill = 'none', className }: { c: Pt; r: number; stroke?: string; dash?: string; fill?: string; className?: string }) {
  return <path d={hexagon(c[0], c[1], r)} stroke={stroke} strokeWidth={1} strokeDasharray={dash} fill={fill} className={className} />;
}

/** A line that draws in on first entry (`delay` in seconds). */
export function DrawPath({ pts, d, stroke = INK.line, width = 1, delay = 0, dash }: { pts?: Pt[]; d?: string; stroke?: string; width?: number; delay?: number; dash?: string }) {
  if (dash) return <path d={d ?? toD(pts!)} stroke={stroke} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" strokeLinejoin="round" className="d-reveal" style={{ ['--d' as string]: `${delay}s` } as CSSProperties} />;
  return (
    <path
      d={d ?? toD(pts!)}
      pathLength={1}
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="d-draw"
      style={{ ['--d' as string]: `${delay}s` } as CSSProperties}
    />
  );
}

/** Slowly rotating group (scanning arcs, orbit marks), compositor-only. */
export function Spin({ c, period = 24, reverse = false, children }: { c: Pt; period?: number; reverse?: boolean; children: ReactNode }) {
  return (
    <g
      className="bg-spin"
      style={{ transformOrigin: `${c[0]}px ${c[1]}px`, transformBox: 'view-box', animationDuration: `${period}s`, animationDirection: reverse ? 'reverse' : 'normal' } as CSSProperties}
    >
      {children}
    </g>
  );
}

/** A ring that expands and fades every `every` seconds. */
export function RingPulse({ c, r, every = 7, delay = 0 }: { c: Pt; r: number; every?: number; delay?: number }) {
  return (
    <circle
      cx={c[0]}
      cy={c[1]}
      r={r}
      stroke="rgba(56,189,248,0.4)"
      strokeWidth={1}
      className="bg-ring-pulse"
      style={{ transformOrigin: `${c[0]}px ${c[1]}px`, transformBox: 'view-box', animationDuration: `${every}s`, animationDelay: `${-delay}s` } as CSSProperties}
    />
  );
}

/** Arc of a circle from angle a0 to a1 (degrees, 0 = right, clockwise). */
export function arc(c: Pt, r: number, a0: number, a1: number) {
  const rad = (a: number) => (a * Math.PI) / 180;
  const x0 = c[0] + Math.cos(rad(a0)) * r;
  const y0 = c[1] + Math.sin(rad(a0)) * r;
  const x1 = c[0] + Math.cos(rad(a1)) * r;
  const y1 = c[1] + Math.sin(rad(a1)) * r;
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}

/** Point on a circle (degrees, 0 = right, clockwise). */
export function polar(c: Pt, r: number, deg: number): Pt {
  const a = (deg * Math.PI) / 180;
  return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
}
