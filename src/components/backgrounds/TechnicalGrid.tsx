import type { CSSProperties } from 'react';

/**
 * Square blueprint grid drawn with CSS gradients (no DOM per line).
 * `depth` (0-1) scales the section's parallax shift for this layer.
 */
export function TechnicalGrid({
  size = 56,
  opacity = 0.07,
  depth = 0,
  mask = 'radial-gradient(ellipse at center, #000 30%, transparent 78%)',
  reveal = false,
  className = '',
}: {
  size?: number;
  opacity?: number;
  depth?: number;
  mask?: string;
  reveal?: boolean;
  className?: string;
}) {
  const line = `rgba(59, 130, 246, ${opacity})`;
  const style: CSSProperties = {
    backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
    backgroundSize: `${size}px ${size}px`,
    maskImage: mask,
    WebkitMaskImage: mask,
    ...(depth ? { ['--depth' as string]: depth } : {}),
  };
  return <div className={`bg-layer ${depth ? 'bg-parallax' : 'absolute inset-0'} ${reveal ? 'bg-reveal' : ''} ${className}`} style={style} />;
}
