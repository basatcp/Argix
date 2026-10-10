import type { CSSProperties } from 'react';
import { Diagram, DrawPath, Hex, INK, Module, Pulse, RingPulse, Spin, arc } from '../page/Diagram';
import { hexagon, toD, type Pt } from '../backgrounds/geometry';

/**
 * Process hero visual: the six stages left to right on one delivery trace, the
 * way the timeline below reads. A solid build lane runs above and a dashed
 * secure lane below, and both tap into every stage. One pulse walks the trace
 * and lights each stage as it arrives; the last stage sits inside a monitoring
 * ring with a slow scan. Decorative; no text.
 */

const W = 460;
const H = 330;
const Y = 165; // delivery trace
const Y_BUILD = 92;
const Y_SECURE = 238;
const XS = [42, 115, 188, 261, 334, 400];
const CYCLE = 9; // seconds per run of the pulse
const TAIL = 70;
const TRACE: Pt[] = [
  [0, Y],
  [W, Y],
];
const SPEED = (W + TAIL) / CYCLE;

/** Flash keyframes (`bg-blink`) peak at 89% of the cycle; shift each so the peak lands as the pulse arrives. */
function flashStyle(x: number): CSSProperties {
  const arrive = x / SPEED + 0.15;
  const shift = (((0.89 * CYCLE - arrive) % CYCLE) + CYCLE) % CYCLE;
  return { animationDuration: `${CYCLE}s`, animationDelay: `${(-shift).toFixed(2)}s` };
}

const reveal = (d: number) => ({ ['--d' as string]: `${d}s` }) as CSSProperties;

export function ProcessHeroDiagram() {
  const mon: Pt = [XS[5], Y];
  return (
    <Diagram w={W} h={H}>
      {(animate) => (
        <>
          <defs>
            <radialGradient id="ph-glow">
              <stop offset="0%" stopColor="rgba(30,167,255,0.14)" />
              <stop offset="100%" stopColor="rgba(30,167,255,0)" />
            </radialGradient>
          </defs>
          <ellipse cx={W / 2} cy={Y} rx={230} ry={120} fill="url(#ph-glow)" />

          {/* Construction guides */}
          <g className="d-reveal" style={reveal(0.05)} stroke={INK.faint} strokeWidth={1}>
            <path d={`M0 ${Y_BUILD - 30}H${W}M0 ${Y_SECURE + 30}H${W}`} strokeDasharray="2 8" />
            {XS.map((x) => (
              <path key={x} d={`M${x} ${Y_BUILD - 44}V${Y_BUILD - 36}M${x} ${Y_SECURE + 36}V${Y_SECURE + 44}`} />
            ))}
          </g>

          {/* Build lane (solid) with taps down into each stage */}
          <DrawPath pts={[[14, Y_BUILD], [XS[5] - 40, Y_BUILD]]} stroke={INK.line} delay={0.2} />
          {XS.slice(0, 5).map((x, k) => (
            <DrawPath key={x} pts={[[x, Y_BUILD], [x, Y - 22]]} stroke={INK.line} delay={0.45 + k * 0.1} />
          ))}
          <g className="d-reveal" style={reveal(0.3)}>
            <Module p={[14, Y_BUILD]} s={0.9} lit />
          </g>

          {/* Secure lane (dashed) with taps up into each stage */}
          <DrawPath pts={[[14, Y_SECURE], [XS[5] - 40, Y_SECURE]]} stroke={INK.line} dash="3 5" delay={0.3} />
          {XS.slice(0, 5).map((x, k) => (
            <DrawPath key={x} pts={[[x, Y_SECURE], [x, Y + 22]]} stroke={INK.line} dash="3 5" delay={0.55 + k * 0.1} />
          ))}
          <g className="d-reveal" style={reveal(0.4)}>
            <path d={hexagon(14, Y_SECURE, 7)} stroke={INK.strong} strokeWidth={1} fill={INK.fill} />
            <path d={`M10.6 ${Y_SECURE}l2.4 2.4 4.2-4.6`} stroke={INK.node} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
          </g>
          {/* Both lanes converge on the final stage */}
          <DrawPath pts={[[XS[5] - 40, Y_BUILD], [mon[0] - 8, Y - 46]]} stroke={INK.line} delay={1} />
          <DrawPath pts={[[XS[5] - 40, Y_SECURE], [mon[0] - 8, Y + 46]]} stroke={INK.line} dash="3 5" delay={1.05} />

          {/* Delivery trace and the pulse that walks it */}
          <DrawPath pts={TRACE} stroke={INK.line} width={1.2} delay={0.15} />
          {animate && <Pulse pts={TRACE} cycle={CYCLE} speed={SPEED} tail={TAIL} width={1.6} />}

          {/* Monitoring ring around the final stage */}
          <g className="d-reveal" style={reveal(0.9)}>
            <circle cx={mon[0]} cy={mon[1]} r={34} stroke={INK.line} strokeWidth={1} />
            <circle cx={mon[0]} cy={mon[1]} r={47} stroke={INK.faint} strokeWidth={1} strokeDasharray="2 5" />
          </g>
          {animate && (
            <>
              <Spin c={mon} period={14}>
                <path d={arc(mon, 47, -90, -30)} stroke={INK.strong} strokeWidth={1.4} strokeLinecap="round" />
              </Spin>
              <RingPulse c={mon} r={40} every={CYCLE} />
            </>
          )}

          {/* Stage nodes */}
          {XS.map((x, k) => (
            <g key={x} className="d-reveal" style={reveal(0.35 + k * 0.14)}>
              <Hex c={[x, Y]} r={15} fill={INK.fill} />
              <circle cx={x} cy={Y} r={3.2} fill={INK.node} opacity={0.75} />
            </g>
          ))}
          {animate &&
            XS.map((x) => (
              <g key={x} className="bg-blink" style={flashStyle(x)}>
                <circle cx={x} cy={Y} r={26} fill={INK.glow} />
                <path d={hexagon(x, Y, 15)} stroke="rgba(57,215,255,0.95)" strokeWidth={1.3} />
                <circle cx={x} cy={Y} r={3.6} fill="rgb(207,244,255)" />
              </g>
            ))}
          {animate &&
            XS.slice(0, 5).map((x) => (
              <path key={x} d={toD([[x, Y_BUILD + 4], [x, Y - 22]])} stroke={INK.strong} strokeWidth={1} className="bg-blink" style={flashStyle(x)} />
            ))}
        </>
      )}
    </Diagram>
  );
}
