import { useEffect, useRef } from 'react';

/**
 * Quiet technical backdrop for the consultation section, in the Cyber Core's
 * visual language without repeating the core: a faint hexagonal grid, circuit
 * traces at 60° angles, nodes that brighten slowly, an occasional data pulse
 * travelling along a trace, a few drifting particles and a breathing glow.
 *
 * Two 2D canvases: the grid and traces are drawn once per size; only pulses,
 * nodes and particles redraw, at ~30 fps, and only while the section is on
 * screen. Reduced motion draws one static frame. Desktop with a fine pointer
 * gets a small cursor-reactive glow (max 16px) and grid parallax (max 5px).
 */

type Tier = 'desktop' | 'tablet' | 'mobile';

const TIERS: Record<Tier, { hex: number; traces: number; particles: number; maxPulses: number; pulseGap: [number, number] }> = {
  desktop: { hex: 34, traces: 16, particles: 14, maxPulses: 3, pulseGap: [1.4, 3.2] },
  tablet: { hex: 30, traces: 10, particles: 8, maxPulses: 2, pulseGap: [2.2, 4.2] },
  mobile: { hex: 26, traces: 6, particles: 4, maxPulses: 1, pulseGap: [3.2, 5.5] },
};

interface Trace {
  pts: [number, number][];
  lengths: number[];
  total: number;
}
interface Scene {
  w: number;
  h: number;
  traces: Trace[];
  nodes: { x: number; y: number; phase: number; flash: number }[];
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hex (pointy-top) centre for axial-ish offset coordinates. */
function hexCentre(col: number, row: number, r: number): [number, number] {
  const w = Math.sqrt(3) * r;
  return [col * w + (row & 1 ? w / 2 : 0), row * 1.5 * r];
}

function buildScene(w: number, h: number, tier: Tier): Scene {
  const { hex: r, traces: count } = TIERS[tier];
  const rand = mulberry32(Math.round(w) * 31 + Math.round(h));
  const cols = Math.ceil(w / (Math.sqrt(3) * r)) + 2;
  const rows = Math.ceil(h / (1.5 * r)) + 2;
  // Neighbour directions of a pointy-top hex lattice (60° apart), as centre-to-centre steps.
  const dirs = [0, 60, 120, 180, 240, 300].map((d) => [Math.cos((d * Math.PI) / 180), Math.sin((d * Math.PI) / 180)] as const);
  const step = Math.sqrt(3) * r;
  const traces: Trace[] = [];
  let guard = 0;
  while (traces.length < count && guard++ < count * 20) {
    const [sx, sy] = hexCentre(Math.floor(rand() * cols), Math.floor(rand() * rows), r);
    let d = Math.floor(rand() * 6);
    const pts: [number, number][] = [[sx, sy]];
    const segments = 4 + Math.floor(rand() * 6);
    let x = sx;
    let y = sy;
    for (let i = 0; i < segments; i++) {
      // Mostly straight runs with 60° turns, like routed traces.
      if (i > 0 && rand() < 0.38) d = (d + (rand() < 0.5 ? 1 : 5)) % 6;
      const run = 1 + Math.floor(rand() * 2);
      x += dirs[d][0] * step * run;
      y += dirs[d][1] * step * run;
      pts.push([x, y]);
    }
    // Keep the copy column calm: fewer traces behind the text on wide layouts.
    const meanX = pts.reduce((a, p) => a + p[0], 0) / pts.length;
    if (tier === 'desktop' && meanX < w * 0.38 && rand() < 0.7) continue;
    const lengths = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
    traces.push({ pts, lengths, total: lengths.reduce((a, b) => a + b, 0) });
  }
  const nodes = traces.flatMap((t) => [t.pts[0], t.pts[t.pts.length - 1]]).map(([x, y]) => ({ x, y, phase: rand() * Math.PI * 2, flash: 0 }));
  return { w, h, traces, nodes };
}

function drawStatic(ctx: CanvasRenderingContext2D, scene: Scene, tier: Tier) {
  const r = TIERS[tier].hex;
  const { w, h } = scene;
  ctx.clearRect(0, 0, w, h);
  // Hexagonal grid
  ctx.strokeStyle = 'rgba(120, 170, 230, 0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  const cols = Math.ceil(w / (Math.sqrt(3) * r)) + 2;
  const rows = Math.ceil(h / (1.5 * r)) + 2;
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const [cx, cy] = hexCentre(col, row, r);
      for (let k = 0; k < 6; k++) {
        const a = ((-90 + k * 60) * Math.PI) / 180;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }
  }
  ctx.stroke();
  // Circuit traces
  ctx.strokeStyle = 'rgba(80, 160, 240, 0.16)';
  ctx.lineWidth = 1.2;
  ctx.lineJoin = 'round';
  for (const t of scene.traces) {
    ctx.beginPath();
    t.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  }
}

function pointAt(t: Trace, dist: number): [number, number] {
  let d = Math.max(0, Math.min(t.total, dist));
  for (let i = 0; i < t.lengths.length; i++) {
    if (d <= t.lengths[i]) {
      const k = t.lengths[i] ? d / t.lengths[i] : 0;
      const [x0, y0] = t.pts[i];
      const [x1, y1] = t.pts[i + 1];
      return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
    }
    d -= t.lengths[i];
  }
  return t.pts[t.pts.length - 1];
}

export function AnimatedTechnicalBackground() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const grid = gridRef.current;
    const fx = fxRef.current;
    const glow = glowRef.current;
    if (!wrap || !grid || !fx || !glow) return;
    const gctx = grid.getContext('2d');
    const ctx = fx.getContext('2d');
    if (!gctx || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let tier: Tier = 'desktop';
    let scene: Scene = { w: 0, h: 0, traces: [], nodes: [] };
    let particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; phase: number }[] = [];
    const pulses: { trace: Trace; dist: number; speed: number; end: number }[] = [];
    let nextPulse = 0.6;
    const rand = mulberry32(42);

    // ---- sizing
    const resize = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      tier = w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      for (const [c, cx] of [
        [grid, gctx],
        [fx, ctx],
      ] as const) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
        cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      scene = buildScene(w, h, tier);
      drawStatic(gctx, scene, tier);
      particles = Array.from({ length: reduced ? 0 : TIERS[tier].particles }, () => ({
        x: rand() * w,
        y: rand() * h,
        vx: (rand() - 0.5) * 6,
        vy: -2 - rand() * 5,
        size: 0.7 + rand() * 0.9,
        alpha: 0.1 + rand() * 0.2,
        phase: rand() * Math.PI * 2,
      }));
      pulses.length = 0;
      draw(0);
    };

    // ---- drawing
    const draw = (t: number) => {
      const { w, h } = scene;
      ctx.clearRect(0, 0, w, h);
      // Nodes: slow brightness changes; a brief flash when a pulse arrives.
      for (const n of scene.nodes) {
        const breathe = reduced ? 0.5 : 0.5 + 0.5 * Math.sin(t * 0.9 + n.phase);
        const a = 0.18 + 0.32 * breathe + n.flash * 0.5;
        ctx.fillStyle = `rgba(57, 215, 255, ${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(59, 130, 246, ${(a * 0.45).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Pulses: a bright head with a fading tail along the trace.
      for (const p of pulses) {
        const tail = 70;
        const steps = 10;
        for (let i = steps; i >= 0; i--) {
          const d = p.dist - (tail * i) / steps;
          if (d < 0 || d > p.trace.total) continue;
          const [x, y] = pointAt(p.trace, d);
          const k = 1 - i / steps;
          ctx.fillStyle = `rgba(120, 220, 255, ${(0.55 * k * k).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, 1 + 0.9 * k, 0, Math.PI * 2);
          ctx.fill();
        }
        if (p.dist <= p.trace.total) {
          const [x, y] = pointAt(p.trace, p.dist);
          const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
          g.addColorStop(0, 'rgba(190, 240, 255, 0.55)');
          g.addColorStop(1, 'rgba(57, 215, 255, 0)');
          ctx.fillStyle = g;
          ctx.fillRect(x - 10, y - 10, 20, 20);
        }
      }
      // Particles
      for (const p of particles) {
        const a = p.alpha * (0.6 + 0.4 * Math.sin(t * 0.6 + p.phase));
        ctx.fillStyle = `rgba(150, 210, 255, ${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // ---- simulation
    const update = (dt: number, t: number) => {
      const { w, h } = scene;
      nextPulse -= dt;
      const cfg = TIERS[tier];
      if (nextPulse <= 0 && scene.traces.length) {
        if (pulses.length < cfg.maxPulses) {
          const trace = scene.traces[Math.floor(rand() * scene.traces.length)];
          const forward = rand() < 0.5;
          const pts = forward ? trace.pts : [...trace.pts].reverse();
          const lengths = forward ? trace.lengths : [...trace.lengths].reverse();
          pulses.push({ trace: { pts, lengths, total: trace.total }, dist: 0, speed: 90 + rand() * 60, end: trace.total + 70 });
        }
        nextPulse = cfg.pulseGap[0] + rand() * (cfg.pulseGap[1] - cfg.pulseGap[0]);
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        const before = p.dist;
        p.dist += p.speed * dt;
        if (before <= p.trace.total && p.dist > p.trace.total) {
          const [ex, ey] = p.trace.pts[p.trace.pts.length - 1];
          const node = scene.nodes.find((n) => Math.abs(n.x - ex) < 1 && Math.abs(n.y - ey) < 1);
          if (node) node.flash = 1;
        }
        if (p.dist > p.end) pulses.splice(i, 1);
      }
      for (const n of scene.nodes) n.flash = Math.max(0, n.flash - dt * 0.9);
      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.y < -4) p.y = h + 4;
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
      }
      // Cursor-reactive glow and grid parallax, eased.
      cursor.x += (cursor.tx - cursor.x) * Math.min(1, dt * 3);
      cursor.y += (cursor.ty - cursor.y) * Math.min(1, dt * 3);
      if (pointerFx) {
        glow.style.transform = `translate3d(${(cursor.x * 16).toFixed(2)}px, ${(cursor.y * 16).toFixed(2)}px, 0)`;
        grid.style.transform = `translate3d(${(cursor.x * -5).toFixed(2)}px, ${(cursor.y * -5).toFixed(2)}px, 0)`;
      }
      draw(t);
    };

    // ---- cursor (desktop, fine pointer, motion allowed)
    const cursor = { x: 0, y: 0, tx: 0, ty: 0 };
    let pointerFx = false;
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = wrap.getBoundingClientRect();
      cursor.tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      cursor.ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
    };
    const updatePointerFx = () => {
      const next = !reduced && finePointer && wrap.clientWidth >= 1024;
      if (next === pointerFx) return;
      pointerFx = next;
      if (pointerFx) window.addEventListener('pointermove', onPointer, { passive: true });
      else {
        window.removeEventListener('pointermove', onPointer);
        glow.style.transform = '';
        grid.style.transform = '';
      }
    };

    // ---- loop: ~30 fps, only while visible
    let raf = 0;
    let running = false;
    let inView = false;
    let last = 0;
    let clock = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const elapsed = now - last;
      if (elapsed < 31) return;
      last = now;
      const dt = Math.min(0.1, elapsed / 1000);
      clock += dt;
      update(dt, clock);
    };
    const start = () => {
      if (running || reduced || !inView || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const ro = new ResizeObserver(() => {
      resize();
      updatePointerFx();
    });
    ro.observe(wrap);
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        if (inView) start();
        else stop();
      },
      { rootMargin: '100px 0px' },
    );
    io.observe(wrap);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden="true" className="tb-wrap pointer-events-none absolute inset-0 overflow-hidden">
      <div ref={glowRef} className="absolute inset-0">
        <div className="tb-glow absolute left-[46%] top-[8%] h-[84%] w-[60%]" />
      </div>
      <canvas ref={gridRef} className="absolute inset-0 h-full w-full" />
      <canvas ref={fxRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
