import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import { hexagon, toD, type Pt } from '../backgrounds/geometry';
import { INK, arc } from '../page/Diagram';

gsap.registerPlugin(ScrollTrigger);

/**
 * The technical path between the Build & Run and Secure & Comply groups. It sits
 * on the boundary between the two sections (inside their padding): build flows
 * come in from the left, merge into a gateway hexagon on the boundary, rings
 * open around it, a chain of hexagonal cells runs right, and one trace drops
 * into the security section. Drawn with the scroll (scrubbed), never pinned.
 * Reduced motion: shown fully drawn, nothing moves.
 */

const VW = 1200;
const VH = 220;
const G: Pt = [600, 110]; // gateway, on the section boundary
const GR = 18;
const GX = G[0] - GR * Math.cos(Math.PI / 6); // left flat side of the gateway

const LANES: Pt[][] = [46, 66, 86].map((y) => {
  const run = G[1] - y; // 45° into the gateway
  return [[0, y], [GX - run, y], [GX, G[1]]];
});
const CHAIN_X = [700, 790, 880, 970];
const CHAIN: Pt[] = [[G[0] + GR * Math.cos(Math.PI / 6), G[1]], [VW, G[1]]];
const DROP: Pt[] = [[G[0], G[1] + GR], [G[0], VH - 6]];

/** Scrubbed segment: drawn between `at` and `at + dur` of the scroll progress (0..1). */
const seg = (at: number, dur: number) => ({ 'data-seg': '', 'data-at': at, 'data-dur': dur, pathLength: 1, strokeDasharray: '1 1' });
/** Element faded in at `at`. */
const fade = (at: number) => ({ 'data-fade': '', 'data-at': at });

export function GroupConnector() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root, start: 'top 82%', end: 'bottom 40%', scrub: 0.4 },
      });
      gsap.utils.toArray<SVGElement>('[data-seg]').forEach((el) => {
        tl.fromTo(el, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: Number(el.dataset.dur) }, Number(el.dataset.at));
      });
      gsap.utils.toArray<SVGElement>('[data-fade]').forEach((el) => {
        tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.1 }, Number(el.dataset.at));
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const laneStroke = 'url(#svc-conn-lane)';
  const chainStroke = 'url(#svc-conn-chain)';

  return (
    <div aria-hidden="true" className="pointer-events-none relative z-[1] h-0">
      <div ref={ref} className="absolute inset-x-0 top-0 -translate-y-1/2">
        {/* tablet and desktop: the full hand-off */}
        <div className="container-site hidden md:block">
          <svg viewBox={`0 0 ${VW} ${VH}`} fill="none" className="block h-auto w-full overflow-visible">
            <defs>
              <linearGradient id="svc-conn-lane" x1="0" y1="0" x2={GX} y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="rgb(59,130,246)" stopOpacity="0" />
                <stop offset="0.45" stopColor="rgb(59,130,246)" stopOpacity="0.32" />
                <stop offset="1" stopColor="rgb(56,189,248)" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="svc-conn-chain" x1={G[0]} y1="0" x2={VW} y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="rgb(56,189,248)" stopOpacity="0.5" />
                <stop offset="1" stopColor="rgb(59,130,246)" stopOpacity="0" />
              </linearGradient>
              <radialGradient id="svc-conn-glow">
                <stop offset="0" stopColor="rgb(56,189,248)" stopOpacity="0.18" />
                <stop offset="1" stopColor="rgb(56,189,248)" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* build flows */}
            {LANES.map((pts, i) => (
              <path key={i} d={toD(pts)} stroke={laneStroke} strokeWidth={1} strokeLinejoin="round" {...seg(i * 0.06, 0.4)} />
            ))}
            {LANES.map((pts, i) => (
              <rect key={`m${i}`} x={pts[1][0] - 160 - i * 40 - 4} y={pts[0][1] - 4} width={8} height={8} rx={1.5} fill={INK.fill} stroke={INK.line} strokeWidth={1} {...fade(0.08 + i * 0.06)} />
            ))}

            {/* gateway with rings opening around it */}
            <circle cx={G[0]} cy={G[1]} r={64} fill="url(#svc-conn-glow)" {...fade(0.5)} />
            {/* gaps where the flows and the chain pass */}
            <path d={arc(G, 34, 232, 545)} stroke={INK.line} strokeWidth={1} strokeDasharray="2 5" {...fade(0.55)} />
            <path d={arc(G, 52, 20, 160)} stroke={INK.line} strokeWidth={1} {...seg(0.58, 0.2)} />
            <path d={arc(G, 52, 236, 340)} stroke={INK.faint} strokeWidth={1} {...seg(0.58, 0.2)} />
            <path d={hexagon(G[0], G[1], GR)} fill={INK.fill} {...fade(0.44)} />
            <path d={hexagon(G[0], G[1], GR)} stroke={INK.strong} strokeWidth={1.2} {...seg(0.42, 0.14)} />
            <circle cx={G[0]} cy={G[1]} r={3} fill={INK.node} {...fade(0.56)} />

            {/* hexagonal chain on the security side */}
            <path d={toD(CHAIN)} stroke={chainStroke} strokeWidth={1} {...seg(0.6, 0.32)} />
            {CHAIN_X.map((x, i) => (
              <g key={x} {...fade(0.64 + i * 0.07)}>
                <g opacity={1 - i * 0.2}>
                  <path d={hexagon(x, G[1], 8)} fill={INK.fill} stroke={INK.line} strokeWidth={1} />
                  <circle cx={x} cy={G[1]} r={1.6} fill={INK.node} opacity={0.7} />
                </g>
              </g>
            ))}

            {/* into the security section */}
            <path d={toD(DROP)} stroke={INK.line} strokeWidth={1} {...seg(0.72, 0.26)} />
            <circle cx={DROP[1][0]} cy={DROP[1][1]} r={2.4} fill={INK.node} {...fade(0.97)} />
          </svg>
        </div>

        {/* phones: one vertical trace through the gateway */}
        <svg viewBox="0 0 40 100" fill="none" className="mx-auto block h-[100px] w-10 md:hidden">
          <path d="M20 0V40" stroke={INK.line} strokeWidth={1} {...seg(0, 0.45)} />
          <path d={hexagon(20, 50, 9)} fill={INK.fill} {...fade(0.42)} />
          <path d={hexagon(20, 50, 9)} stroke={INK.strong} strokeWidth={1.2} {...seg(0.4, 0.2)} />
          <circle cx={20} cy={50} r={2} fill={INK.node} {...fade(0.55)} />
          <path d="M20 59V100" stroke={INK.line} strokeWidth={1} {...seg(0.55, 0.45)} />
        </svg>
      </div>
    </div>
  );
}
