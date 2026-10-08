/**
 * Deterministic geometry for section backgrounds. Everything is generated in
 * pixel coordinates for the section's current size, from a seed, so a section
 * always looks the same and lines stay 1px crisp (no SVG scaling).
 */

export type Pt = [number, number];

export interface Trace {
  d: string;
  pts: Pt[];
}

export function seeded(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;
export const toD = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${r1(x)} ${r1(y)}`).join('');
const trace = (pts: Pt[]): Trace => ({ d: toD(pts), pts });

/** Pointy-top hexagon outline. */
export function hexagon(cx: number, cy: number, r: number): string {
  const pts: Pt[] = Array.from({ length: 6 }, (_, k) => {
    const a = ((-90 + k * 60) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  return toD(pts) + 'Z';
}

/**
 * Traces that run between hex-lattice centres in 60° steps, like routed
 * circuitry on the Cyber Core's back plate. `keep` can veto a trace (e.g. to
 * keep text columns clear).
 */
export function routedTraces(
  w: number,
  h: number,
  opts: { count: number; seed: number; hex?: number; region?: [number, number, number, number]; keep?: (pts: Pt[]) => boolean },
): Trace[] {
  const rand = seeded(opts.seed);
  const r = opts.hex ?? 34;
  const step = Math.sqrt(3) * r;
  const [x0, y0, x1, y1] = opts.region ?? [0, 0, w, h];
  const dirs = [0, 60, 120, 180, 240, 300].map((d) => [Math.cos((d * Math.PI) / 180), Math.sin((d * Math.PI) / 180)]);
  const out: Trace[] = [];
  for (let guard = 0; out.length < opts.count && guard < opts.count * 25; guard++) {
    const col = Math.floor((x0 + rand() * (x1 - x0)) / step);
    const row = Math.floor((y0 + rand() * (y1 - y0)) / (1.5 * r));
    let x = col * step + (row & 1 ? step / 2 : 0);
    let y = row * 1.5 * r;
    let d = Math.floor(rand() * 6);
    const pts: Pt[] = [[x, y]];
    const segments = 3 + Math.floor(rand() * 5);
    for (let i = 0; i < segments; i++) {
      if (i > 0 && rand() < 0.4) d = (d + (rand() < 0.5 ? 1 : 5)) % 6;
      const run = 1 + Math.floor(rand() * 2);
      x += dirs[d][0] * step * run;
      y += dirs[d][1] * step * run;
      pts.push([x, y]);
    }
    if (opts.keep && !opts.keep(pts)) continue;
    out.push(trace(pts));
  }
  return out;
}

/**
 * Left-to-right data flows: mostly horizontal runs with an occasional 45° jog
 * between lanes, plus small module positions along them.
 */
export function horizontalFlows(
  opts: { lanes: number[]; x0: number; x1: number; seed: number },
): { flows: Trace[]; modules: Pt[] } {
  const rand = seeded(opts.seed);
  const flows: Trace[] = [];
  const modules: Pt[] = [];
  opts.lanes.forEach((y, i) => {
    const pts: Pt[] = [[opts.x0, y]];
    let x = opts.x0;
    let lane = y;
    const span = opts.x1 - opts.x0;
    while (x < opts.x1) {
      x = Math.min(opts.x1, x + span * (0.18 + rand() * 0.22));
      pts.push([x, lane]);
      if (x < opts.x1 && rand() < 0.45) {
        // Jog to a neighbouring lane at 45°.
        const target = opts.lanes[i + (rand() < 0.5 ? -1 : 1)];
        if (target !== undefined) {
          const dy = (target - lane) * 0.5;
          x = Math.min(opts.x1, x + Math.abs(dy));
          lane += dy;
          pts.push([x, lane]);
        }
      }
      if (rand() < 0.5) modules.push([x, lane]);
    }
    flows.push(trace(pts));
  });
  return { flows, modules };
}

/**
 * Routes from start points to a circle around `c` (radius r), PCB style:
 * straight along the dominant axis, then a 45° diagonal into the target.
 */
export function convergingRoutes(starts: Pt[], c: Pt, r: number): Trace[] {
  return starts.map(([sx, sy]) => {
    const vx = sx - c[0];
    const vy = sy - c[1];
    const len = Math.hypot(vx, vy) || 1;
    const tx = c[0] + (vx / len) * r;
    const ty = c[1] + (vy / len) * r;
    const dx = tx - sx;
    const dy = ty - sy;
    const pts: Pt[] = [[sx, sy]];
    if (Math.abs(dx) > Math.abs(dy)) pts.push([tx - Math.sign(dx) * Math.abs(dy), sy]);
    else pts.push([sx, ty - Math.sign(dy) * Math.abs(dx)]);
    pts.push([tx, ty]);
    return trace(pts);
  });
}

/** Polyline length, for pulse timing. */
export function lengthOf(pts: Pt[]) {
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return l;
}

/** Scattered points with a minimum spacing (Poisson-ish). */
export function scatter(w: number, h: number, n: number, seed: number, minDist: number, keep?: (p: Pt) => boolean): Pt[] {
  const rand = seeded(seed);
  const pts: Pt[] = [];
  for (let guard = 0; pts.length < n && guard < n * 60; guard++) {
    const p: Pt = [rand() * w, rand() * h];
    if (keep && !keep(p)) continue;
    if (pts.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > minDist)) pts.push(p);
  }
  return pts;
}
