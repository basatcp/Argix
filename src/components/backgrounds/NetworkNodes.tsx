import type { CSSProperties } from 'react';
import type { Pt } from './geometry';
import { useBg } from './context';

export interface Node {
  p: Pt;
  /** Visual size multiplier. */
  s?: number;
  /** Small square "system module" instead of a round node. */
  square?: boolean;
  /** Inward drift target offset (px), for converging layouts. */
  drift?: Pt;
}

/**
 * Network nodes with slow brightness changes (CSS opacity, staggered), fading
 * in on first entry. Optional tiny "event indicators" blink rarely.
 */
export function NetworkNodes({
  nodes,
  opacity = 0.45,
  links = [],
  linkOpacity = 0.1,
  events = 0,
  reveal = true,
  depth = 0,
}: {
  nodes: Node[];
  opacity?: number;
  /** Pairs of node indices to join with a faint straight line. */
  links?: [number, number][];
  linkOpacity?: number;
  /** How many nodes also get a rare blinking event indicator. */
  events?: number;
  reveal?: boolean;
  depth?: number;
}) {
  const { w, h, animate } = useBg();
  return (
    <svg
      className={`bg-layer absolute inset-0 ${depth ? 'bg-parallax-only' : ''}`}
      style={depth ? ({ ['--depth' as string]: depth } as CSSProperties) : undefined}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
    >
      {links.length > 0 && (
        <g className={reveal ? 'bg-reveal' : ''} stroke={`rgba(59,130,246,${linkOpacity})`} strokeWidth={1}>
          {links.map(([a, b], i) => nodes[a] && nodes[b] && <line key={i} x1={nodes[a].p[0]} y1={nodes[a].p[1]} x2={nodes[b].p[0]} y2={nodes[b].p[1]} />)}
        </g>
      )}
      {nodes.map((n, i) => {
        const s = n.s ?? 1;
        const twinkle = {
          ['--lo' as string]: (opacity * 0.45).toFixed(3),
          ['--hi' as string]: opacity.toFixed(3),
          animationDuration: `${(6 + ((i * 1.7) % 4)).toFixed(1)}s`,
          animationDelay: `${(-((i * 2.9) % 8)).toFixed(1)}s`,
        } as CSSProperties;
        const drift =
          n.drift && animate
            ? ({
                ['--dx' as string]: `${n.drift[0].toFixed(1)}px`,
                ['--dy' as string]: `${n.drift[1].toFixed(1)}px`,
                animationDuration: `${(14 + (i % 5) * 2).toFixed(0)}s`,
                animationDelay: `${(-(i * 3.1) % 14).toFixed(1)}s`,
              } as CSSProperties)
            : undefined;
        return (
          <g key={i} className={reveal ? 'bg-reveal' : ''} style={{ ['--d' as string]: `${(0.15 + i * 0.06).toFixed(2)}s` } as CSSProperties}>
            <g className={drift ? 'bg-drift' : ''} style={drift}>
              <g className={animate ? 'bg-twinkle' : ''} style={animate ? twinkle : { opacity: opacity * 0.7 }}>
                {n.square ? (
                  <>
                    <rect x={n.p[0] - 3.5 * s} y={n.p[1] - 3.5 * s} width={7 * s} height={7 * s} rx={1.5} stroke="rgba(56,189,248,0.7)" strokeWidth={1} fill="rgba(14,27,44,0.9)" />
                    <rect x={n.p[0] - 1.2 * s} y={n.p[1] - 1.2 * s} width={2.4 * s} height={2.4 * s} fill="rgb(56,189,248)" />
                  </>
                ) : (
                  <>
                    <circle cx={n.p[0]} cy={n.p[1]} r={4.5 * s} stroke="rgba(59,130,246,0.8)" strokeWidth={1} />
                    <circle cx={n.p[0]} cy={n.p[1]} r={1.8 * s} fill="rgb(56,189,248)" />
                  </>
                )}
              </g>
            </g>
            {animate && i < events && (
              <circle
                cx={n.p[0] + 9 * s}
                cy={n.p[1] - 7 * s}
                r={1.4}
                fill="rgb(186,230,253)"
                className="bg-blink"
                style={{ animationDuration: `${(9 + (i % 4) * 3).toFixed(0)}s`, animationDelay: `${(-(i * 4.3) % 12).toFixed(1)}s` }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
