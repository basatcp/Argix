import { useState, type CSSProperties } from 'react';
import { readEnv } from '../backgrounds/motion';
import type { MotifKind } from '../backgrounds/CardMotif';
import { hexagon, type Pt } from '../backgrounds/geometry';
import { arc, Diagram, DrawPath, Dot, Hex, INK, Module, Pulse, RingPulse, Spin, polar } from '../page/Diagram';

/**
 * Panel-size versions of the homepage industry card motifs (CardMotif), drawn
 * with the shared diagram kit so they read as part of the background system:
 *
 *   healthcare  network data + a vital-sign line
 *   saas        distributed module grid, tenants isolated, modules lighting in turn
 *   commerce    transaction paths, left to right: channels -> basket -> payment module -> confirmation -> systems
 *   startup     node rings expanding outward from one seed, edge to edge
 *   fintech     a secure transaction network: six endpoints on a ring around a locked
 *               hexagonal gateway, each linked through a verification checkpoint
 *
 * All share one viewBox (520 x 300). Static parts draw in on first view; pulses,
 * twinkles and rings render only while animating (never for reduced motion).
 */

const W = 520;
const H = 300;

interface MotifProps {
  /** Motion allowed (false under reduced motion: static parts only). */
  animate: boolean;
  /** Secondary motion (extra pulses, rings, scanning arcs); off on phones. */
  rich: boolean;
}

/** Twinkling highlight for a module (lights up and fades back, offset by `delay` seconds). */
function LitRect({ x, y, s, delay, period = 9 }: { x: number; y: number; s: number; delay: number; period?: number }) {
  return (
    <rect
      x={x - s / 2}
      y={y - s / 2}
      width={s}
      height={s}
      rx={4}
      fill="rgba(56,189,248,0.22)"
      stroke={INK.strong}
      strokeWidth={1}
      className="bg-twinkle"
      style={{ ['--lo' as string]: 0, ['--hi' as string]: 1, animationDuration: `${period}s`, animationDelay: `${-delay}s` } as CSSProperties}
    />
  );
}

// ---------------------------------------------------------------- healthcare

function Healthcare({ animate, rich }: MotifProps) {
  const y = 214;
  const ecg: Pt[] = [
    [14, y],
    [150, y],
    [160, y - 8],
    [170, y],
    [196, y],
    [204, y + 10],
    [216, y - 66],
    [229, y + 34],
    [239, y],
    [264, y],
    [278, y - 13],
    [294, y],
    [506, y],
  ];
  const hub: Pt = [362, 100];
  const n1: Pt = [96, 88];
  const n2: Pt = [204, 52];
  const n3: Pt = [470, 60];
  const n4: Pt = [456, 156];
  const n5: Pt = [270, 146];
  const routes: Pt[][] = [
    [n1, [132, 52], n2],
    [n2, [288, 52], [336, 100]],
    [n3, [428, 60], [388, 100]],
    [n4, [408, 156], [375, 123]],
    [n5, [325, 146], [349, 122]],
  ];
  const drops: Pt[][] = [
    [n1, [n1[0], y]],
    [n5, [n5[0], y]],
    [n4, [n4[0], y]],
  ];
  return (
    <>
      {/* monitor guides */}
      <path d={`M14 ${y - 40}H506M14 ${y + 40}H506`} stroke={INK.faint} strokeWidth={1} strokeDasharray="2 6" className="d-reveal" />
      {routes.map((pts, i) => (
        <DrawPath key={`r${i}`} pts={pts} delay={0.3 + i * 0.08} />
      ))}
      {drops.map((pts, i) => (
        <DrawPath key={`d${i}`} pts={pts} stroke={INK.faint} delay={0.5 + i * 0.1} />
      ))}
      <DrawPath pts={ecg} stroke={INK.strong} width={1.3} delay={0.1} />
      {animate && (
        <>
          <Pulse pts={ecg} cycle={6.5} speed={95} tail={30} />
          {rich && (
            <>
              <Pulse pts={[[n5[0], y], n5, [325, 146], [349, 122]]} cycle={6.5} delay={1.6} speed={70} />
              <Pulse pts={routes[1]} cycle={8} delay={4} speed={70} />
              <Pulse pts={[...routes[2]].reverse()} cycle={8} delay={0.5} speed={70} />
              <RingPulse c={[216, y - 66]} r={26} every={6.5} />
            </>
          )}
        </>
      )}
      <g className="d-reveal" style={{ ['--d' as string]: '0.4s' } as CSSProperties}>
        <Hex c={hub} r={44} dash="3 5" />
        <Hex c={hub} r={30} stroke={INK.strong} fill={INK.fill} />
        <Hex c={hub} r={12} stroke={INK.line} fill="rgba(56,189,248,0.12)" />
        <circle cx={hub[0]} cy={hub[1]} r={3} fill={INK.node} />
        {[n1, n2, n3, n4, n5].map((p, i) => (
          <Dot key={i} p={p} r={2.6} twinkle={animate ? 0.7 + i * 1.3 : 0} />
        ))}
        {drops.map(([, p], i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={2} fill={INK.node} opacity={0.8} />
        ))}
      </g>
    </>
  );
}

// ---------------------------------------------------------------- saas

function Saas({ animate, rich }: MotifProps) {
  const gw: Pt = [260, 40];
  const busY = 86;
  const groups = [98, 260, 422];
  const top = 108;
  const bottom = 214;
  const base = 252;
  const cols = [-38, 0, 38];
  const rows = [138, 184];
  // [tenant, row, column] of the modules that light up in turn.
  const lit = [
    [0, 1, 0],
    [1, 0, 2],
    [2, 1, 1],
    [0, 0, 2],
    [1, 1, 0],
    [2, 0, 1],
  ];
  const feed = (gx: number): Pt[] => (gx === gw[0] ? [[gw[0], gw[1] + 20], [gw[0], top]] : [[gw[0], gw[1] + 20], [gw[0], busY], [gx, busY], [gx, top]]);
  return (
    <>
      <DrawPath pts={[[gw[0], gw[1] + 20], [gw[0], busY]]} delay={0.1} />
      <DrawPath pts={[[groups[0], busY], [groups[2], busY]]} delay={0.2} />
      {groups.map((gx, i) => (
        <g key={gx}>
          <DrawPath pts={[[gx, busY], [gx, top]]} delay={0.35 + i * 0.08} />
          <DrawPath pts={[[gx, bottom], [gx, base - 13]]} stroke={INK.faint} delay={0.6 + i * 0.08} />
        </g>
      ))}
      {animate && (rich ? groups : groups.slice(1, 2)).map((gx, i) => <Pulse key={gx} pts={feed(gx)} cycle={7.5} delay={i * 2.5} speed={60} />)}
      <g className="d-reveal" style={{ ['--d' as string]: '0.3s' } as CSSProperties}>
        {/* tenants: isolated groups on one platform */}
        {groups.map((gx) => (
          <rect key={gx} x={gx - 68} y={top} width={136} height={bottom - top} rx={12} stroke={INK.line} strokeWidth={1} strokeDasharray="3 5" fill="rgba(14,27,44,0.35)" />
        ))}
        {groups.map((gx) =>
          rows.map((ry) =>
            cols.map((cx) => (
              <g key={`${gx}-${ry}-${cx}`}>
                <rect x={gx + cx - 12} y={ry - 12} width={24} height={24} rx={4} stroke={INK.line} strokeWidth={1} fill={INK.fill} />
                <rect x={gx + cx - 2.5} y={ry - 2.5} width={5} height={5} fill={INK.node} opacity={0.55} />
              </g>
            )),
          ),
        )}
        {/* shared platform layer */}
        <rect x={30} y={base - 13} width={460} height={26} rx={8} stroke={INK.line} strokeWidth={1} fill={INK.fill} />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={58 + i * 50 - 3} y={base - 3} width={6} height={6} fill={INK.node} opacity={i % 3 === 1 ? 0.9 : 0.4} />
        ))}
        {/* edge / identity gateway */}
        <Hex c={gw} r={30} dash="3 5" />
        <Hex c={gw} r={20} stroke={INK.strong} fill={INK.fill} />
        <circle cx={gw[0]} cy={gw[1]} r={3} fill={INK.node} />
      </g>
      {animate &&
        lit.map(([g, r, c], i) => <LitRect key={i} x={groups[g] + cols[c]} y={rows[r]} s={24} delay={i * 1.5} />)}
    </>
  );
}

// ---------------------------------------------------------------- commerce

function Commerce({ animate, rich }: MotifProps) {
  const y = 150;
  const basket: Pt = [150, y];
  const gate: Pt = [262, y];
  const done: Pt = [382, y];
  // Channels (web, mobile, in-store) converge on the basket; the confirmed order fans out to back-office systems.
  const ins: Pt[][] = [
    [[30, 70], [52, 70], [132, y]],
    [[30, y], [132, y]],
    [[30, 230], [52, 230], [132, y]],
  ];
  const outs: Pt[][] = [
    [[402, y], [406, y], [486, 70], [490, 70]],
    [[402, y], [490, y]],
    [[402, y], [406, y], [486, 230], [490, 230]],
  ];
  const trunk: Pt[] = [
    [168, y],
    [236, y],
  ];
  const trunk2: Pt[] = [
    [288, y],
    [362, y],
  ];
  const orderPath = (k: number): Pt[] => [...ins[k], ...trunk, ...trunk2, ...outs[k]];
  return (
    <>
      {ins.map((pts, i) => (
        <DrawPath key={`i${i}`} pts={pts} delay={0.1 + i * 0.08} />
      ))}
      <DrawPath pts={trunk} stroke={INK.strong} delay={0.4} />
      <DrawPath pts={trunk2} stroke={INK.strong} delay={0.6} />
      {outs.map((pts, i) => (
        <DrawPath key={`o${i}`} pts={pts} delay={0.8 + i * 0.08} />
      ))}
      {animate && (
        <>
          <Pulse pts={orderPath(1)} cycle={9} speed={90} delay={3} />
          {rich && (
            <>
              <Pulse pts={orderPath(0)} cycle={9} speed={90} />
              <Pulse pts={orderPath(2)} cycle={9} speed={90} delay={6} />
            </>
          )}
        </>
      )}
      <g className="d-reveal" style={{ ['--d' as string]: '0.3s' } as CSSProperties}>
        {[ins[0][0], ins[1][0], ins[2][0]].map((p, i) => (
          <Dot key={i} p={p} r={2.4} twinkle={animate ? 0.5 + i * 1.6 : 0} />
        ))}
        {/* basket */}
        <rect x={basket[0] - 18} y={y - 18} width={36} height={36} rx={7} stroke={INK.strong} strokeWidth={1} fill={INK.fill} />
        <path d={`M${basket[0] - 8} ${y - 3}h16l-2.5 10h-11ZM${basket[0] - 4.5} ${y - 3}a4.5 4.5 0 0 1 9 0`} stroke={INK.node} strokeWidth={1.2} strokeLinejoin="round" />
        {/* payment module (a step in the flow, not a hub) */}
        <rect x={gate[0] - 34} y={y - 30} width={68} height={60} rx={13} stroke={INK.line} strokeWidth={1} strokeDasharray="3 5" />
        <rect x={gate[0] - 26} y={y - 22} width={52} height={44} rx={9} stroke={INK.strong} strokeWidth={1} fill={INK.fill} />
        <rect x={gate[0] - 12} y={y - 8} width={24} height={16} rx={2.5} stroke={INK.node} strokeWidth={1.2} fill="rgba(56,189,248,0.12)" />
        <path d={`M${gate[0] - 12} ${y - 3}h24M${gate[0] - 8} ${y + 3.5}h6`} stroke={INK.node} strokeWidth={1.2} strokeLinecap="round" />
        {/* confirmation */}
        <circle cx={done[0]} cy={done[1]} r={20} stroke={INK.strong} strokeWidth={1} fill={INK.fill} />
        <path d={`M${done[0] - 7} ${y + 0.5}l4.6 4.6 9.4-10`} stroke={INK.node} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* order, inventory and fulfillment systems */}
        {outs.map((pts, i) => (
          <Module key={i} p={[pts[pts.length - 1][0] + 8, pts[pts.length - 1][1]]} s={1.6} lit={i === 1} />
        ))}
      </g>
    </>
  );
}

// ---------------------------------------------------------------- startup

function Startup({ animate, rich }: MotifProps) {
  // The seed sits at the left edge; each ring adds nodes further out, until the last sparse ring meets the right edge.
  const seed: Pt = [56, 150];
  const r1 = polarSet(seed, 110, [-34, 0, 34]);
  const r2 = polarSet(seed, 235, [-32, -16, 0, 16, 32]);
  const r3 = polarSet(seed, 370, [-18, -9, 0, 9, 18]);
  const r4 = polarSet(seed, 430, [-10, 0, 10]);
  const nearest = (p: Pt, set: Pt[]) => set.reduce((a, b) => (Math.hypot(b[0] - p[0], b[1] - p[1]) < Math.hypot(a[0] - p[0], a[1] - p[1]) ? b : a));
  const l1 = r1.map((p) => [seed, p] as Pt[]);
  const l2 = r2.map((p) => [nearest(p, r1), p] as Pt[]);
  const l3 = r3.map((p) => [nearest(p, r2), p] as Pt[]);
  const l4 = r4.map((p) => [nearest(p, r3), p] as Pt[]);
  const ring = (r: number, a: number, d: number, stroke: string = INK.faint) => (
    <path d={arc(seed, r, -a, a)} stroke={stroke} strokeWidth={1} strokeDasharray="2 5" className="d-reveal" style={{ ['--d' as string]: `${d}s` } as CSSProperties} />
  );
  return (
    <>
      {ring(110, 50, 0)}
      {ring(235, 36, 0.3)}
      {ring(370, 22, 0.6)}
      {ring(430, 17, 0.9)}
      {l1.map((pts, i) => (
        <DrawPath key={`a${i}`} pts={pts} stroke={INK.strong} delay={0.1} />
      ))}
      {l2.map((pts, i) => (
        <DrawPath key={`b${i}`} pts={pts} delay={0.4} />
      ))}
      {l3.map((pts, i) => (
        <DrawPath key={`c${i}`} pts={pts} stroke={INK.line} dash="2 4" delay={0.75} />
      ))}
      {l4.map((pts, i) => (
        <DrawPath key={`e${i}`} pts={pts} stroke={INK.faint} dash="2 4" delay={1} />
      ))}
      {animate && (
        <>
          <Pulse pts={[seed, r1[1], r2[2], r3[2], r4[1]]} cycle={7} speed={80} delay={2.4} />
          {rich && (
            <>
              <RingPulse c={seed} r={140} every={8} />
              <Pulse pts={[seed, r1[0], r2[1]]} cycle={7} speed={80} />
              <Pulse pts={[seed, r1[2], r2[4]]} cycle={7} speed={80} delay={4.8} />
            </>
          )}
        </>
      )}
      <g className="d-reveal" style={{ ['--d' as string]: '0.2s' } as CSSProperties}>
        <Hex c={seed} r={28} dash="3 5" />
        <Hex c={seed} r={18} stroke={INK.strong} fill={INK.fill} />
        <circle cx={seed[0]} cy={seed[1]} r={3.2} fill={INK.node} />
        {r1.map((p, i) => (
          <Module key={i} p={p} s={1.5} lit />
        ))}
        {r2.map((p, i) => (
          <Dot key={i} p={p} r={2.6} twinkle={animate ? 0.4 + i * 1.1 : 0} />
        ))}
      </g>
      <g className="d-reveal" style={{ ['--d' as string]: '0.9s' } as CSSProperties} opacity={0.75}>
        {r3.map((p, i) => (
          <Dot key={i} p={p} r={2} ring={false} twinkle={animate ? 1.2 + i * 1.3 : 0} />
        ))}
      </g>
      <g className="d-reveal" style={{ ['--d' as string]: '1.1s' } as CSSProperties} opacity={0.5}>
        {r4.map((p, i) => (
          <Dot key={i} p={p} r={1.8} ring={false} />
        ))}
      </g>
    </>
  );
}

function polarSet(c: Pt, r: number, degs: number[]): Pt[] {
  return degs.map((d) => polar(c, r, d));
}

// ---------------------------------------------------------------- fintech

function Fintech({ animate, rich }: MotifProps) {
  const g: Pt = [260, 150];
  // Bank, card network, wallet, ledger, merchant and identity provider on a ring around the gateway.
  const ends: Pt[] = [0, 60, 120, 180, 240, 300].map((d) => {
    const a = (d * Math.PI) / 180;
    return [g[0] + Math.cos(a) * 205, g[1] + Math.sin(a) * 104];
  });
  const along = (p: Pt, d: number): Pt => {
    const l = Math.hypot(p[0] - g[0], p[1] - g[1]);
    return [g[0] + ((p[0] - g[0]) / l) * d, g[1] + ((p[1] - g[1]) / l) * d];
  };
  // Every link runs gateway -> checkpoint -> endpoint; checkpoints sit on one verification ring.
  const CHECK = 84;
  const checks = ends.map((p) => along(p, CHECK));
  const links = ends.map((p) => {
    const l = Math.hypot(p[0] - g[0], p[1] - g[1]);
    return [g, along(p, l - 26)] as Pt[];
  });
  // Quiet links between neighbouring endpoints (the network around the gateway).
  const mesh = ends.map((p, i) => {
    const q = ends[(i + 1) % ends.length];
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const k = 30 / Math.hypot(dx, dy);
    return [
      [p[0] + dx * k, p[1] + dy * k],
      [q[0] - dx * k, q[1] - dy * k],
    ] as Pt[];
  });
  const through = (from: number, to: number): Pt[] => [links[from][1], g, links[to][1]];
  return (
    <>
      {mesh.map((pts, i) => (
        <DrawPath key={`m${i}`} pts={pts} stroke={INK.faint} dash="2 5" delay={0.7} />
      ))}
      <circle cx={g[0]} cy={g[1]} r={CHECK} stroke={INK.faint} strokeWidth={1} strokeDasharray="2 6" className="d-reveal" style={{ ['--d' as string]: '0.5s' } as CSSProperties} />
      {links.map((pts, i) => (
        <DrawPath key={`l${i}`} pts={pts} stroke={i % 3 === 0 ? INK.strong : INK.line} delay={0.1 + i * 0.06} />
      ))}
      {animate && (
        <>
          <Pulse pts={through(3, 0)} cycle={7} speed={90} />
          {rich && (
            <>
              <Pulse pts={through(5, 2)} cycle={7} speed={90} delay={3.5} />
              <Spin c={g} period={24}>
                <path d={arc(g, 64, -60, 10)} stroke={INK.strong} strokeWidth={1} />
                <path d={arc(g, 64, 120, 190)} stroke={INK.line} strokeWidth={1} />
              </Spin>
              <RingPulse c={g} r={96} every={7} delay={2} />
            </>
          )}
        </>
      )}
      <g className="d-reveal" style={{ ['--d' as string]: '0.3s' } as CSSProperties}>
        {/* secured gateway */}
        <Hex c={g} r={50} dash="3 5" />
        <Hex c={g} r={34} stroke={INK.strong} fill={INK.fill} />
        <Hex c={g} r={16} stroke={INK.line} fill="rgba(56,189,248,0.12)" />
        <path d={`M${g[0] - 4.5} ${g[1] - 1}v-3a4.5 4.5 0 0 1 9 0v3M${g[0] - 6.5} ${g[1] - 1}h13v8h-13Z`} stroke={INK.node} strokeWidth={1.2} strokeLinejoin="round" />
        {/* verification checkpoints */}
        {checks.map((p, i) => (
          <Module key={i} p={p} s={1.1} />
        ))}
        {/* endpoints */}
        {ends.map((p, i) => (
          <g key={i}>
            <path d={hexagon(p[0], p[1], 22)} stroke={INK.line} strokeWidth={1} strokeDasharray="3 5" />
            <Module p={p} s={2} lit={i % 3 === 0} />
          </g>
        ))}
      </g>
    </>
  );
}

const MOTIFS: Record<MotifKind, (p: MotifProps) => JSX.Element> = {
  healthcare: Healthcare,
  saas: Saas,
  commerce: Commerce,
  startup: Startup,
  fintech: Fintech,
};

export function IndustryVisual({ kind }: { kind: MotifKind }) {
  const Motif = MOTIFS[kind];
  // Phones: one pulse per diagram, no rotating or expanding rings.
  const [rich] = useState(() => readEnv().tier !== 'mobile');
  return (
    <Diagram w={W} h={H}>
      {(animate) => <Motif animate={animate} rich={rich} />}
    </Diagram>
  );
}

