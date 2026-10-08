import type { CoreLayer } from '../data/site';

/**
 * Simplified 2D Cyber Core, used to tie later sections back to the hero.
 * Each layer can be lit independently:
 *   core      -> development (isometric cube)
 *   rings     -> AI + cloud
 *   structure -> infrastructure frame
 *   pipeline  -> delivery / circuit traces
 *   shield    -> cybersecurity (outer hex shell)
 *   modules   -> monitoring + compliance (orbit)
 */
const hex = (r: number, rot = -90) =>
  Array.from({ length: 6 }, (_, k) => {
    const a = ((rot + k * 60) * Math.PI) / 180;
    return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
  }).join(' ');

const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [Math.cos(a) * r, Math.sin(a) * r] as const;
};

// Outer shield as six separate panels with small gaps
const shieldSegments = Array.from({ length: 6 }, (_, k) => {
  const a0 = -90 + k * 60 + 3;
  const a1 = -90 + (k + 1) * 60 - 3;
  const [x0, y0] = polar(68, a0);
  const [x1, y1] = polar(68, a1);
  const [x2, y2] = polar(60, a1);
  const [x3, y3] = polar(60, a0);
  return `M${x0},${y0} L${x1},${y1} L${x2},${y2} L${x3},${y3} Z`;
});

// Circuit traces radiating from the core with 45 degree bends
const traces = Array.from({ length: 12 }, (_, i) => {
  const base = i * 30 + 8;
  const turn = i % 2 ? 25 : -25;
  const [x0, y0] = polar(16, base);
  const [x1, y1] = polar(27, base);
  const [x2, y2] = polar(37, base + turn);
  const [x3, y3] = polar(48, base + turn);
  return { d: `M${x0},${y0} L${x1},${y1} L${x2},${y2} L${x3},${y3}`, end: [x3, y3] as const };
});

const modulePositions = Array.from({ length: 6 }, (_, k) => polar(88, -60 + k * 60));

export function MiniCore({
  lit,
  focus,
  className = '',
  spin = true,
  title,
}: {
  lit: CoreLayer[];
  focus?: CoreLayer;
  className?: string;
  spin?: boolean;
  title?: string;
}) {
  const on = (l: CoreLayer) => lit.includes(l);
  const cls = (l: CoreLayer) => `mc-layer ${on(l) ? 'is-on' : ''} ${focus === l ? 'is-focus' : ''}`;

  return (
    <svg
      viewBox="-104 -104 208 208"
      className={`mini-core ${className}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {/* modules / orbit */}
      <g className={cls('modules')}>
        <circle r="88" className="mc-stroke" strokeDasharray="2 5" fill="none" />
        <g className={spin ? 'mc-spin-slow' : ''}>
          {modulePositions.map(([x, y], i) => (
            <polygon key={i} points={hex(9)} transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`} className="mc-stroke mc-fill" />
          ))}
        </g>
      </g>

      {/* outer shield */}
      <g className={cls('shield')}>
        {shieldSegments.map((d, i) => (
          <path key={i} d={d} className="mc-stroke mc-fill" />
        ))}
      </g>

      {/* infrastructure structure */}
      <g className={cls('structure')}>
        <polygon points={hex(54)} className="mc-stroke" fill="none" />
        {Array.from({ length: 6 }, (_, k) => {
          const [x0, y0] = polar(54, -90 + k * 60);
          const [x1, y1] = polar(60, -90 + k * 60);
          return <line key={k} x1={x0} y1={y0} x2={x1} y2={y1} className="mc-stroke" />;
        })}
      </g>

      {/* pipelines / circuits */}
      <g className={cls('pipeline')}>
        {traces.map((t, i) => (
          <g key={i}>
            <path d={t.d} className="mc-stroke" fill="none" />
            <path d={t.d} className="mc-pulse" fill="none" style={{ animationDelay: `${-(i * 0.27).toFixed(2)}s` }} />
            <circle cx={t.end[0]} cy={t.end[1]} r="1.8" className="mc-dot" />
          </g>
        ))}
      </g>

      {/* inner rings */}
      <g className={cls('rings')}>
        <g className={spin ? 'mc-spin' : ''}>
          <circle r="40" className="mc-stroke" fill="none" strokeDasharray="38 8" />
        </g>
        <g className={spin ? 'mc-spin-rev' : ''}>
          <circle r="31" className="mc-stroke" fill="none" strokeDasharray="2 4" />
        </g>
      </g>

      {/* central cube */}
      <g className={cls('core')}>
        <polygon points={hex(15)} className="mc-stroke mc-core" />
        <path d="M0,0 L0,15 M0,0 L-12.99,-7.5 M0,0 L12.99,-7.5" className="mc-stroke" fill="none" />
      </g>
    </svg>
  );
}
