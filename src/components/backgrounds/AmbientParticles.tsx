import { useEffect, useRef } from 'react';
import { useBg } from './context';
import { onFrame, type Tier } from './motion';
import { seeded, type Pt } from './geometry';

/**
 * A few slow, low-opacity particles on one small canvas. Runs on the shared
 * frame loop only while the section is visible; each particle fades in and out
 * over its life so nothing pops. Counts are per device tier and capped (desktop
 * 30, tablet 15, mobile 8); nothing renders for reduced motion.
 */
export function AmbientParticles({
  count,
  mode = 'float',
  center,
  region,
  seed = 1,
  opacity = 1,
}: {
  count: Partial<Record<Tier, number>>;
  /** float: wander; up: rise slowly; inward: drift towards `center`. */
  mode?: 'float' | 'up' | 'inward';
  center?: Pt;
  /** Spawn region [x0, y0, x1, y1] in px (default: whole box). */
  region?: [number, number, number, number];
  seed?: number;
  opacity?: number;
}) {
  const { w, h, env, active, animate } = useBg();
  const ref = useRef<HTMLCanvasElement>(null);
  const caps = { desktop: 30, tablet: 15, mobile: 8 };
  const n = animate ? Math.min(caps[env.tier], count[env.tier] ?? 0) : 0;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !n || !active) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const rand = seeded(seed * 97 + n);
    const [x0, y0, x1, y1] = region ?? [0, 0, w, h];
    const spawn = (age = rand()) => {
      const x = x0 + rand() * (x1 - x0);
      const y = y0 + rand() * (y1 - y0);
      let vx = (rand() - 0.5) * 6;
      let vy = (rand() - 0.5) * 4;
      if (mode === 'up') {
        vx *= 0.4;
        vy = -3 - rand() * 4;
      }
      if (mode === 'inward' && center) {
        const dx = center[0] - x;
        const dy = center[1] - y;
        const l = Math.hypot(dx, dy) || 1;
        const v = 3 + rand() * 4;
        vx = (dx / l) * v;
        vy = (dy / l) * v;
      }
      return { x, y, vx, vy, size: 0.7 + rand() * 1, alpha: (0.12 + rand() * 0.22) * opacity, life: 9 + rand() * 9, age: age * 9 };
    };
    const ps = Array.from({ length: n }, () => spawn());
    let acc = 0;
    const stop = onFrame((dt) => {
      // ~30 fps is plenty for motion this slow.
      acc += dt;
      if (acc < 1 / 32) return;
      const step = acc;
      acc = 0;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.age += step;
        p.x += p.vx * step;
        p.y += p.vy * step;
        if (p.age > p.life || p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) {
          ps[i] = spawn(0);
          continue;
        }
        const fade = Math.min(1, p.age / 2, (p.life - p.age) / 2);
        ctx.fillStyle = `rgba(150,210,255,${(p.alpha * fade).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    return () => {
      stop();
      ctx.clearRect(0, 0, w, h);
    };
  }, [w, h, n, active, mode, center?.[0], center?.[1], region?.join(','), seed, opacity]);

  if (!n) return null;
  return <canvas ref={ref} className="bg-layer absolute inset-0" style={{ width: w, height: h }} />;
}
