import type { CSSProperties } from 'react';
import { hexagon, type Pt } from '../backgrounds/geometry';
import { Diagram, DrawPath, Dot, Hex, INK, Pulse, RingPulse, Spin, arc, polar } from '../page/Diagram';

/**
 * Services hero visual: modular build blocks on the left (development) hand
 * their output through three flows into a hexagonal security boundary with
 * concentric rings on the right (protection). Pulses travel from build to
 * secure. Decorative only (PageHero renders it aria-hidden).
 */

// The composition is wide and short: a 460 x 300 canvas keeps it filling the hero column without empty bands.
const W = 460;
const H = 300;
const S: Pt = [322, 154]; // centre of the security rings
const R1 = 92; // outer ring (ticks, scan)
const R2 = 66; // dashed ring, where the flows land
const R3 = 40; // inner ring
const BOUND = 116; // hexagonal boundary
const EDGE_X = S[0] - BOUND * Math.cos(Math.PI / 6); // left flat side of the boundary

/** Rows of build modules: centre y, then [x0, x1] blocks. The last block of rows B-D is the output module. */
const ROWS: { y: number; blocks: [number, number][] }[] = [
  { y: 74, blocks: [[64, 112], [122, 176]] },
  { y: 114, blocks: [[24, 70], [80, 126], [136, 176]] },
  { y: 154, blocks: [[24, 96], [106, 176]] },
  { y: 194, blocks: [[24, 58], [68, 122], [132, 176]] },
  { y: 234, blocks: [[64, 130], [140, 176]] },
];
const LANES = [ROWS[1].y, ROWS[2].y, ROWS[3].y];
const BLOCK_H = 28;
const BUS_X = 12;

const laneEnd = (y: number): Pt => [S[0] - Math.sqrt(R2 * R2 - (y - S[1]) ** 2), y];

const circleD = (c: Pt, r: number) => `M${c[0] - r} ${c[1]}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

function Block({ x0, x1, y, lit, delay }: { x0: number; x1: number; y: number; lit: boolean; delay: number }) {
  const w = x1 - x0;
  const top = y - BLOCK_H / 2;
  return (
    <g className="d-reveal" style={{ ['--d' as string]: `${delay}s` } as CSSProperties}>
      <rect x={x0} y={top} width={w} height={BLOCK_H} rx={5} fill={INK.fill} stroke={lit ? INK.strong : INK.line} strokeWidth={1} />
      {w >= 44 ? (
        // "code lines" inside wider modules
        <path
          d={`M${x0 + 8} ${y - 4}h${Math.min(28, w * 0.46)}M${x0 + 8} ${y + 4}h${Math.min(18, w * 0.3)}`}
          stroke={INK.line}
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      ) : (
        <rect x={x0 + w / 2 - 1.8} y={y - 1.8} width={3.6} height={3.6} fill={INK.node} opacity={0.55} />
      )}
      {lit && <rect x={x1 - 9} y={y - 1.8} width={3.6} height={3.6} fill={INK.node} />}
    </g>
  );
}

export function ServicesHeroDiagram() {
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const a = i * 10;
    const r0 = i % 3 === 0 ? R1 - 7 : R1 - 4;
    const [x0, y0] = polar(S, r0, a);
    const [x1, y1] = polar(S, R1, a);
    return `M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }).join('');
  const outerHex = 136;
  const outerRight = S[0] + outerHex * Math.cos(Math.PI / 6);
  const cells: Pt[] = [
    [outerRight, S[1] - outerHex / 2],
    [outerRight, S[1] + outerHex / 2],
    [S[0], S[1] - outerHex],
  ];
  const scanA = polar(S, R1, -90);
  const scanB = polar(S, R1, -20);

  return (
    <Diagram w={W} h={H}>
      {(animate) => (
        <>
          <defs>
            <linearGradient id="svc-hero-scan" x1={scanA[0]} y1={scanA[1]} x2={scanB[0]} y2={scanB[1]} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="rgb(56,189,248)" stopOpacity="0" />
              <stop offset="1" stopColor="rgb(56,189,248)" stopOpacity="0.7" />
            </linearGradient>
            <radialGradient id="svc-hero-glow">
              <stop offset="0" stopColor="rgb(56,189,248)" stopOpacity="0.16" />
              <stop offset="1" stopColor="rgb(56,189,248)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ---- build side: crop marks, backplane, row links ---- */}
          <g className="d-reveal" stroke={INK.faint} strokeWidth={1}>
            <path d="M0 56v-10h10M186 46h10v10M0 252v10h10M186 262h10v-10" />
            <path d={`M${BUS_X - 6} 42V266`} strokeDasharray="1 5" />
          </g>
          <DrawPath pts={[[BUS_X, 60], [BUS_X, 248]]} delay={0} />
          {ROWS.map((row, i) => (
            <DrawPath key={row.y} pts={[[BUS_X, row.y], [row.blocks[row.blocks.length - 1][1], row.y]]} delay={0.1 + i * 0.06} />
          ))}
          {ROWS.map((row) => (
            <circle key={`n${row.y}`} cx={BUS_X} cy={row.y} r={2} fill={INK.node} opacity={0.7} className="d-reveal" />
          ))}

          {/* ---- hand-off flows into the boundary ---- */}
          {LANES.map((y, i) => (
            <DrawPath key={y} pts={[[176, y], laneEnd(y)]} stroke={INK.strong} width={1} delay={0.7 + i * 0.1} />
          ))}

          {/* pulses run under the modules, so they surface in the gaps and on the flows */}
          {animate &&
            LANES.map((y, i) => <Pulse key={`p${y}`} pts={[[BUS_X, y], laneEnd(y)]} cycle={6.6} delay={i * 2.2 + 0.6} speed={92} tail={20} />)}

          {ROWS.map((row, r) =>
            row.blocks.map(([x0, x1], b) => (
              <Block
                key={`${row.y}-${x0}`}
                x0={x0}
                x1={x1}
                y={row.y}
                lit={LANES.includes(row.y) && b === row.blocks.length - 1}
                delay={0.15 + r * 0.07 + b * 0.05}
              />
            )),
          )}

          {/* ---- secure side ---- */}
          <circle cx={S[0]} cy={S[1]} r={R1 + 10} fill="url(#svc-hero-glow)" className="d-reveal" style={{ ['--d' as string]: '1.1s' } as CSSProperties} />
          <Hex c={S} r={outerHex} stroke={INK.faint} dash="2 6" className="d-reveal" />
          {cells.map((p, i) => (
            <g key={i} className="d-reveal" style={{ ['--d' as string]: `${1.2 + i * 0.1}s` } as CSSProperties}>
              <path d={hexagon(p[0], p[1], 9)} stroke={INK.line} strokeWidth={1} fill={INK.fill} />
              <circle cx={p[0]} cy={p[1]} r={1.6} fill={INK.node} opacity={0.6} />
            </g>
          ))}
          <DrawPath d={hexagon(S[0], S[1], BOUND)} stroke={INK.line} delay={0.85} />
          <DrawPath d={circleD(S, R1)} stroke={INK.line} delay={0.95} />
          <path d={ticks} stroke={INK.line} strokeWidth={1} className="d-reveal" style={{ ['--d' as string]: '1.15s' } as CSSProperties} />
          <DrawPath d={circleD(S, R2)} stroke={INK.line} delay={1.05} dash="2 5" />
          <DrawPath d={circleD(S, R3)} stroke={INK.strong} delay={1.15} />

          {/* gates where the flows cross the boundary */}
          {LANES.map((y) => (
            <rect
              key={`g${y}`}
              x={EDGE_X - 3}
              y={y - 6}
              width={6}
              height={12}
              rx={1.5}
              fill={INK.fill}
              stroke={INK.strong}
              strokeWidth={1}
              className="d-reveal"
              style={{ ['--d' as string]: '0.95s' } as CSSProperties}
            />
          ))}
          {LANES.map((y) => {
            const p = laneEnd(y);
            return <circle key={`e${y}`} cx={p[0]} cy={p[1]} r={2.4} fill={INK.node} className="d-reveal" style={{ ['--d' as string]: '1.2s' } as CSSProperties} />;
          })}

          {/* core: a secured hexagon */}
          <g className="d-reveal" style={{ ['--d' as string]: '1.3s' } as CSSProperties}>
            <path d={hexagon(S[0], S[1], 21)} fill={INK.fill} stroke={INK.strong} strokeWidth={1.2} />
            <path d={`M${S[0] - 7} ${S[1] + 0.5}l4.6 4.6 9.4-10`} stroke="#39D7FF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* verification nodes on the outer ring */}
          {[-50, 22, 74].map((a, i) => (
            <Dot key={a} p={polar(S, R1, a)} r={2.2} twinkle={animate ? 0.8 + i * 2.1 : 0} />
          ))}

          {animate && (
            <>
              <Spin c={S} period={26}>
                <path d={arc(S, R1, -90, -20)} stroke="url(#svc-hero-scan)" strokeWidth={1.6} strokeLinecap="round" />
              </Spin>
              <RingPulse c={S} r={R1} every={7.5} delay={3} />
            </>
          )}
        </>
      )}
    </Diagram>
  );
}
