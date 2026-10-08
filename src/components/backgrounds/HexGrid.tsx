import type { CSSProperties } from 'react';

/**
 * Honeycomb grid as a repeating SVG tile. The tile draws each edge exactly
 * once (every hexagon "owns" three edges), so lines never double up in alpha.
 */
function hexTile(r: number, color: string) {
  const w = Math.sqrt(3) * r;
  const f = (n: number) => Math.round(n * 100) / 100;
  const d = [
    `M0 ${f(-r)}L${f(w / 2)} ${f(-r / 2)}L${f(w / 2)} ${f(r / 2)}L0 ${f(r)}`,
    `M${f(w / 2)} ${f(r / 2)}L${f(w)} ${f(r)}L${f(w)} ${f(2 * r)}L${f(w / 2)} ${f(2.5 * r)}`,
    `M0 ${f(2 * r)}L${f(w / 2)} ${f(2.5 * r)}L${f(w / 2)} ${f(3.5 * r)}L0 ${f(4 * r)}`,
    `M0 ${f(r)}L0 ${f(2 * r)}`,
  ].join('');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${f(w)}' height='${f(3 * r)}'><path d='${d}' fill='none' stroke='${color}' stroke-width='1'/></svg>`;
  return { url: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, w, h: 3 * r };
}

export function HexGrid({
  r = 30,
  opacity = 0.07,
  depth = 0,
  mask = 'radial-gradient(ellipse at center, #000 25%, transparent 75%)',
  reveal = false,
  className = '',
}: {
  r?: number;
  opacity?: number;
  depth?: number;
  mask?: string;
  reveal?: boolean;
  className?: string;
}) {
  const tile = hexTile(r, `rgba(96,165,250,${opacity})`);
  const style: CSSProperties = {
    backgroundImage: tile.url,
    backgroundSize: `${tile.w}px ${tile.h}px`,
    maskImage: mask,
    WebkitMaskImage: mask,
    ...(depth ? { ['--depth' as string]: depth } : {}),
  };
  return <div className={`bg-layer ${depth ? 'bg-parallax' : 'absolute inset-0'} ${reveal ? 'bg-reveal' : ''} ${className}`} style={style} />;
}
