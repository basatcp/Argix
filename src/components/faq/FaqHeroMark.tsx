import type { CSSProperties } from 'react';
import { Diagram, Dot, Hex, INK, polar } from '../page/Diagram';
import { hexagon, toD, type Pt } from '../backgrounds/geometry';

/**
 * Calm right-hand visual for the FAQ hero on desktop (where the category rail
 * below takes over navigation): very faint nested hexagon outlines, a soft light
 * and a few quiet nodes. No pulses, nothing rotates; nodes only change
 * brightness slowly. Decorative.
 */
const W = 420;
const H = 360;
const C: Pt = [W / 2, H / 2];

export function FaqHeroMark() {
  const corners = Array.from({ length: 6 }, (_, k) => polar(C, 150, -90 + k * 60));
  return (
    <Diagram w={W} h={H}>
      {(animate) => (
        <>
          <defs>
            <radialGradient id="faq-glow">
              <stop offset="0%" stopColor="rgba(30,167,255,0.12)" />
              <stop offset="100%" stopColor="rgba(30,167,255,0)" />
            </radialGradient>
          </defs>
          <circle cx={C[0]} cy={C[1]} r={170} fill="url(#faq-glow)" />
          <g className="d-reveal" style={{ ['--d' as string]: '0.1s' } as CSSProperties}>
            <Hex c={C} r={150} stroke={INK.faint} />
            <Hex c={C} r={104} stroke={INK.faint} dash="2 6" />
            <Hex c={C} r={58} stroke={INK.line} fill="rgba(14,27,44,0.6)" />
            <path d={hexagon(C[0], C[1], 18)} stroke={INK.strong} strokeWidth={1} fill="rgba(56,189,248,0.08)" />
            {corners.map((_, k) => (
              <path key={k} d={toD([polar(C, 62, -90 + k * 60), polar(C, 146, -90 + k * 60)])} stroke={INK.faint} strokeWidth={1} strokeDasharray="1 6" />
            ))}
          </g>
          {corners.map((p, k) => (
            <g key={k} className="d-reveal" style={{ ['--d' as string]: `${0.3 + k * 0.1}s` } as CSSProperties}>
              <Dot p={p} r={2.2} twinkle={animate ? 0.6 + k * 1.3 : 0} />
            </g>
          ))}
        </>
      )}
    </Diagram>
  );
}
