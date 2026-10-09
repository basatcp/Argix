import { useState, type CSSProperties } from 'react';
import { IR } from '../../data/security';
import { hexagon, toD, type Pt } from '../backgrounds/geometry';
import { Diagram, DrawPath, Hex, INK, Pulse, RingPulse, Spin, arc, polar } from '../page/Diagram';
import { PageSection } from '../page/PageSection';
import { SecurityIntro } from './SecurityIntro';

const C: Pt = [180, 180];
const R = 124;
const GAP = 12; // degrees left clear around each phase node
const N = IR.phases.length;
const angleOf = (i: number) => -90 + (i * 360) / N;

// One verification pulse runs the whole loop; each node it reaches gives a soft ring.
const SPEED = 60; // units per second
const CYCLE = 16; // seconds per lap, including the rest
const LOOP: Pt[] = Array.from({ length: 91 }, (_, k) => polar(C, R, -90 + k * 4));
const arrival = (i: number) => (2 * Math.PI * R * (i / N)) / SPEED;

/** Chevron at the end of an arc, pointing clockwise along the ring. */
function arrowHead(deg: number) {
  const tip = polar(C, R, deg);
  const t = ((deg + 90) * Math.PI) / 180; // clockwise tangent
  const wing = (s: number): Pt => {
    const a = t + Math.PI + s * 0.6;
    return [tip[0] + Math.cos(a) * 6, tip[1] + Math.sin(a) * 6];
  };
  return toD([wing(1), tip, wing(-1)]);
}

const num = (i: number) => String(i + 1).padStart(2, '0');

/**
 * The response lifecycle as a closed ring: five numbered phase nodes, arcs
 * between them, and the arc from the review back into preparation that closes
 * the loop. A verification pulse travels the loop and each node answers with
 * a soft ring; the node of the phase card under the pointer gets a halo.
 * Reduced motion: the static ring, fully drawn.
 */
function IncidentCycle({ hover }: { hover: number | null }) {
  const nodes = IR.phases.map((_, i) => polar(C, R, angleOf(i)));
  const arcs = IR.phases.map((_, i) => {
    const a0 = angleOf(i) + GAP;
    const a1 = angleOf(i + 1) - GAP;
    return { d: arc(C, R, a0, a1), head: arrowHead(a1) };
  });
  const fade = { transition: 'opacity 400ms cubic-bezier(0.22,1,0.36,1)' } as CSSProperties;
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = i * 6;
    return toD([polar(C, 146, a), polar(C, i % 5 === 0 ? 152 : 149, a)]);
  }).join('');

  return (
    <Diagram w={360} h={360}>
      {(animate) => (
        <>
          {/* Lead-in from the Preparation card above the ring (bridges the grid gap; the svg overflows) */}
          <DrawPath pts={[[C[0], -23], [C[0], C[1] - R - 17]]} stroke={INK.line} />
          <circle cx={C[0]} cy={C[1]} r={168} stroke={INK.faint} strokeWidth={1} strokeDasharray="2 6" className="d-reveal" />
          <path d={ticks} stroke={INK.line} strokeWidth={1} className="d-reveal" style={{ ['--d' as string]: '0.2s' } as CSSProperties} />
          <circle cx={C[0]} cy={C[1]} r={52} stroke={INK.faint} strokeWidth={1} strokeDasharray="2 5" />
          <DrawPath d={arc(C, 76, -90, 269.9)} stroke={INK.line} delay={0.2} />

          {/* Radial links from the core to each phase */}
          {nodes.map((_, i) => (
            <path key={i} d={toD([polar(C, 34, angleOf(i)), polar(C, R - 18, angleOf(i))])} stroke={INK.line} strokeWidth={1} />
          ))}

          {/* Ring arcs, drawn in one after another; the last one closes the loop */}
          {arcs.map((a, i) => (
            <g key={i}>
              <DrawPath d={a.d} stroke={INK.strong} width={1.4} delay={0.3 + i * 0.14} />
              <path d={a.head} stroke={INK.node} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" className="d-reveal" style={{ ['--d' as string]: `${0.9 + i * 0.14}s` } as CSSProperties} />
            </g>
          ))}

          {animate && (
            <>
              <Spin c={C} period={30}>
                <path d={arc(C, 76, -90, -30)} stroke={INK.strong} strokeWidth={1.4} strokeLinecap="round" />
              </Spin>
              {/* Under the nodes, so the pulse passes through each phase */}
              <Pulse pts={LOOP} cycle={CYCLE} speed={SPEED} tail={44} />
              {nodes.map((p, i) => (
                <RingPulse key={i} c={p} r={26} every={CYCLE} delay={(CYCLE - arrival(i)) % CYCLE} />
              ))}
            </>
          )}

          {/* Core */}
          <Hex c={C} r={30} stroke={INK.strong} fill={INK.fill} />
          <Hex c={C} r={16} stroke={INK.line} dash="2 3" />
          <circle cx={C[0]} cy={C[1]} r={3.2} fill={INK.node} />

          {/* Numbered phase nodes */}
          {nodes.map((p, i) => (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r={24} stroke="rgba(56,189,248,0.55)" strokeWidth={1} style={{ ...fade, opacity: hover === i ? 1 : 0 }} />
              <path d={hexagon(p[0], p[1], 17)} stroke={INK.strong} strokeWidth={1} fill="rgb(10,20,36)" />
              <text
                x={p[0]}
                y={p[1]}
                textAnchor="middle"
                dominantBaseline="central"
                fill={INK.node}
                fontSize={11}
                fontWeight={600}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {num(i)}
              </text>
            </g>
          ))}
        </>
      )}
    </Diagram>
  );
}

/** The phase number in a small hexagon, matching the ring's nodes. */
function PhaseMark({ i }: { i: number }) {
  return (
    <span aria-hidden="true" className="relative flex h-9 w-9 shrink-0 items-center justify-center">
      <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full" fill="none">
        <path
          d={hexagon(18, 18, 17)}
          fill="rgb(10,20,36)"
          stroke="currentColor"
          className="text-electric/60 transition-colors duration-300 group-hover:text-cyan"
        />
      </svg>
      <span className="relative text-[11px] font-semibold tabular-nums text-cyan">{num(i)}</span>
    </span>
  );
}

/**
 * Where each phase sits around the ring from 1024px up (DOM order stays
 * 1 to 5): preparation above it, then clockwise down the right side and back
 * up the left, next to the matching node.
 */
const PLACE = [
  'lg:col-start-2 lg:row-start-1',
  'lg:col-start-3 lg:row-start-2 lg:self-center',
  'lg:col-start-3 lg:row-start-3 lg:self-center',
  'lg:col-start-1 lg:row-start-3 lg:self-center',
  'lg:col-start-1 lg:row-start-2 lg:self-center',
];

/**
 * 05 Incident response: the lifecycle as a cycle. From 1024px up the five
 * phases sit around a ring diagram at their own nodes; below that they are a
 * simple numbered list. Nothing is scroll-linked.
 */
export function IncidentResponse() {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <PageSection id="incident-response" labelledBy="ir-title" background="timeline" className="lg:!scroll-mt-[60px]">
      <SecurityIntro id="ir-title" eyebrow={IR.eyebrow} title={IR.title} lead={IR.lead} align="center" />

      <div className="mt-12 lg:mt-16 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)_minmax(0,1fr)] lg:grid-rows-[auto_1fr_1fr] lg:gap-x-10 lg:gap-y-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)_minmax(0,1fr)] xl:gap-x-14">
        <div aria-hidden="true" className="hidden lg:col-start-2 lg:row-span-2 lg:row-start-2 lg:block lg:self-start">
          <IncidentCycle hover={hover} />
        </div>

        {/* A subgrid, so the cards share the ring's columns and rows. */}
        <ol className="grid gap-4 lg:col-span-3 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:grid-cols-subgrid lg:grid-rows-subgrid lg:gap-x-10 lg:gap-y-5 xl:gap-x-14">
          {IR.phases.map((p, i) => (
            <li
              key={p.title}
              data-reveal
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className={`card group p-5 transition-colors duration-300 hover:border-electric/45 hover:bg-card sm:p-6 ${PLACE[i]}`}
            >
              <div className="flex items-center gap-3.5">
                <PhaseMark i={i} />
                <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-text md:text-[19px]">
                  <span className="sr-only">Phase {i + 1}: </span>
                  {p.title}
                </h3>
              </div>
              <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{p.text}</p>
              {i === N - 1 && (
                <p className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-[13.5px] text-muted">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-cyan" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4.5h-4.5" />
                  </svg>
                  {IR.loopNote}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </PageSection>
  );
}
