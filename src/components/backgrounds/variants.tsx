import { useEffect, useMemo, useRef, type ComponentType, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AmbientParticles } from './AmbientParticles';
import { CircuitLines } from './CircuitLines';
import { DataPulse } from './DataPulse';
import { HexGrid } from './HexGrid';
import { LightSweep } from './LightSweep';
import { NetworkNodes, type Node } from './NetworkNodes';
import { RadialGlow } from './RadialGlow';
import { SecurityRings } from './SecurityRings';
import { TechnicalGrid } from './TechnicalGrid';
import { byTier, useBg, type AnchorRect } from './context';
import { convergingRoutes, hexagon, horizontalFlows, routedTraces, scatter, toD, type Pt, type Trace } from './geometry';
import {
  BuildLayers,
  CtaLayers,
  PageHeroBuild,
  PageHeroCalm,
  PageHeroNetwork,
  PageHeroProcess,
  PageHeroSecure,
  SecureLayers,
  TestimonialsLayers,
  TimelineLayers,
} from './pageVariants';

gsap.registerPlugin(ScrollTrigger);

/**
 * One composition per section, each using a few elements of the shared system
 * at the intensity the section calls for:
 *
 *   hero (high) · process (medium-high) · services, pillars, security, split,
 *   consult (medium) · industries (low-medium) · metrics, strip (low) ·
 *   certifications (very low) · faq (minimal) · footer (almost static)
 *
 * Inner pages (pageVariants.tsx): page-* heroes (medium, below the homepage
 * hero) · build, secure, cta (medium) · testimonials (low-medium) · timeline
 */
export type Variant =
  | 'hero'
  | 'strip'
  | 'pillars'
  | 'network'
  | 'metrics'
  | 'industries'
  | 'process'
  | 'monitor'
  | 'split'
  | 'blueprint'
  | 'minimal'
  | 'consult'
  | 'footer'
  | 'page-build'
  | 'page-network'
  | 'page-process'
  | 'page-secure'
  | 'page-calm'
  | 'build'
  | 'secure'
  | 'testimonials'
  | 'timeline'
  | 'cta';

interface VariantSpec {
  Component: ComponentType;
  /** Max parallax shift on desktop, px. */
  parallax?: number;
  /** Max pointer offset of glows, px. */
  pointer?: number;
  /** Mount only after the hero's Cyber Core has drawn its first frame. */
  afterCore?: boolean;
}

const first = (a: AnchorRect[] | undefined) => a?.[0];
const fadeX = (from: string, to: string) => `linear-gradient(90deg, ${from}, ${to})`;

// ---------------------------------------------------------------- hero

function HeroLayers() {
  const { w, h, env, anchors } = useBg();
  const core = first(anchors.core) ?? { cx: w * 0.72, cy: h * 0.5, w: Math.min(w, h) * 0.5, h: 0, x: 0, y: 0 };
  const R = core.w * 0.46;
  const c: Pt = [core.cx, core.cy];
  const routes = useMemo(() => {
    const starts: Pt[] =
      env.tier === 'mobile'
        ? [
            [-4, c[1] + R * 0.25],
            [w + 4, c[1] - R * 0.35],
            [c[0] + R * 0.2, h + 4],
          ]
        : [
            [w + 4, c[1] - R * 0.62],
            [w + 4, c[1] + R * 0.4],
            [c[0] - R * 0.15, -4], // clear of the header CTA
            [c[0] - R * 0.4, h + 4],
            [c[0] + R * 0.75, h + 4],
          ];
    return convergingRoutes(starts, c, R * 1.04);
  }, [w, h, c[0], c[1], R, env.tier]);
  const nodes: Node[] = routes.map((t) => ({ p: t.pts[1], s: 0.9 }));
  return (
    <>
      <RadialGlow x={c[0]} y={c[1]} size={core.w * 1.6} opacity={0.1} breathe={11} pointer depth={0.3} />
      <CircuitLines traces={routes} opacity={0.15} draw depth={0.6} />
      <DataPulse traces={env.tier === 'mobile' ? routes.slice(0, 1) : routes} speed={170} every={6.5} depth={0.6} />
      <NetworkNodes nodes={nodes} opacity={0.5} depth={0.6} />
      <AmbientParticles count={{ desktop: 20, tablet: 10, mobile: 0 }} region={[w * 0.42, 0, w, h]} seed={3} />
    </>
  );
}

// ---------------------------------------------------------------- framework strip

function StripLayers() {
  const { animate, env } = useBg();
  return (
    <>
      <TechnicalGrid size={28} opacity={0.045} mask={fadeX('transparent', '#000 30%, #000 70%, transparent')} />
      <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(59,130,246,0.22)_20%,rgba(59,130,246,0.22)_80%,transparent)]" />
      {animate && env.tier !== 'mobile' && (
        <div className="bg-dataline-pulse absolute bottom-0 left-0 h-px w-[22vw] bg-[linear-gradient(90deg,transparent,rgba(125,211,252,0.85),transparent)]" />
      )}
    </>
  );
}

// ---------------------------------------------------------------- build / run / secure pillars

function PillarsLayers() {
  const { w, h, env, anchors } = useBg();
  const grid = first(anchors.pillars) ?? { x: 0, y: h * 0.3, w, h: h * 0.6, cx: w / 2, cy: h * 0.6 };
  const secure = first(anchors.secure) ?? { x: w * 0.68, y: grid.y, w: w * 0.3, h: grid.h, cx: w * 0.83, cy: grid.cy };
  const stacked = env.tier !== 'desktop';
  const ringR = stacked ? Math.min(secure.w, secure.h) * 0.5 : secure.w * 0.52;
  // Build -> connect -> deploy: lanes run left to right and feed into the Secure ring.
  const { flows, modules } = useMemo(() => {
    const top = stacked ? grid.y + 20 : grid.y + grid.h * 0.2;
    const bottom = stacked ? secure.y - 40 : grid.y + grid.h * 0.8;
    const lanes = [top, (top + bottom) / 2, bottom];
    return horizontalFlows({ lanes, x0: -10, x1: stacked ? w + 10 : secure.cx - ringR * 0.98, seed: 11 });
  }, [w, h, grid.y, grid.h, secure.x, secure.cx, secure.y, ringR, stacked]);
  const gridMask = stacked
    ? `linear-gradient(180deg, transparent, #000 15%, #000 ${Math.round(((secure.y - 40) / h) * 100)}%, transparent ${Math.round((secure.y / h) * 100)}%)`
    : fadeX('transparent', `#000 10%, #000 ${Math.round((secure.x / w) * 100) - 8}%, transparent ${Math.round((secure.x / w) * 100)}%`);
  return (
    <>
      <TechnicalGrid size={48} opacity={0.05} mask={gridMask} />
      <CircuitLines traces={flows} opacity={0.2} draw />
      <NetworkNodes nodes={modules.map((p) => ({ p, square: true, s: 0.9 }))} opacity={0.55} />
      <DataPulse traces={env.tier === 'mobile' ? flows.slice(1, 2) : flows} speed={190} every={8} intensity={1.15} />
      <SecurityRings c={[secure.cx, secure.cy]} r={ringR} opacity={0.15} scanPeriod={26} pulseEvery={7.5} />
    </>
  );
}

// ---------------------------------------------------------------- services (connected system)

function NetworkLayers() {
  const { w, h, env } = useBg();
  const count = byTier(env.tier, { desktop: 9, tablet: 6, mobile: 4 });
  const traces = useMemo(() => routedTraces(w, h, { count, seed: 21, hex: 30 }), [w, h, count]);
  const nodes: Node[] = traces.flatMap((t) => [{ p: t.pts[0] }, { p: t.pts[t.pts.length - 1], s: 0.8 }]);
  return (
    <>
      <HexGrid r={30} opacity={0.06} reveal mask="radial-gradient(ellipse 70% 65% at 62% 45%, #000 20%, transparent 75%)" />
      <RadialGlow x={w * 0.7} y={h * 0.32} size={Math.max(w, h) * 0.55} opacity={0.08} breathe={12} pointer />
      <CircuitLines traces={traces} opacity={0.12} draw />
      <NetworkNodes nodes={nodes} opacity={0.42} />
      <DataPulse traces={traces.filter((_, i) => i % 3 === 0)} speed={140} every={8.5} />
    </>
  );
}

// ---------------------------------------------------------------- metrics

function MetricsLayers() {
  const { w, h } = useBg();
  return (
    <>
      {/* Glow rises a little the first time the section is reached (bg-reveal), then drifts slowly. */}
      <div className="bg-reveal absolute inset-0">
        <RadialGlow x={w * 0.5} y={h * 0.62} size={Math.max(w * 0.7, h)} opacity={0.08} breathe={0} drift={34} />
      </div>
      <AmbientParticles count={{ desktop: 10, tablet: 6, mobile: 0 }} mode="up" seed={7} opacity={0.8} />
    </>
  );
}

// ---------------------------------------------------------------- industries (cards carry their own motifs)

function IndustriesLayers() {
  const { w, h } = useBg();
  return (
    <>
      <HexGrid r={34} opacity={0.04} mask="radial-gradient(ellipse 60% 55% at 50% 60%, #000 10%, transparent 75%)" />
      <RadialGlow x={w * 0.5} y={h * 0.62} size={Math.max(w * 0.6, h * 0.8)} opacity={0.06} breathe={14} />
    </>
  );
}

// ---------------------------------------------------------------- process (scroll-driven)

function ProcessLayers() {
  const { w, h, env, anchors, animate } = useBg();
  const col = first(anchors['panel-col']);
  const steps = anchors.step ?? [];
  const list = first(anchors.steps);
  const desktop = env.tier === 'desktop' && col && list && steps.length > 1;
  const busRef = useRef<SVGLineElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const tapsRef = useRef<SVGGElement>(null);

  // Bus: a vertical trace in the gutter between the diagram column and the steps,
  // spanning the list exactly like the scroll progress does, with a tap into each
  // step marker (so a tap lights just as its step activates).
  const busX = list ? list.x - 30 : 0;
  const busTop = list ? list.y : 0;
  const busBottom = list ? list.y + list.h : 0;
  const busLen = Math.max(1, busBottom - busTop);

  useEffect(() => {
    if (!desktop) return;
    const section = (busRef.current?.closest('.sbg') as HTMLElement | null)?.parentElement;
    const ol = section?.querySelector('[data-bg-anchor="steps"]');
    if (!ol) return;
    const apply = (p: number) => {
      busRef.current?.style.setProperty('transform', `scaleY(${p.toFixed(4)})`);
      headRef.current?.style.setProperty('transform', `translateY(${(p * busLen).toFixed(1)}px)`);
      tapsRef.current?.querySelectorAll<SVGElement>('[data-at]').forEach((el) => {
        const lit = p * busLen >= Number(el.dataset.at) - 2;
        if ((el.dataset.lit === '1') !== lit) el.dataset.lit = lit ? '1' : '0';
      });
    };
    const st = ScrollTrigger.create({ trigger: ol, start: 'top 62%', end: 'bottom 62%', onUpdate: (s) => apply(s.progress), onRefresh: (s) => apply(s.progress) });
    apply(st.progress);
    return () => st.kill();
  }, [desktop, busLen]);

  // Large, quiet construction diagram centred on the left column.
  const dc: Pt = col ? [col.cx, col.y + Math.min(col.h, 900) * 0.36] : [w * 0.3, h * 0.45];
  const R = Math.min(520, Math.max(260, (col?.w ?? w * 0.4) * 0.95));
  const diagram = (
    <svg className="bg-layer bg-parallax-only bg-reveal absolute inset-0" style={{ ['--depth' as string]: 0.7 } as CSSProperties} width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <g stroke="rgba(59,130,246,0.07)" strokeWidth={1}>
        <circle cx={dc[0]} cy={dc[1]} r={R} />
        <circle cx={dc[0]} cy={dc[1]} r={R * 0.66} strokeDasharray="3 7" />
        <circle cx={dc[0]} cy={dc[1]} r={R * 0.36} />
        <path d={hexagon(dc[0], dc[1], R * 1.18)} />
        <path d={`M${dc[0] - R * 1.3} ${dc[1]}H${dc[0] + R * 1.3}M${dc[0]} ${dc[1] - R * 1.3}V${dc[1] + R * 1.3}`} strokeDasharray="2 10" />
        <path d={`M${dc[0] - R} ${dc[1] - R}L${dc[0] + R} ${dc[1] + R}M${dc[0] + R} ${dc[1] - R}L${dc[0] - R} ${dc[1] + R}`} strokeDasharray="1 12" />
      </g>
    </svg>
  );

  return (
    <>
      <TechnicalGrid size={64} opacity={0.055} depth={0.4} mask="linear-gradient(180deg, transparent, #000 12%, #000 88%, transparent)" />
      {diagram}
      {desktop && (
        <svg className="bg-layer absolute inset-0" width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
          {/* dim bus + taps */}
          <path d={`M${busX} ${busTop}V${busBottom}`} stroke="rgba(59,130,246,0.14)" strokeWidth={1} />
          <g ref={tapsRef}>
            {steps.map((s, i) => {
              const at = s.cy - busTop;
              const d = toD([
                [busX, s.cy],
                [s.x - 8, s.cy],
              ]);
              return (
                <g key={i} data-at={at.toFixed(1)} className="bg-tap">
                  <path d={d} strokeWidth={1} className="bg-tap-line" />
                  <circle cx={busX} cy={s.cy} r={3} className="bg-tap-node" />
                </g>
              );
            })}
          </g>
          {/* lit progress */}
          <line
            ref={busRef}
            x1={busX}
            y1={busTop}
            x2={busX}
            y2={busBottom}
            stroke="rgba(56,189,248,0.55)"
            strokeWidth={1.2}
            style={{ transformOrigin: `${busX}px ${busTop}px`, transformBox: 'view-box', transform: 'scaleY(0)' }}
          />
          {animate && (
            <g ref={headRef} style={{ transform: 'translateY(0px)' }}>
              <circle cx={busX} cy={busTop} r={9} fill="rgba(56,189,248,0.12)" />
              <circle cx={busX} cy={busTop} r={2.6} fill="rgb(186,230,253)" />
            </g>
          )}
        </svg>
      )}
      <AmbientParticles count={{ desktop: 12, tablet: 6, mobile: 0 }} seed={5} opacity={0.8} />
    </>
  );
}

// ---------------------------------------------------------------- security operations (monitoring)

function MonitorLayers() {
  const { w, h, env } = useBg();
  const n = byTier(env.tier, { desktop: 14, tablet: 9, mobile: 6 });
  const nodes = useMemo(() => scatter(w, h, n, 31, Math.min(w, h) * 0.16), [w, h, n]);
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
  const c: Pt = [w / 2, h * 0.58];
  return (
    <>
      <RadialGlow x={c[0]} y={c[1]} size={Math.min(w, h * 1.4)} opacity={0.09} breathe={12} />
      <NetworkNodes nodes={nodes.map((p) => ({ p, s: 0.9 }))} links={links} linkOpacity={0.07} opacity={0.36} events={env.tier === 'mobile' ? 1 : 4} />
      <SecurityRings c={c} r={Math.min(w * 0.36, h * 0.42)} opacity={0.11} perimeter={false} scanPeriod={24} pulseEvery={8} />
    </>
  );
}

// ---------------------------------------------------------------- secure coding split

function SplitLayers() {
  const { w, h, env, anchors } = useBg();
  const build = first(anchors['build-card']);
  const secure = first(anchors['secure-card']);
  const stacked = !build || !secure || Math.abs(build.cy - secure.cy) > 40;
  const ring: Pt = secure && !stacked ? [secure.cx, secure.cy] : [w / 2, h * 0.78];
  const ringR = stacked ? Math.min(w * 0.42, h * 0.2) : Math.min(secure!.w * 0.48, h * 0.42);
  const meet: Pt = stacked ? [w / 2, h * 0.5] : [w / 2, h / 2];
  const { flows, modules } = useMemo(() => {
    const top = stacked ? h * 0.12 : (build?.y ?? h * 0.2) + 30;
    const bottom = stacked ? h * 0.42 : (build ? build.y + build.h - 30 : h * 0.8);
    const lanes = [top, (top + bottom) / 2, bottom];
    return horizontalFlows({ lanes, x0: -10, x1: stacked ? w * 0.7 : meet[0] - 60, seed: 41 });
  }, [w, h, stacked, build?.y, build?.h, meet[0]]);
  // Each flow converges on the meeting point, then one trace runs into the security rings.
  const converge: Trace[] = flows.map((f) => {
    const end = f.pts[f.pts.length - 1];
    return convergingRoutes([end], meet, 6)[0];
  });
  const bridge: Trace = { pts: [meet, ring], d: toD([meet, ring]) };
  const handoff: Trace[] = flows.map((f, i) => {
    const pts = [...f.pts, ...converge[i].pts.slice(1), ring];
    return { pts, d: toD(pts) };
  });
  return (
    <>
      <TechnicalGrid size={48} opacity={0.045} mask={stacked ? 'linear-gradient(180deg,#000,transparent 55%)' : fadeX('#000 10%', 'transparent 52%')} />
      <CircuitLines traces={[...flows, ...converge, bridge]} opacity={0.12} />
      <NetworkNodes nodes={[...modules.map((p) => ({ p, square: true, s: 0.85 })), { p: meet, s: 1.2 }]} opacity={0.4} />
      <SecurityRings c={ring} r={ringR} opacity={0.12} scanPeriod={22} pulseEvery={7} />
      <svg className="bg-layer absolute inset-0" width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        {/* shield-like hexagonal geometry inside the rings */}
        <path d={hexagon(ring[0], ring[1], ringR * 0.3)} stroke="rgba(56,189,248,0.16)" strokeWidth={1} className="bg-reveal" />
      </svg>
      {/* Every few seconds one pulse travels from the build side into the rings. */}
      <DataPulse traces={env.tier === 'mobile' ? handoff.slice(1, 2) : handoff.slice(0, 2)} speed={200} every={9} seed={2} />
    </>
  );
}

// ---------------------------------------------------------------- certifications (very low)

function BlueprintLayers() {
  const { w, h, animate } = useBg();
  const diag = [0.15, 0.55, 0.9].map((f) => {
    const x = w * f;
    return `M${x - h * 0.58} ${h}L${x + h * 0.58} 0`;
  });
  return (
    <>
      <TechnicalGrid size={40} opacity={0.045} mask="radial-gradient(ellipse 75% 70% at 50% 50%, #000 30%, transparent 80%)" />
      <svg className="bg-layer absolute inset-0" width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        {diag.map((d, i) => (
          <path key={i} d={d} stroke="rgba(59,130,246,0.06)" strokeWidth={1} strokeDasharray="1 9" />
        ))}
      </svg>
      {animate && <LightSweep every={13} opacity={0.04} />}
    </>
  );
}

// ---------------------------------------------------------------- FAQ (minimal)

function MinimalLayers() {
  const { w, h } = useBg();
  return (
    <>
      <svg className="bg-layer absolute inset-0" width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        <path d={hexagon(w * 0.82, h * 0.42, Math.max(h * 0.55, 320))} stroke="rgba(59,130,246,0.05)" strokeWidth={1} />
        <path d={hexagon(w * 0.82, h * 0.42, Math.max(h * 0.36, 210))} stroke="rgba(59,130,246,0.04)" strokeWidth={1} />
        <path d={hexagon(w * 0.08, h * 0.9, Math.max(h * 0.3, 180))} stroke="rgba(59,130,246,0.035)" strokeWidth={1} />
      </svg>
      <RadialGlow x={w * 0.68} y={h * 0.45} size={Math.max(w * 0.55, h)} opacity={0.055} breathe={0} drift={52} />
    </>
  );
}

// ---------------------------------------------------------------- consultation (systems converge)

function ConsultLayers() {
  const { w, h, env, anchors } = useBg();
  const card = first(anchors.form) ?? { x: w * 0.42, y: h * 0.1, w: w * 0.5, h: h * 0.8, cx: w * 0.67, cy: h * 0.5 };
  const copy = first(anchors.copy);
  const c: Pt = [card.cx, card.cy];
  const stacked = env.tier !== 'desktop';
  const routes = useMemo(() => {
    const R = Math.max(card.w, card.h) * 0.5 + 24;
    const starts: Pt[] = stacked
      ? [
          [-4, card.y + card.h * 0.3],
          [w + 4, card.y + card.h * 0.55],
          [card.cx - card.w * 0.2, h + 4],
        ]
      : [
          [card.x + card.w * 0.15, -4],
          [card.x + card.w * 0.85, -4],
          [w + 4, card.y + card.h * 0.3],
          [w + 4, card.y + card.h * 0.75],
          [card.x + card.w * 0.3, h + 4],
          [card.x + card.w * 0.9, h + 4],
        ];
    return convergingRoutes(starts, c, R);
  }, [w, h, card.x, card.y, card.w, card.h, stacked]);
  const ambient = useMemo(
    () =>
      routedTraces(w, h, {
        count: byTier(env.tier, { desktop: 7, tablet: 5, mobile: 3 }),
        seed: 51,
        hex: 30,
        // keep the copy column calm
        keep: (pts) => !copy || pts.every(([x, y]) => x > copy.x + copy.w + 20 || y < copy.y - 20 || y > copy.y + copy.h + 20),
      }),
    [w, h, env.tier, copy?.x, copy?.w, copy?.y, copy?.h],
  );
  const nodes: Node[] = [...routes, ...ambient].map((t) => {
    const p = t.pts[1] ?? t.pts[0];
    const dx = c[0] - p[0];
    const dy = c[1] - p[1];
    const l = Math.hypot(dx, dy) || 1;
    return { p, s: 0.9, drift: [(dx / l) * 5, (dy / l) * 5] as Pt };
  });
  const ringR = Math.max(card.w, card.h) * 0.62;
  return (
    <>
      <HexGrid r={30} opacity={0.06} mask="radial-gradient(ellipse 75% 70% at 62% 50%, #000 25%, transparent 78%)" />
      <RadialGlow x={c[0]} y={c[1]} size={Math.max(card.w, card.h) * 1.3} opacity={0.12} breathe={10} pointer />
      <svg className="bg-layer absolute inset-0" width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        {/* very slow expanding radial rings around the form */}
        {[0, 6].map((delay) => (
          <circle
            key={delay}
            cx={c[0]}
            cy={c[1]}
            r={ringR}
            stroke="rgba(56,189,248,0.16)"
            strokeWidth={1}
            className={env.reduced ? '' : 'bg-expand'}
            style={{ transformOrigin: `${c[0]}px ${c[1]}px`, transformBox: 'view-box', animationDelay: `${-delay}s`, opacity: env.reduced ? 0.25 : undefined }}
          />
        ))}
      </svg>
      <CircuitLines traces={[...ambient, ...routes]} opacity={0.14} draw />
      <NetworkNodes nodes={nodes} opacity={0.45} />
      <DataPulse traces={env.tier === 'mobile' ? routes.slice(0, 1) : routes.filter((_, i) => i % 2 === 0)} speed={160} every={7} />
      <AmbientParticles count={{ desktop: 14, tablet: 8, mobile: 4 }} mode="inward" center={c} seed={9} />
    </>
  );
}

// ---------------------------------------------------------------- footer (almost static)

function FooterLayers() {
  const { w, h } = useBg();
  return (
    <>
      <HexGrid r={26} opacity={0.035} mask="linear-gradient(180deg, transparent, #000 40%, #000)" />
      <RadialGlow x={w * 0.2} y={h * 0.3} size={Math.max(w * 0.4, h * 1.2)} opacity={0.05} breathe={0} />
      <AmbientParticles count={{ desktop: 3, tablet: 2, mobile: 0 }} seed={13} opacity={0.7} />
    </>
  );
}

export const VARIANTS: Record<Variant, VariantSpec> = {
  hero: { Component: HeroLayers, parallax: 34, pointer: 16, afterCore: true },
  strip: { Component: StripLayers },
  pillars: { Component: PillarsLayers },
  network: { Component: NetworkLayers, pointer: 14 },
  metrics: { Component: MetricsLayers },
  industries: { Component: IndustriesLayers },
  process: { Component: ProcessLayers, parallax: 36 },
  monitor: { Component: MonitorLayers },
  split: { Component: SplitLayers },
  blueprint: { Component: BlueprintLayers },
  minimal: { Component: MinimalLayers },
  consult: { Component: ConsultLayers, pointer: 16 },
  footer: { Component: FooterLayers },
  'page-build': { Component: PageHeroBuild, parallax: 24 },
  'page-network': { Component: PageHeroNetwork, parallax: 24 },
  'page-process': { Component: PageHeroProcess, parallax: 24 },
  'page-secure': { Component: PageHeroSecure, parallax: 24 },
  'page-calm': { Component: PageHeroCalm, parallax: 16 },
  build: { Component: BuildLayers },
  secure: { Component: SecureLayers },
  testimonials: { Component: TestimonialsLayers },
  timeline: { Component: TimelineLayers, parallax: 30 },
  cta: { Component: CtaLayers },
};
