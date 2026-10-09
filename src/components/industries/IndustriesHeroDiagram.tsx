import type { CSSProperties } from 'react';
import { hexagon, type Pt } from '../backgrounds/geometry';
import { Icon, type IconName } from '../Icons';
import { arc, Diagram, DrawPath, Hex, INK, Module, Pulse, RingPulse, Spin, polar } from '../page/Diagram';

/**
 * Industries hero visual: five sector cells in a honeycomb around a secured
 * core, joined by short routed channels that carry slow pulses in and out.
 * The sixth position is an external port: a module with a stub out to the
 * frame ring, where outside traffic enters. Lighter than the homepage Cyber Core by design.
 */

const C: Pt = [230, 230];
const CORE = 50;
const CELL = 36;
const DIST = 150;
const flat = (r: number) => r * Math.cos(Math.PI / 6);

const SECTORS: { deg: number; icon: IconName }[] = [
  { deg: 240, icon: 'heartPulse' },
  { deg: 300, icon: 'building' },
  { deg: 0, icon: 'cart' },
  { deg: 120, icon: 'rocket' },
  { deg: 180, icon: 'bank' },
];
const PORT_DEG = 60;
const FRAME = 222;

/** A straight channel from the core's flat side to a cell's flat side, offset sideways by `off`. */
function channel(deg: number, off: number): Pt[] {
  const a = (deg * Math.PI) / 180;
  const u: Pt = [Math.cos(a), Math.sin(a)];
  const n: Pt = [-u[1], u[0]];
  const p = (d: number): Pt => [C[0] + u[0] * d + n[0] * off, C[1] + u[1] * d + n[1] * off];
  return [p(flat(CORE) + 2), p(DIST - flat(CELL) - 2)];
}

export function IndustriesHeroDiagram() {
  const cells = SECTORS.map((s) => ({ ...s, p: polar(C, DIST, s.deg) }));
  const port = polar(C, DIST, PORT_DEG);
  // Port stub: from the port module out to the frame ring; outside traffic runs frame -> port -> core.
  const portIn: Pt[] = [polar(C, flat(CORE) + 2, PORT_DEG), polar(C, DIST - 15, PORT_DEG)];
  const stub: Pt[] = [polar(C, DIST + 15, PORT_DEG), polar(C, FRAME, PORT_DEG)];
  const inbound: Pt[] = [polar(C, FRAME, PORT_DEG), polar(C, flat(CORE) + 2, PORT_DEG)];
  // Ring of faint links between neighbouring positions (in angle order); links stop short of a cell's
  // outline, or of the smaller port module.
  const ringDegs = [180, 240, 300, 0, 60, 120];
  const gap = (d: number) => (d === PORT_DEG ? 20 : flat(CELL) + 4);
  const neighbours = ringDegs.map((d, i) => {
    const e = ringDegs[(i + 1) % ringDegs.length];
    const p = polar(C, DIST, d);
    const q = polar(C, DIST, e);
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const l = Math.hypot(dx, dy);
    return [
      [p[0] + (dx * gap(d)) / l, p[1] + (dy * gap(d)) / l],
      [q[0] - (dx * gap(e)) / l, q[1] - (dy * gap(e)) / l],
    ] as Pt[];
  });

  return (
    <Diagram w={460} h={460}>
      {(animate) => (
        <>
          {/* clear zone: keeps background traces from showing through around the core */}
          <circle cx={C[0]} cy={C[1]} r={88} fill="rgba(5,11,20,0.72)" />
          {/* outer frame */}
          <g className="d-reveal">
            <circle cx={C[0]} cy={C[1]} r={FRAME} stroke={INK.faint} strokeWidth={1} strokeDasharray="2 6" />
            {[30, 90, 150, 210, 270, 330].map((d) => {
              const p0 = polar(C, 214, d);
              const p1 = polar(C, 230, d);
              return <path key={d} d={`M${p0[0]} ${p0[1]}L${p1[0]} ${p1[1]}`} stroke={INK.line} strokeWidth={1} />;
            })}
            <circle cx={C[0]} cy={C[1]} r={86} stroke={INK.faint} strokeWidth={1} />
          </g>

          {/* neighbour links (quiet) */}
          {neighbours.map((pts, i) => (
            <DrawPath key={`n${i}`} pts={pts} stroke={INK.faint} dash="2 5" delay={0.7} />
          ))}

          {/* channels core <-> sectors */}
          {cells.map((c, i) => (
            <g key={c.deg}>
              <DrawPath pts={channel(c.deg, -5)} delay={0.25 + i * 0.1} />
              <DrawPath pts={channel(c.deg, 5)} stroke={INK.strong} delay={0.3 + i * 0.1} />
            </g>
          ))}
          {/* port: channel to the core and stub out to the frame */}
          <DrawPath pts={portIn} delay={0.8} />
          <DrawPath pts={stub} delay={0.9} />

          {animate && (
            <>
              {cells.map((c, i) => {
                const pts = channel(c.deg, i % 2 ? -5 : 5);
                return <Pulse key={c.deg} pts={i % 2 ? [...pts].reverse() : pts} cycle={9} delay={i * 1.8} speed={45} tail={18} />;
              })}
              <Pulse pts={inbound} cycle={9} delay={4.5} speed={45} tail={18} />
              <RingPulse c={C} r={140} every={8} />
              <Spin c={C} period={26}>
                <path d={arc(C, 86, -40, 20)} stroke={INK.strong} strokeWidth={1.2} />
              </Spin>
              <Spin c={C} period={40} reverse>
                <path d={arc(C, 222, 200, 236)} stroke={INK.line} strokeWidth={1} />
              </Spin>
            </>
          )}

          {/* sector cells */}
          <g className="d-reveal" style={{ ['--d' as string]: '0.35s' } as CSSProperties}>
            {cells.map((c, i) => (
              <g key={c.deg}>
                <Hex c={c.p} r={CELL + 8} stroke={INK.faint} />
                <Hex c={c.p} r={CELL} stroke="rgba(56,189,248,0.45)" fill={INK.fill} />
                {animate && (
                  // Cells light up one after another.
                  <path
                    d={hexagon(c.p[0], c.p[1], CELL)}
                    stroke={INK.strong}
                    strokeWidth={1}
                    fill="rgba(56,189,248,0.08)"
                    className="bg-twinkle"
                    style={{ ['--lo' as string]: 0, ['--hi' as string]: 1, animationDuration: '10s', animationDelay: `${-i * 2}s` } as CSSProperties}
                  />
                )}
                <Icon name={c.icon} className="" x={c.p[0] - 11} y={c.p[1] - 11} width={22} height={22} stroke="rgb(57,215,255)" strokeWidth={1.5} />
              </g>
            ))}
            {/* external port */}
            <circle cx={port[0]} cy={port[1]} r={15} stroke={INK.faint} strokeWidth={1} />
            <Module p={port} s={1.6} lit />
            <circle cx={stub[1][0]} cy={stub[1][1]} r={2.6} fill={INK.node} />
            <circle cx={stub[1][0]} cy={stub[1][1]} r={5.6} stroke={INK.line} strokeWidth={1} />
          </g>

          {/* secured core */}
          <g className="d-reveal" style={{ ['--d' as string]: '0.15s' } as CSSProperties}>
            <circle cx={C[0]} cy={C[1]} r={CORE + 30} fill="rgba(56,189,248,0.05)" />
            <Hex c={C} r={CORE + 14} stroke={INK.line} dash="3 5" />
            <Hex c={C} r={CORE} stroke={INK.strong} fill={INK.fill} />
            <Hex c={C} r={CORE - 16} stroke={INK.line} fill="rgba(56,189,248,0.1)" />
            <Icon name="shield" className="" x={C[0] - 14} y={C[1] - 14} width={28} height={28} stroke="rgb(57,215,255)" strokeWidth={1.4} />
          </g>
        </>
      )}
    </Diagram>
  );
}
