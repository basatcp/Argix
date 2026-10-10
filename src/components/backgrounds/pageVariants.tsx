import { useMemo } from 'react';
import { AmbientParticles } from './AmbientParticles';
import { CircuitLines } from './CircuitLines';
import { DataPulse } from './DataPulse';
import { HexGrid } from './HexGrid';
import { NetworkNodes, type Node } from './NetworkNodes';
import { RadialGlow } from './RadialGlow';
import { SecurityRings } from './SecurityRings';
import { TechnicalGrid } from './TechnicalGrid';
import { byTier, useBg, type AnchorRect } from './context';
import { convergingRoutes, hexagon, horizontalFlows, routedTraces, scatter, toD, type Pt, type Trace } from './geometry';

/**
 * Background compositions for the inner pages, built from the same primitives
 * as the homepage at the intensity each place calls for:
 *
 *   page heroes (medium, below the homepage hero) · build, secure (medium) ·
 *   testimonials (low-medium) · timeline (low, the timeline itself carries the
 *   motion) · cta (medium, converging)
 */

const first = (a: AnchorRect[] | undefined) => a?.[0];

/** Routes from `starts` to the edge of a rectangle (inflated by `pad`), PCB style: along the dominant axis, then 45° in. */
function routesToRect(starts: Pt[], rect: AnchorRect, pad: number): Trace[] {
  const x0 = rect.x - pad;
  const x1 = rect.x + rect.w + pad;
  const y0 = rect.y - pad;
  const y1 = rect.y + rect.h + pad;
  return starts.map(([sx, sy]) => {
    let pts: Pt[];
    if (sx < x0 || sx > x1) {
      // From the side: run horizontally, then 45° to a point on the near edge.
      const tx = sx < x0 ? x0 : x1;
      const ty = Math.min(y1 - 12, Math.max(y0 + 12, sy + (rect.cy - sy) * 0.35));
      const dy = ty - sy;
      pts = [[sx, sy], [tx - Math.sign(tx - sx) * Math.abs(dy), sy], [tx, ty]];
    } else {
      // From above or below: run vertically, then 45° to the near edge.
      const ty = sy < y0 ? y0 : y1;
      const tx = Math.min(x1 - 12, Math.max(x0 + 12, sx + (rect.cx - sx) * 0.35));
      const dx = tx - sx;
      pts = [[sx, sy], [sx, ty - Math.sign(ty - sy) * Math.abs(dx)], [tx, ty]];
    }
    return { pts, d: toD(pts) };
  });
}

/** True when a polyline passes through any of the rects (inflated by `pad`); sampled every 16px. */
function crosses(pts: Pt[], rects: AnchorRect[], pad = 24) {
  if (!rects.length) return false;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 16));
    for (let k = 0; k <= steps; k++) {
      const x = x0 + ((x1 - x0) * k) / steps;
      const y = y0 + ((y1 - y0) * k) / steps;
      if (rects.some((r) => x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad)) return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------- inner-page heroes

export type PageHeroKind = 'build' | 'network' | 'process' | 'secure' | 'calm';

/**
 * Inner-page hero: circuit routes from the right edge and the bottom converge on
 * the page's diagram (data-bg-anchor="visual"), never crossing the copy, plus
 * one page-specific accent. Without a diagram (phones) only the quiet layers render.
 */
function PageHeroLayers({ kind }: { kind: PageHeroKind }) {
  const { w, h, env, anchors } = useBg();
  const visual = first(anchors.visual);
  const copy = first(anchors.copy);
  const mobile = env.tier === 'mobile';
  const c: Pt = visual ? [visual.cx, visual.cy] : [w * 0.82, h * 0.3];
  const R = visual ? Math.min(visual.w, visual.h || visual.w) * 0.5 : Math.min(w, h) * 0.3;
  const side = visual && copy ? visual.x > copy.x + copy.w - 10 : false; // diagram beside the copy (desktop)

  const routes = useMemo(() => {
    if (!visual) return [];
    const starts: Pt[] = side
      ? [
          [w + 4, c[1] - R * 0.5],
          [w + 4, c[1] + R * 0.42],
          [c[0] + R * 0.45, h + 4],
          [c[0] - R * 0.35, h + 4],
        ]
      : [
          [w + 4, c[1] - R * 0.2],
          [-4, c[1] + R * 0.25],
          [c[0] + R * 0.3, h + 4],
        ];
    return convergingRoutes(kind === 'calm' ? starts.slice(0, 2) : starts, c, R * 1.06);
  }, [w, h, c[0], c[1], R, side, kind, !!visual]);
  const bends: Node[] = routes.map((t) => ({ p: t.pts[1], s: 0.85 }));

  // Keep traces off the copy column.
  const clearOfCopy = (pts: Pt[]) => !copy || pts.every(([x, y]) => x > copy.x + copy.w + 24 || y > copy.y + copy.h + 24 || y < copy.y - 40);

  let accent: JSX.Element | null = null;
  if (kind === 'build') {
    // Build: a modular grid and short left-to-right flows feeding the diagram from between the columns.
    const flows =
      side && copy
        ? horizontalFlows({ lanes: [c[1] - R * 0.24, c[1], c[1] + R * 0.24], x0: copy.x + copy.w + 30, x1: c[0] - R * 1.02, seed: 7 })
        : { flows: [], modules: [] };
    accent = (
      <>
        <TechnicalGrid size={44} opacity={0.05} mask="radial-gradient(ellipse 60% 70% at 78% 45%, #000 20%, transparent 75%)" />
        <CircuitLines traces={flows.flows} opacity={0.18} draw />
        <NetworkNodes nodes={flows.modules.map((p) => ({ p, square: true, s: 0.85 }))} opacity={0.5} />
        <DataPulse traces={flows.flows} speed={150} every={7.5} seed={3} />
      </>
    );
  } else if (kind === 'network') {
    // Industries: a honeycomb with routed links between sectors.
    const clearOfVisual = (pts: Pt[]) => !visual || pts.every(([x, y]) => Math.hypot(x - c[0], y - c[1]) > R * 0.95);
    const traces = routedTraces(w, h, {
      count: byTier(env.tier, { desktop: 7, tablet: 5, mobile: 3 }),
      seed: 17,
      hex: 30,
      keep: (pts) => clearOfCopy(pts) && clearOfVisual(pts),
    });
    accent = (
      <>
        <HexGrid r={30} opacity={0.055} mask="radial-gradient(ellipse 65% 75% at 75% 45%, #000 15%, transparent 75%)" />
        <CircuitLines traces={traces} opacity={0.1} draw />
        <NetworkNodes nodes={traces.map((t) => ({ p: t.pts[t.pts.length - 1], s: 0.8 }))} opacity={0.38} />
      </>
    );
  } else if (kind === 'process') {
    // Process: the hero's bottom edge becomes a timeline: six stage ticks rise from it and one pulse walks it.
    const y = h - 1;
    const xs = Array.from({ length: 6 }, (_, i) => w * (0.08 + i * 0.168));
    const line: Trace = { pts: [[-10, y], [w + 10, y]], d: toD([[-10, y], [w + 10, y]]) };
    accent = (
      <>
        <TechnicalGrid size={64} opacity={0.05} depth={0.4} mask="linear-gradient(180deg, transparent, #000 20%, #000 80%, transparent)" />
        <svg className="bg-layer absolute inset-0" width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
          {xs.map((x, i) => (
            <path
              key={i}
              d={`M${x} ${y - 9}V${y}`}
              stroke="rgba(56,189,248,0.35)"
              strokeWidth={1}
              className="bg-reveal"
              style={{ ['--d' as string]: `${0.2 + i * 0.12}s` } as React.CSSProperties}
            />
          ))}
        </svg>
        {!mobile && <DataPulse traces={[line]} speed={120} every={12} tail={60} />}
      </>
    );
  } else if (kind === 'secure') {
    // Security: rings and a hexagonal boundary around the diagram, over a quiet node map.
    const pts = scatter(w, h, byTier(env.tier, { desktop: 12, tablet: 8, mobile: 5 }), 23, Math.min(w, h) * 0.14, (p) => clearOfCopy([p]));
    accent = (
      <>
        <HexGrid r={34} opacity={0.045} mask="radial-gradient(ellipse 60% 70% at 75% 45%, #000 15%, transparent 72%)" />
        <NetworkNodes nodes={pts.map((p) => ({ p, s: 0.75 }))} opacity={0.3} events={mobile ? 0 : 2} />
        {visual && <SecurityRings c={c} r={R * 1.32} opacity={0.11} scanPeriod={28} pulseEvery={9} ticks={false} />}
      </>
    );
  } else {
    // FAQ: oversized hexagon outlines at the edges, nothing else.
    accent = (
      <svg className="bg-layer bg-reveal absolute inset-0" width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        <path d={hexagon(w * 0.97, h * 0.18, Math.max(h * 0.62, 300))} stroke="rgba(59,130,246,0.06)" strokeWidth={1} />
        <path d={hexagon(w * 0.97, h * 0.18, Math.max(h * 0.4, 190))} stroke="rgba(59,130,246,0.045)" strokeWidth={1} />
        <path d={hexagon(w * 0.04, h * 0.98, Math.max(h * 0.5, 240))} stroke="rgba(59,130,246,0.045)" strokeWidth={1} />
      </svg>
    );
  }

  return (
    <>
      <RadialGlow x={c[0]} y={c[1]} size={R * 3.4} opacity={kind === 'calm' ? 0.07 : 0.1} breathe={12} depth={0.3} />
      {accent}
      {routes.length > 0 && (
        <>
          <CircuitLines traces={routes} opacity={kind === 'calm' ? 0.1 : 0.14} draw depth={0.6} />
          <NetworkNodes nodes={bends} opacity={0.45} depth={0.6} />
          {kind !== 'calm' && <DataPulse traces={env.tier === 'tablet' ? routes.slice(0, 2) : routes} speed={160} every={7} depth={0.6} />}
        </>
      )}
      <AmbientParticles count={kind === 'calm' ? { desktop: 4, tablet: 2, mobile: 0 } : { desktop: 10, tablet: 5, mobile: 0 }} region={[w * 0.5, 0, w, h]} seed={kind.length} />
    </>
  );
}

export const PageHeroBuild = () => <PageHeroLayers kind="build" />;
export const PageHeroNetwork = () => <PageHeroLayers kind="network" />;
export const PageHeroProcess = () => <PageHeroLayers kind="process" />;
export const PageHeroSecure = () => <PageHeroLayers kind="secure" />;
export const PageHeroCalm = () => <PageHeroLayers kind="calm" />;

// ---------------------------------------------------------------- build (development services)

/**
 * Modular grid with left-to-right data flows and pulses on some lanes.
 *
 * Content can mark rows with data-bg-anchor="lane": the flows then run along the
 * bottom edge of each row (its divider line), with module nodes in the gutters,
 * so pulses travel between rows and never across their text. Without lanes,
 * groups of flows are spread down the section below the heading area.
 */
export function BuildLayers() {
  const { w, h, env, anchors } = useBg();
  const copy = anchors.copy ?? [];
  const rows = anchors.lane ?? [];
  const rowsKey = rows.map((r) => `${Math.round(r.x)},${Math.round(r.y + r.h)},${Math.round(r.w)}`).join(';');
  // Lanes start below the section's heading area, so pulses never cross headings or leads.
  const top = Math.min(560, h * 0.3);
  const groups = Math.max(1, Math.round((h - top) / 760));
  const { flows, modules } = useMemo(() => {
    if (rows.length) {
      const flows: Trace[] = rows.map((r) => {
        const y = r.y + r.h;
        return { pts: [[-10, y], [w + 10, y]], d: toD([[-10, y], [w + 10, y]]) };
      });
      const modules: Pt[] = rows.flatMap((r) => {
        const y = r.y + r.h;
        return ([r.x - 32, r.x + r.w + 32] as number[]).filter((x) => x > 12 && x < w - 12).map((x) => [x, y] as Pt);
      });
      return { flows, modules };
    }
    const all: Trace[] = [];
    const mods: Pt[] = [];
    for (let g = 0; g < groups; g++) {
      const y = top + (h - top) * ((g + 0.5) / groups);
      const r = horizontalFlows({ lanes: [y - 44, y, y + 44], x0: -10, x1: w + 10, seed: 61 + g * 7 });
      all.push(...r.flows);
      mods.push(...r.modules);
    }
    return { flows: all, modules: mods };
  }, [w, h, top, groups, rowsKey]);
  // Desktop: two of every three lanes; tablet: one in three; phones: one lane in total.
  // Never across text marked data-bg-anchor="copy".
  const lanes = env.tier === 'mobile' ? flows.slice(1, 2) : flows.filter((_, i) => (env.tier === 'desktop' ? i % 3 !== 1 : i % 3 === 1));
  const pulsed = lanes.filter((t) => !crosses(t.pts, copy));
  return (
    <>
      <TechnicalGrid size={48} opacity={0.045} mask="linear-gradient(180deg, transparent, #000 10%, #000 90%, transparent)" />
      <RadialGlow x={w * 0.18} y={Math.min(h * 0.12, 220)} size={Math.max(w * 0.5, 520)} opacity={0.06} breathe={14} />
      <CircuitLines traces={flows} opacity={rows.length ? 0.07 : 0.09} draw />
      <NetworkNodes nodes={modules.map((p) => ({ p, square: true, s: 0.8 }))} opacity={0.32} />
      <DataPulse traces={pulsed} speed={rows.length ? 220 : 170} every={9} intensity={0.9} />
    </>
  );
}

// ---------------------------------------------------------------- secure (security services)

/** Structured hexagonal field, concentric rings with a scanning arc, and a node map with rare verification pulses. */
export function SecureLayers() {
  const { w, h, env, anchors } = useBg();
  const copy = anchors.copy ?? [];
  const ringC: Pt = [w * (env.tier === 'mobile' ? 0.92 : 0.88), Math.min(h * 0.24, env.tier === 'mobile' ? 150 : 330)];
  const ringR = env.tier === 'mobile' ? 130 : Math.min(w * 0.2, 290);
  const tall = h > 1500 && env.tier !== 'mobile';
  const n = byTier(env.tier, { desktop: 12, tablet: 8, mobile: 5 });
  const copyKey = copy.map((r) => `${r.x},${r.y},${r.w},${r.h}`).join(';');
  // Nodes (and so links and pulses) stay off text marked data-bg-anchor="copy".
  const nodes = useMemo(() => scatter(w, h, n, 71, Math.min(w, h) * 0.15, (p) => !crosses([p, p], copy)), [w, h, n, copyKey]);
  const links = useMemo(() => {
    const pairs: [number, number][] = [];
    nodes.forEach((p, i) => {
      const nearest = nodes
        .map((q, j) => [j, Math.hypot(q[0] - p[0], q[1] - p[1])] as const)
        .filter(([j]) => j !== i)
        .sort((a, b) => a[1] - b[1])[0];
      if (nearest && !pairs.some(([a, b]) => (a === nearest[0] && b === i) || (a === i && b === nearest[0]))) pairs.push([i, nearest[0]]);
    });
    return pairs;
  }, [nodes]);
  // Verification pulses travel a few of the links.
  const verify: Trace[] = links
    .map(([a, b]) => ({ pts: [nodes[a], nodes[b]], d: toD([nodes[a], nodes[b]]) }))
    .filter((t) => !crosses(t.pts, copy))
    .slice(0, byTier(env.tier, { desktop: 3, tablet: 1, mobile: 0 }));
  return (
    <>
      <HexGrid r={32} opacity={0.045} mask="radial-gradient(ellipse 85% 75% at 60% 40%, #000 15%, transparent 75%)" />
      <RadialGlow x={ringC[0]} y={ringC[1]} size={ringR * 3} opacity={0.07} breathe={12} />
      <NetworkNodes nodes={nodes.map((p) => ({ p, s: 0.8 }))} links={links} linkOpacity={0.06} opacity={0.3} events={env.tier === 'desktop' ? 2 : 0} />
      <SecurityRings c={ringC} r={ringR} opacity={0.12} scanPeriod={28} pulseEvery={9} />
      {tall && <SecurityRings c={[w * 0.08, h * 0.74]} r={ringR * 0.8} opacity={0.08} pulse={false} ticks={false} scanPeriod={34} />}
      <DataPulse traces={verify} speed={90} every={10} tail={24} intensity={0.8} />
    </>
  );
}

// ---------------------------------------------------------------- testimonials (low-medium)

/**
 * Faint network paths and nodes over a low hex pattern, soft light, and one slow
 * horizontal data pulse across the cards. A brighter node layer (.bg-boost)
 * fades in while a testimonial card is hovered or focused.
 */
export function TestimonialsLayers() {
  const { w, h, env, anchors } = useBg();
  const cards = first(anchors.cards);
  const y = cards ? cards.cy : h * 0.62;
  const traces = useMemo(() => routedTraces(w, h, { count: byTier(env.tier, { desktop: 7, tablet: 5, mobile: 3 }), seed: 81, hex: 30 }), [w, h, env.tier]);
  // Small moving nodes: each drifts a few px on a slow 14-22s cycle (static with reduced motion).
  const nodes: Node[] = traces.flatMap((t, i) => [
    { p: t.pts[0], s: 0.8, drift: [i % 2 ? 5 : -5, 3] as Pt },
    { p: t.pts[t.pts.length - 1], s: 0.9, drift: [i % 2 ? -4 : 4, -4] as Pt },
  ]);
  const line: Trace = { pts: [[-10, y], [w + 10, y]], d: toD([[-10, y], [w + 10, y]]) };
  return (
    <>
      <HexGrid r={30} opacity={0.04} mask="radial-gradient(ellipse 75% 70% at 50% 55%, #000 15%, transparent 75%)" />
      <RadialGlow x={w * 0.5} y={y} size={Math.max(w * 0.6, h * 0.9)} opacity={0.07} breathe={14} />
      <CircuitLines traces={traces} opacity={0.09} draw />
      <CircuitLines traces={[line]} opacity={0.08} />
      <NetworkNodes nodes={nodes} opacity={0.32} />
      <div className="bg-boost absolute inset-0">
        <NetworkNodes nodes={nodes} opacity={0.6} events={env.tier === 'mobile' ? 0 : 3} reveal={false} />
      </div>
      {env.tier !== 'mobile' && <DataPulse traces={[line]} speed={110} every={14} tail={70} intensity={0.8} />}
    </>
  );
}

// ---------------------------------------------------------------- timeline (process page)

/** Quiet field behind the scroll-driven timeline: low hex pattern, deep grid (parallax), drifting light. */
export function TimelineLayers() {
  const { w, h } = useBg();
  return (
    <>
      <HexGrid r={34} opacity={0.04} mask="linear-gradient(180deg, transparent, #000 10%, #000 90%, transparent)" />
      <TechnicalGrid size={64} opacity={0.035} depth={0.4} mask="linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent)" />
      <RadialGlow x={w * 0.5} y={Math.min(h * 0.2, 400)} size={Math.max(w * 0.6, 600)} opacity={0.06} breathe={0} drift={48} />
      <AmbientParticles count={{ desktop: 10, tablet: 5, mobile: 0 }} seed={19} opacity={0.8} />
    </>
  );
}

// ---------------------------------------------------------------- final CTA (converging)

/** Routes from both sides and below converge on the call-to-action panel (data-bg-anchor="cta"). */
export function CtaLayers() {
  const { w, h, env, anchors } = useBg();
  const card = first(anchors.cta) ?? { x: w * 0.2, y: h * 0.25, w: w * 0.6, h: h * 0.5, cx: w / 2, cy: h / 2 };
  const mobile = env.tier === 'mobile';
  const routes = useMemo(() => {
    const starts: Pt[] = mobile
      ? [
          [-4, card.y + card.h * 0.3],
          [w + 4, card.y + card.h * 0.7],
        ]
      : [
          [-4, card.y + card.h * 0.22],
          [-4, card.y + card.h * 0.78],
          [w + 4, card.y + card.h * 0.3],
          [w + 4, card.y + card.h * 0.72],
          [card.x + card.w * 0.25, h + 4],
          [card.x + card.w * 0.78, h + 4],
        ];
    return routesToRect(starts, card, 14);
  }, [w, h, card.x, card.y, card.w, card.h, mobile]);
  const c: Pt = [card.cx, card.cy];
  const nodes: Node[] = routes.map((t) => {
    const p = t.pts[1];
    const dx = c[0] - p[0];
    const dy = c[1] - p[1];
    const l = Math.hypot(dx, dy) || 1;
    return { p, s: 0.9, drift: [(dx / l) * 5, (dy / l) * 5] as Pt };
  });
  return (
    <>
      <HexGrid r={30} opacity={0.05} mask={`radial-gradient(ellipse ${Math.round(card.w * 0.75)}px ${Math.round(card.h * 1.1)}px at ${Math.round(card.cx)}px ${Math.round(card.cy)}px, #000 30%, transparent 100%)`} />
      <RadialGlow x={c[0]} y={c[1]} size={Math.max(card.w, card.h) * 1.25} opacity={0.11} breathe={10} />
      <CircuitLines traces={routes} opacity={0.15} draw />
      <NetworkNodes nodes={nodes} opacity={0.45} />
      <DataPulse traces={mobile ? routes.slice(0, 1) : routes.filter((_, i) => i % 2 === 0)} speed={160} every={7} />
      <AmbientParticles count={{ desktop: 8, tablet: 4, mobile: 0 }} mode="inward" center={c} seed={29} />
    </>
  );
}
