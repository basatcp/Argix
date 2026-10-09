import { useEffect, useRef, type ReactNode } from 'react';
import { pulseStyle } from './DataPulse';
import { hexagon, lengthOf, toD, type Pt } from './geometry';
import { observeVisibility, readEnv } from './motion';

export type MotifKind = 'healthcare' | 'saas' | 'commerce' | 'startup' | 'fintech';

const W = 220;
const H = 140;
const LINE = 'rgba(59,130,246,0.35)';
const NODE = 'rgb(56,189,248)';

function Pulse({ pts, cycle, delay = 0, speed = 70 }: { pts: Pt[]; cycle: number; delay?: number; speed?: number }) {
  return (
    <path d={toD(pts)} pathLength={1000} className="bg-pulse" stroke="rgba(186,230,253,0.85)" strokeWidth={1.4} strokeLinecap="round" fill="none" style={pulseStyle(lengthOf(pts), { speed, cycle, tail: 18, delay })} />
  );
}

function Dot({ p, r = 2.2, twinkle = 0 }: { p: Pt; r?: number; twinkle?: number }) {
  return (
    <g className={twinkle ? 'bg-twinkle' : ''} style={twinkle ? ({ ['--lo' as string]: 0.35, ['--hi' as string]: 1, animationDuration: '6s', animationDelay: `${-twinkle}s` } as React.CSSProperties) : undefined}>
      <circle cx={p[0]} cy={p[1]} r={r + 2.6} stroke={LINE} strokeWidth={1} fill="none" />
      <circle cx={p[0]} cy={p[1]} r={r} fill={NODE} />
    </g>
  );
}

/** Healthcare: network nodes and a quiet vital-sign line. */
function Healthcare({ animate }: { animate: boolean }) {
  const nodes: Pt[] = [
    [120, 40],
    [170, 28],
    [196, 70],
    [150, 82],
  ];
  const line: Pt[] = [
    [70, 112],
    [128, 112],
    [136, 100],
    [146, 124],
    [154, 112],
    [214, 112],
  ];
  return (
    <>
      <path d={toD([nodes[0], nodes[1], nodes[2], nodes[3], nodes[0]])} stroke={LINE} strokeWidth={1} fill="none" />
      <path d={toD(line)} stroke={LINE} strokeWidth={1} fill="none" strokeLinejoin="round" />
      {nodes.map((p, i) => (
        <Dot key={i} p={p} twinkle={animate ? i * 1.4 + 0.1 : 0} />
      ))}
      {animate && <Pulse pts={line} cycle={6} />}
    </>
  );
}

/** SaaS: a distributed modular grid; a few modules light up in turn. */
function Saas({ animate }: { animate: boolean }) {
  const cells: ReactNode[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      const x = 100 + c * 23;
      const y = 22 + r * 25;
      const lit = (r * 5 + c) % 7 === 2;
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={x}
          y={y}
          width={15}
          height={15}
          rx={2.5}
          stroke={LINE}
          strokeWidth={1}
          fill={lit ? 'rgba(56,189,248,0.35)' : 'none'}
          className={lit && animate ? 'bg-twinkle' : ''}
          style={lit && animate ? ({ ['--lo' as string]: 0.25, ['--hi' as string]: 1, animationDuration: '7s', animationDelay: `${-(r * 1.9 + c)}s` } as React.CSSProperties) : undefined}
        />,
      );
    }
  }
  return <>{cells}</>;
}

/** E-commerce: a transaction path from basket to confirmation. */
function Commerce({ animate }: { animate: boolean }) {
  const path: Pt[] = [
    [92, 104],
    [130, 104],
    [150, 64],
    [186, 64],
    [204, 30],
  ];
  return (
    <>
      <path d={toD(path)} stroke={LINE} strokeWidth={1} fill="none" strokeDasharray="3 4" />
      {path.filter((_, i) => i % 2 === 0).map((p, i) => (
        <rect key={i} x={p[0] - 5} y={p[1] - 5} width={10} height={10} rx={2} stroke="rgba(56,189,248,0.7)" strokeWidth={1} fill="rgba(14,27,44,0.9)" />
      ))}
      {animate && <Pulse pts={path} cycle={5.5} speed={60} />}
    </>
  );
}

/** Startups: a node network that expands outward from one seed node. */
function Startup({ animate }: { animate: boolean }) {
  const c: Pt = [158, 66];
  const ring = (r: number, n: number, off: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = off + (i / n) * Math.PI * 2;
      return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * 0.8] as Pt;
    });
  const inner = ring(26, 3, -0.4);
  const outer = ring(52, 5, 0.3);
  return (
    <>
      {inner.map((p, i) => (
        <path key={`i${i}`} d={toD([c, p])} stroke={LINE} strokeWidth={1} />
      ))}
      {outer.map((p, i) => (
        <path key={`o${i}`} d={toD([inner[i % 3], p])} stroke={LINE} strokeWidth={1} strokeDasharray="2 4" />
      ))}
      <Dot p={c} r={2.8} />
      {inner.map((p, i) => (
        <Dot key={`id${i}`} p={p} r={1.8} />
      ))}
      {outer.map((p, i) => (
        <Dot key={`od${i}`} p={p} r={1.6} twinkle={animate ? 0.6 + i * 1.1 : 0} />
      ))}
      {animate && (
        <circle cx={c[0]} cy={c[1]} r={58} stroke="rgba(56,189,248,0.4)" strokeWidth={1} fill="none" className="bg-ring-pulse" style={{ transformOrigin: `${c[0]}px ${c[1]}px`, transformBox: 'view-box', animationDuration: '7s' }} />
      )}
    </>
  );
}

/** Fintech: two endpoints joined through a secured hexagonal gateway. */
function Fintech({ animate }: { animate: boolean }) {
  const a: Pt = [96, 98];
  const b: Pt = [206, 34];
  const g: Pt = [152, 66];
  const ab: Pt[] = [a, [124, 98], g, [180, 34], b];
  const back: Pt[] = [...ab].reverse();
  return (
    <>
      <path d={toD(ab)} stroke={LINE} strokeWidth={1} fill="none" />
      <path d={hexagon(g[0], g[1], 15)} stroke="rgba(56,189,248,0.6)" strokeWidth={1} fill="rgba(14,27,44,0.9)" />
      <path d={hexagon(g[0], g[1], 24)} stroke={LINE} strokeWidth={1} fill="none" strokeDasharray="2 4" />
      <Dot p={a} />
      <Dot p={b} />
      {animate && (
        <>
          <Pulse pts={ab} cycle={6.5} />
          <Pulse pts={back} cycle={6.5} delay={3.25} />
        </>
      )}
    </>
  );
}

const MOTIFS: Record<MotifKind, (p: { animate: boolean }) => JSX.Element> = {
  healthcare: Healthcare,
  saas: Saas,
  commerce: Commerce,
  startup: Startup,
  fintech: Fintech,
};

/**
 * Quiet line motif in the top-right of an industry card, a variation of the
 * site's background system. More present on card hover (backgrounds.css);
 * animations pause while the card is off screen and are omitted for reduced motion.
 */
export function CardMotif({
  kind,
  className = 'pointer-events-none absolute right-0 top-0 -z-10 h-[140px] w-[min(220px,58%)]',
}: {
  kind: MotifKind;
  /** Size and position (default: top-right corner of an industry card). */
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const env = readEnv();
  const animate = !env.reduced;
  useEffect(() => {
    const el = ref.current;
    if (!el || !animate) return;
    return observeVisibility(el, (visible) => {
      el.dataset.active = String(visible);
    });
  }, [animate]);
  const Motif = MOTIFS[kind];
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      data-active="false"
      className={`card-motif ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMaxYMin meet"
      fill="none"
    >
      <Motif animate={animate} />
    </svg>
  );
}
