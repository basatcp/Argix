import type { CSSProperties } from 'react';
import { Diagram, DrawPath, Hex, INK, Pulse, RingPulse, Spin, arc, circlePath, polar, tickRing } from '../page/Diagram';
import { hexagon, toD, type Pt } from '../backgrounds/geometry';

/**
 * Process hero visual: the six stages as nodes on a ring around a hexagonal
 * core. Arcs between the stages draw in on first view, then one pulse travels
 * the cycle and each stage node (with its spoke to the core) lights as the
 * pulse reaches it. Decorative; no text.
 */

const W = 460;
const C: Pt = [230, 230];
const R_STAGE = 164; // ring the stages sit on (the pulse runs here)
const R_TRACK = 146; // inner, dashed "secure" track
const R_CORE = 64;
const R_OUTER = 210;
const STAGES = 6;
const CYCLE = 15; // seconds for one lap of the pulse
const TAIL = 90;

const angle = (k: number) => -90 + k * (360 / STAGES);

// The ring as a polyline from the top, clockwise (same direction and start as the stages).
const RING: Pt[] = Array.from({ length: 121 }, (_, i) => polar(C, R_STAGE, -90 + i * 3));
const RING_LEN = 2 * Math.PI * R_STAGE;
const SPEED = (RING_LEN + TAIL) / CYCLE;

/** Flash keyframes (`bg-blink`) peak at 89% of the cycle; shift each so the peak lands as the pulse arrives. */
function flashStyle(k: number): CSSProperties {
  const arrive = (k * RING_LEN) / STAGES / SPEED + 0.25;
  const x = (((0.89 * CYCLE - arrive) % CYCLE) + CYCLE) % CYCLE;
  return { animationDuration: `${CYCLE}s`, animationDelay: `${(-x).toFixed(2)}s` };
}

// Six tick marks per stage segment on the outer ring, longer at the stages.
const TICKS = tickRing(C, { count: 72, r0: R_OUTER - 4, r1: R_OUTER, majorEvery: 12, majorR0: R_OUTER - 10, start: -90 });

export function ProcessHeroDiagram() {
  return (
    <Diagram w={W} h={W}>
      {(animate) => (
        <>
          {/* Soft glow behind the core */}
          <circle cx={C[0]} cy={C[1]} r={120} fill="url(#ph-glow)" />
          <defs>
            <radialGradient id="ph-glow">
              <stop offset="0%" stopColor="rgba(30,167,255,0.16)" />
              <stop offset="100%" stopColor="rgba(30,167,255,0)" />
            </radialGradient>
          </defs>

          {/* Outer technical ring with ticks, and a slow scanning arc */}
          <g className="d-reveal" style={{ ['--d' as string]: '0.05s' } as CSSProperties}>
            <circle cx={C[0]} cy={C[1]} r={R_OUTER} stroke={INK.faint} strokeWidth={1} />
            <path d={TICKS} stroke={INK.faint} strokeWidth={1} />
          </g>
          {animate && (
            <Spin c={C} period={48}>
              <path d={arc(C, R_OUTER + 8, -120, -78)} stroke={INK.line} strokeWidth={1} strokeLinecap="round" />
              <path d={arc(C, R_OUTER + 8, 60, 72)} stroke={INK.faint} strokeWidth={1} strokeLinecap="round" />
            </Spin>
          )}

          {/* Secure track: dashed, just inside the stage ring */}
          <DrawPath d={circlePath(C, R_TRACK)} stroke={INK.faint} dash="2 6" delay={0.5} />

          {/* Stage ring: one arc per stage-to-stage segment, drawn in order */}
          {Array.from({ length: STAGES }, (_, k) => (
            <DrawPath key={k} d={arc(C, R_STAGE, angle(k) + 8, angle(k + 1) - 8)} stroke={INK.line} width={1.2} delay={0.25 + k * 0.16} />
          ))}
          {animate && <Pulse pts={RING} cycle={CYCLE} speed={SPEED} tail={TAIL} width={1.6} />}

          {/* Spokes: every stage is wired to the core */}
          {Array.from({ length: STAGES }, (_, k) => (
            <DrawPath key={k} pts={[polar(C, R_CORE + 4, angle(k)), polar(C, R_STAGE - 20, angle(k))]} stroke={INK.faint} dash="2 5" delay={0.9 + k * 0.08} />
          ))}
          {animate &&
            Array.from({ length: STAGES }, (_, k) => (
              <path
                key={k}
                d={toD([polar(C, R_CORE + 4, angle(k)), polar(C, R_STAGE - 20, angle(k))])}
                stroke={INK.strong}
                strokeWidth={1}
                className="bg-blink"
                style={flashStyle(k)}
              />
            ))}

          {/* Core: nested hexagons, a slow counter-rotating ring, a centre node */}
          <g className="d-reveal" style={{ ['--d' as string]: '0.2s' } as CSSProperties}>
            <Hex c={C} r={R_CORE} fill={INK.fill} />
            <Hex c={C} r={R_CORE - 13} stroke={INK.faint} dash="3 4" />
            <path d={hexagon(C[0], C[1], 20)} stroke={INK.strong} strokeWidth={1} fill="rgba(56,189,248,0.1)" />
            <circle cx={C[0]} cy={C[1]} r={3.5} fill={INK.node} />
          </g>
          {animate && (
            <>
              <Spin c={C} period={36} reverse>
                <circle cx={C[0]} cy={C[1]} r={33} stroke={INK.line} strokeWidth={1} strokeDasharray="16 7" />
              </Spin>
              <RingPulse c={C} r={R_CORE + 22} every={CYCLE / 2} />
            </>
          )}
          {!animate && <circle cx={C[0]} cy={C[1]} r={33} stroke={INK.line} strokeWidth={1} strokeDasharray="16 7" />}

          {/* Stage nodes, each with a short outward lead */}
          {Array.from({ length: STAGES }, (_, k) => {
            const p = polar(C, R_STAGE, angle(k));
            const lead0 = polar(C, R_STAGE + 17, angle(k));
            const lead1 = polar(C, R_OUTER - 14, angle(k));
            return (
              <g key={k} className="d-reveal" style={{ ['--d' as string]: `${0.3 + k * 0.16}s` } as CSSProperties}>
                <path d={toD([lead0, lead1])} stroke={INK.line} strokeWidth={1} />
                <Hex c={p} r={15} fill={INK.fill} />
                <circle cx={p[0]} cy={p[1]} r={3.2} fill={INK.node} opacity={0.75} />
              </g>
            );
          })}
          {animate &&
            Array.from({ length: STAGES }, (_, k) => {
              const p = polar(C, R_STAGE, angle(k));
              return (
                <g key={k} className="bg-blink" style={flashStyle(k)}>
                  <circle cx={p[0]} cy={p[1]} r={27} fill={INK.glow} />
                  <path d={hexagon(p[0], p[1], 15)} stroke="rgba(57,215,255,0.95)" strokeWidth={1.3} />
                  <circle cx={p[0]} cy={p[1]} r={3.6} fill="rgb(207,244,255)" />
                </g>
              );
            })}
        </>
      )}
    </Diagram>
  );
}
