import type { CSSProperties } from 'react';

/**
 * Soft radial light. Breathes slowly (opacity/scale only, compositor), can
 * follow the pointer a few px (CSS vars set by the motion hub, eased by a CSS
 * transition) and can drift sideways very slowly.
 */
export function RadialGlow({
  x,
  y,
  size,
  opacity = 0.16,
  color = '59,130,246',
  breathe = 10,
  pointer = false,
  drift = 0,
  depth = 0,
  className = '',
}: {
  /** Centre in px. */
  x: number;
  y: number;
  /** Diameter in px. */
  size: number;
  opacity?: number;
  color?: string;
  /** Breathing period (s); 0 for none. */
  breathe?: number;
  pointer?: boolean;
  /** Slow horizontal drift period (s); 0 for none. */
  drift?: number;
  depth?: number;
  className?: string;
}) {
  const outer: CSSProperties = {
    left: x - size / 2,
    top: y - size / 2,
    width: size,
    height: size,
    ...(depth ? { ['--depth' as string]: depth } : {}),
  };
  const inner: CSSProperties = {
    background: `radial-gradient(closest-side, rgba(${color},${opacity}), rgba(${color},${(opacity * 0.3).toFixed(3)}) 55%, transparent 100%)`,
    ...(breathe ? { animationDuration: `${breathe}s` } : {}),
  };
  return (
    <div className={`bg-layer absolute ${depth ? 'bg-parallax-only' : ''} ${className}`} style={outer}>
      <div className={`absolute inset-0 ${pointer ? 'bg-follow' : ''}`}>
        <div className={`absolute inset-0 ${drift ? 'bg-glow-drift' : ''}`} style={drift ? { animationDuration: `${drift}s` } : undefined}>
          <div className={`absolute inset-0 ${breathe ? 'bg-breathe' : ''}`} style={inner} />
        </div>
      </div>
    </div>
  );
}
