import { pad2 } from '../../lib/format';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { FLOW_LOOP_NOTE, FLOW_STAGES } from '../../data/services';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import { hexagon, toD, type Pt } from '../backgrounds/geometry';
import { Icon } from '../Icons';
import { Diagram, INK, Pulse } from '../page/Diagram';

/**
 * BUILD -> SECURE -> TEST -> DEPLOY -> MONITOR as one horizontal technical flow:
 * hexagonal stage nodes on a line, a pulse travelling along it, a dashed return
 * path from MONITOR back to BUILD (a continuous loop). On first view the line
 * lights up and the stages light in sequence, once. Stage names and
 * descriptions are real HTML text under the diagram. Vertical below lg.
 * Reduced motion: everything is shown lit, nothing moves.
 */

const VW = 1000;
const VH = 210;
const Y = 150; // main line
const TOP = 34; // return path
const R = 44;
const XS = FLOW_STAGES.map((_, i) => 100 + i * 200);
const STEP = 0.5; // seconds between stages lighting up
const LINE_DUR = STEP * (FLOW_STAGES.length - 1);

const first = XS[0];
const last = XS[XS.length - 1];
const RETURN: Pt[] = [
  [last, Y - R],
  [last, TOP + 24],
  [last - 24, TOP],
  [first + 24, TOP],
  [first, TOP + 24],
  [first, Y - R - 8],
];
const LOOP: Pt[] = [[first, Y], [last, Y], [last, TOP + 24], [last - 24, TOP], [first + 24, TOP], [first, TOP + 24], [first, Y]];

const delay = (i: number) => ({ transitionDelay: `${(i * STEP).toFixed(2)}s` }) as CSSProperties;
const ease = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

/** Lights the flow the first time most of it is on screen (immediately for reduced motion). */
function useLitOnce<T extends Element>() {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(prefersReducedMotion);
  useEffect(() => {
    const el = ref.current;
    if (on || !el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -22% 0px', threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [on]);
  return { ref, on };
}

function StageNode({ x, i, on, icon }: { x: number; i: number; on: boolean; icon: (typeof FLOW_STAGES)[number]['icon'] }) {
  const lit = `transition-opacity duration-700 ${ease} ${on ? 'opacity-100' : 'opacity-0'}`;
  return (
    <g>
      <circle cx={x} cy={Y} r={R + 18} fill="url(#svc-flow-glow)" className={lit} style={delay(i)} />
      <path d={hexagon(x, Y, R)} fill={INK.fill} stroke={INK.line} strokeWidth={1} />
      <path d={hexagon(x, Y, R)} stroke={INK.strong} strokeWidth={1.4} className={lit} style={delay(i)} />
      <path d={hexagon(x, Y, R - 9)} stroke={INK.faint} strokeWidth={1} strokeDasharray="2 5" />
      {/* icon: dim until lit */}
      <Icon name={icon} x={x - 13} y={Y - 13} width={26} height={26} className="text-muted" opacity={0.55} />
      <Icon name={icon} x={x - 13} y={Y - 13} width={26} height={26} className={`text-cyan ${lit}`} style={delay(i)} />
    </g>
  );
}

export function IntegratedFlow() {
  const { ref, on } = useLitOnce<HTMLDivElement>();

  return (
    <div ref={ref} className="relative">
      {/* ---- desktop diagram ---- */}
      <div className="relative hidden lg:block">
        <Diagram w={VW} h={VH}>
          {(animate) => (
            <>
              <defs>
                <radialGradient id="svc-flow-glow">
                  <stop offset="0" stopColor="rgb(56,189,248)" stopOpacity="0.2" />
                  <stop offset="1" stopColor="rgb(56,189,248)" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* return path: monitoring feeds the next build */}
              <path d={toD(RETURN)} stroke={INK.line} strokeWidth={1} strokeDasharray="3 6" strokeLinejoin="round" className="d-reveal" style={{ ['--d' as string]: '0.4s' } as CSSProperties} />
              <path d={`M${first - 5} ${Y - R - 13}l5 5 5-5`} stroke={INK.strong} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="d-reveal" />
              {/* main line, then its lit overlay drawn stage by stage */}
              <path d={toD([[first, Y], [last, Y]])} stroke={INK.line} strokeWidth={1} />
              <path
                d={toD([[first, Y], [last, Y]])}
                pathLength={1}
                stroke={INK.strong}
                strokeWidth={1.4}
                strokeDasharray="1 1"
                style={{ strokeDashoffset: on ? 0 : 1, transition: `stroke-dashoffset ${LINE_DUR}s linear` }}
              />
              {/* direction marks between stages */}
              {XS.slice(0, -1).map((x) => (
                <path key={x} d={`M${x + 96} ${Y - 5}l5 5-5 5`} stroke={INK.strong} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
              ))}
              {animate && <Pulse pts={LOOP} cycle={11} speed={170} tail={30} width={1.6} delay={1.5} />}
              {FLOW_STAGES.map((s, i) => (
                <StageNode key={s.key} x={XS[i]} i={i} on={on} icon={s.icon} />
              ))}
            </>
          )}
        </Diagram>
        {/* label on the return path (HTML so it is real, readable text) */}
        <p
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-line bg-ink-900 px-4 py-1.5 text-[13px] font-medium text-[#C9D3E0]"
          style={{ top: `${(TOP / VH) * 100}%` }}
        >
          <Icon name="activity" className="mr-2 inline h-3.5 w-3.5 -translate-y-px text-cyan" />
          {FLOW_LOOP_NOTE}
        </p>
      </div>

      {/* ---- stages: under the diagram on desktop, a vertical flow below lg ---- */}
      <div className="relative mx-auto max-w-[560px] lg:mt-2 lg:max-w-none">
        {/* vertical line through the badges (below lg) */}
        <span aria-hidden="true" className="absolute bottom-7 left-7 top-7 w-px bg-line lg:hidden" />
        <span
          aria-hidden="true"
          className={`absolute bottom-7 left-7 top-7 w-px origin-top bg-gradient-to-b from-cyan to-primary lg:hidden ${on ? 'scale-y-100' : 'scale-y-0'}`}
          style={{ transition: `transform ${LINE_DUR}s linear` }}
        />
        <ol className="grid gap-0 lg:grid-cols-5">
          {FLOW_STAGES.map((s, i) => (
            <li key={s.key} className="relative flex gap-5 pb-8 last:pb-0 lg:block lg:px-3 lg:pb-0 lg:text-center">
              {/* badge (below lg) */}
              <span aria-hidden="true" className="relative flex h-14 w-14 shrink-0 items-center justify-center lg:hidden">
                <svg viewBox="0 0 56 56" fill="none" className="absolute inset-0 h-full w-full">
                  <path d={hexagon(28, 28, 26)} fill={INK.fill} stroke={INK.line} strokeWidth={1} />
                  <path d={hexagon(28, 28, 26)} stroke={INK.strong} strokeWidth={1.4} className={`transition-opacity duration-700 ${on ? 'opacity-100' : 'opacity-0'}`} style={delay(i)} />
                </svg>
                <Icon name={s.icon} className={`relative h-5 w-5 transition-colors duration-700 ${on ? 'text-cyan' : 'text-muted'}`} style={delay(i)} />
              </span>
              <div className="pt-1 lg:pt-0">
                <p className={`text-xs font-semibold tracking-[0.16em] transition-colors duration-700 ${on ? 'text-cyan' : 'text-muted'}`} style={delay(i)}>
                  {pad2(i + 1)}
                </p>
                <h3 className="mt-1.5 text-[15px] font-semibold uppercase tracking-[0.16em] text-text">{s.label}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted lg:mx-auto lg:max-w-[212px]">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* the loop, said in words (below lg) */}
      <p className="mx-auto mt-8 flex max-w-[560px] items-center gap-3 rounded-xl border border-dashed border-line px-4 py-3.5 text-[14px] text-[#C9D3E0] lg:hidden">
        <Icon name="activity" className="h-4 w-4 shrink-0 text-cyan" />
        {FLOW_LOOP_NOTE}
      </p>
    </div>
  );
}
