import type { CSSProperties } from 'react';
import { hexagon, lengthOf, toD, type Pt } from '../backgrounds/geometry';
import { DrawPath, Diagram, Dot, Hex, INK, Module, Pulse, Spin, arc, circlePath, polar, tickRing } from '../page/Diagram';

/**
 * Security hero visual: a defended core. Nested hexagonal boundaries and
 * concentric rings, a slow scanning arc, and verification pulses that travel
 * inward along six spokes from perimeter sensors to the core; each arrival
 * briefly lights a verification mark on the inner boundary. A faint node map
 * sits outside the perimeter. Calm and stable: nothing flashes, nothing alarms.
 *
 * Reduced motion: the static structure only (rings, boundaries, spokes, nodes).
 */

const C: Pt = [230, 230];
const PERIMETER = 182;
const INNER = 58;
const SPOKES = [-90, -30, 30, 90, 150, 210];
/** Ring radii crossed by every spoke; each crossing gets a small gate mark. */
const GATES = [150, 118, 86];

// Verification pulses: one spoke fires every 3 s, in an order that walks around the core.
const CYCLE = 18;
const SPEED = 55;
const TAIL = 26;
const FIRE = [0, 9, 3, 12, 6, 15];

/** Faint network outside the perimeter (corners of the box). */
const MAP: Pt[] = [
  [36, 60],
  [100, 22],
  [388, 38],
  [440, 128],
  [446, 332],
  [384, 434],
  [98, 440],
  [22, 352],
  [14, 200],
];
const MAP_LINKS: [number, number][] = [
  [0, 1],
  [2, 3],
  [4, 5],
  [6, 7],
  [7, 8],
];

/** Short mark across a spoke at radius r (perpendicular to it). */
function gate(a: number, r: number, half = 4) {
  const [x, y] = polar(C, r, a);
  const t = ((a + 90) * Math.PI) / 180;
  const dx = Math.cos(t) * half;
  const dy = Math.sin(t) * half;
  return `M${(x - dx).toFixed(1)} ${(y - dy).toFixed(1)}L${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}`;
}

/** Timing for a mark that lights (bg-blink peaks at 89% of its cycle) just as the spoke's pulse arrives. */
function arrivalStyle(len: number, fire: number): CSSProperties {
  const travel = len / SPEED;
  const d = (((fire + 0.89 * CYCLE - travel - 0.2) % CYCLE) + CYCLE) % CYCLE;
  return { animationDuration: `${CYCLE}s`, animationDelay: `${(-d).toFixed(2)}s` };
}

export function SecurityHeroDiagram() {
  const spokes = SPOKES.map((a) => [polar(C, PERIMETER, a), polar(C, INNER + 2, a)] as Pt[]);
  const spokeLen = lengthOf(spokes[0]);

  return (
    <Diagram w={460} h={460}>
      {(animate) => (
        <>
          <defs>
            <radialGradient id="sec-hero-glow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="rgb(56,189,248)" stopOpacity="0.2" />
              <stop offset="0.55" stopColor="rgb(59,130,246)" stopOpacity="0.07" />
              <stop offset="1" stopColor="rgb(59,130,246)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="sec-hero-scan" x1={polar(C, 150, -90)[0]} y1={polar(C, 150, -90)[1]} x2={polar(C, 150, -20)[0]} y2={polar(C, 150, -20)[1]} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="rgb(56,189,248)" stopOpacity="0" />
              <stop offset="1" stopColor="rgb(56,189,248)" stopOpacity="0.75" />
            </linearGradient>
          </defs>

          {/* Controlled radial glow behind the core */}
          <circle
            cx={C[0]}
            cy={C[1]}
            r={176}
            fill="url(#sec-hero-glow)"
            className={animate ? 'bg-breathe' : undefined}
            style={{ transformOrigin: `${C[0]}px ${C[1]}px`, transformBox: 'view-box', animationDuration: '12s' } as CSSProperties}
          />

          {/* Low-opacity node map outside the perimeter */}
          <g className="d-reveal" opacity={0.55} style={{ ['--d' as string]: '0.9s' } as CSSProperties}>
            {MAP_LINKS.map(([a, b]) => (
              <path key={`${a}-${b}`} d={toD([MAP[a], MAP[b]])} stroke={INK.faint} strokeWidth={1} />
            ))}
            {MAP.map((p, i) => (
              <Dot key={i} p={p} r={1.8} twinkle={animate ? 1 + i * 0.9 : 0} />
            ))}
          </g>

          {/* Structured hexagonal boundaries */}
          <Hex c={C} r={214} stroke={INK.faint} dash="2 6" className="d-reveal" />
          <DrawPath d={hexagon(C[0], C[1], PERIMETER)} stroke={INK.line} delay={0.1} />

          {/* Concentric rings and the tick ring */}
          <g className="d-reveal" style={{ ['--d' as string]: '0.3s' } as CSSProperties}>
            <path d={tickRing(C, { count: 72, r0: 163, r1: 168, majorEvery: 6, majorR0: 158 })} stroke={INK.line} strokeWidth={1} />
            <circle cx={C[0]} cy={C[1]} r={118} stroke={INK.faint} strokeWidth={1} strokeDasharray="2 6" />
          </g>
          <DrawPath d={circlePath(C, 150)} stroke={INK.line} delay={0.25} />
          <DrawPath d={circlePath(C, 86)} stroke={INK.line} delay={0.45} />

          {/* Spokes from the perimeter sensors to the inner boundary, with a gate at every ring */}
          {spokes.map((pts, i) => (
            <DrawPath key={i} pts={pts} stroke={INK.faint} delay={0.6 + i * 0.06} />
          ))}
          <g className="d-reveal" style={{ ['--d' as string]: '0.8s' } as CSSProperties}>
            <path d={SPOKES.flatMap((a) => GATES.map((r) => gate(a, r))).join('')} stroke={INK.strong} strokeWidth={1} opacity={0.7} />
          </g>

          {/* Inner boundary and core */}
          <Hex c={C} r={INNER} stroke={INK.strong} fill={INK.fill} />
          <Hex c={C} r={40} stroke={INK.line} dash="2 4" />
          <Hex c={C} r={21} stroke={INK.strong} fill="rgba(56,189,248,0.1)" />
          <circle cx={C[0]} cy={C[1]} r={3.4} fill={INK.node} />
          {SPOKES.map((a) => {
            const p = polar(C, INNER, a);
            return <circle key={a} cx={p[0]} cy={p[1]} r={2} fill={INK.node} opacity={0.75} />;
          })}

          {/* Perimeter sensors */}
          <g className="d-reveal" style={{ ['--d' as string]: '0.5s' } as CSSProperties}>
            {SPOKES.map((a, i) => (
              <Module key={a} p={polar(C, PERIMETER, a)} s={1.15} lit={i % 2 === 0} />
            ))}
          </g>

          {animate && (
            <>
              {/* Scanning arcs: a slow sweep on the main ring, a slower counter-sweep inside */}
              <Spin c={C} period={26}>
                <path d={arc(C, 150, -90, -20)} stroke="url(#sec-hero-scan)" strokeWidth={1.8} strokeLinecap="round" />
              </Spin>
              <Spin c={C} period={40} reverse>
                <path d={arc(C, 118, 20, 58)} stroke={INK.line} strokeWidth={1.4} strokeLinecap="round" />
              </Spin>
              <Spin c={C} period={90}>
                {[0, 120, 240].map((a) => (
                  <path key={a} d={arc(C, 198, a, a + 22)} stroke={INK.faint} strokeWidth={1} strokeLinecap="round" />
                ))}
              </Spin>

              {/* Verification pulses travelling inward, and the mark each one lights on arrival */}
              {spokes.map((pts, i) => (
                <Pulse key={i} pts={pts} cycle={CYCLE} delay={FIRE[i]} speed={SPEED} tail={TAIL} />
              ))}
              {SPOKES.map((a, i) => {
                const v = polar(C, INNER, a);
                const [t0, t1] = [polar(C, 66, a), polar(C, 76, a)];
                return (
                  <g key={a} className="bg-blink" style={arrivalStyle(spokeLen, FIRE[i])}>
                    <circle cx={v[0]} cy={v[1]} r={8} stroke={INK.strong} strokeWidth={1} />
                    <circle cx={v[0]} cy={v[1]} r={3.2} fill={INK.pulse} />
                    <path d={toD([t0, t1])} stroke={INK.pulse} strokeWidth={1.4} strokeLinecap="round" />
                  </g>
                );
              })}
            </>
          )}
        </>
      )}
    </Diagram>
  );
}
