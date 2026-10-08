/**
 * Hero keyframe player.
 *
 * Plays the normalised Cyber Core keyframes (see scripts/normalize-frames.mjs)
 * on a 2D canvas as one continuous opening sequence, then a restrained idle loop.
 *
 * Frames are never simply dissolved. Between two keyframes the object is split
 * into concentric bands (core, inner nodes, rings, shell, orbit). Each band of
 * the outgoing frame is scaled towards where the incoming frame has it, and each
 * band of the incoming frame starts where the outgoing one was, using the
 * per-band scales measured by the normaliser. The two images therefore agree on
 * geometry while they cross-fade, so panels read as sliding open rather than
 * ghosting. On top of that: an optional centre-out reveal, glow interpolation,
 * a slow camera push-in and, during the internal reveal, a small opposing
 * rotation of the two ring bands.
 */
import manifest from './frames.generated.json';

export type Quality = 'high' | 'low';
export type Variant = 'lg' | 'sm';

type BandName = string;
interface FrameEntry {
  id: string;
  at: number;
  from?: number;
  glow: number;
  reveal: string;
  ease: string;
  src: Record<Variant, string>;
}
interface Manifest {
  sizes: Record<Variant, number>;
  core: { x: number; y: number };
  ellipse: { ratio: number; angle: number };
  feather: number;
  bands: { name: BandName; to?: number }[];
  ringSpin: { from: number; to: number; degrees: Record<BandName, number> } | null;
  frames: FrameEntry[];
  transitions: { scales: Record<BandName, number> }[];
  orbit: [number, number, number][] | null;
}

export const HERO = manifest as unknown as Manifest;
export const FIRST_FRAME = HERO.frames[0];
export const FINAL_FRAME = HERO.frames[HERO.frames.length - 1];
export const INTRO_END = FINAL_FRAME.at;

export interface SequenceOptions {
  canvas: HTMLCanvasElement;
  variant: Variant;
  quality: Quality;
  /** Called after the canvas has drawn its first frame (hide the poster). */
  onFirstDraw?: () => void;
  /** Called when the device cannot keep up or frames fail to load: show the static final frame. */
  onFallback?: (reason: 'performance' | 'load-error') => void;
  /** QA mode (`?hero=debug`): no performance fallback; `seek` renders an exact moment. */
  debug?: boolean;
}

export interface SequenceHandle {
  dispose: () => void;
  /** Resolves once every keyframe has loaded. */
  ready: Promise<void>;
  /** Stop the loop and render the sequence at `t` seconds (QA only). */
  seek: (t: number) => void;
}

// ------------------------------------------------------------------ helpers

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const EASE: Record<string, (p: number) => number> = {
  linear: (p) => p,
  sine: (p) => -(Math.cos(Math.PI * p) - 1) / 2,
  out: (p) => 1 - (1 - p) ** 3,
  inOut: (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2),
};
const DEG = Math.PI / 180;
const isIdentity = (s: number, theta: number) => Math.abs(s - 1) < 0.0015 && Math.abs(theta) < 0.0004;

/** Small deterministic PRNG so particle layout is stable between visits. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return { canvas: c, ctx };
}

type Drawable = HTMLCanvasElement | HTMLImageElement;

async function loadFrame(src: string, priority: 'high' | 'low'): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = 'async';
  img.setAttribute('fetchpriority', priority);
  img.src = src;
  await img.decode();
  return img;
}

// ------------------------------------------------------------------ timeline

interface Segment {
  /** Index of the frame this segment arrives at. */
  to: number;
  start: number;
  end: number;
}

const SEGMENTS: Segment[] = HERO.frames.slice(1).map((f, i) => ({
  to: i + 1,
  start: f.from ?? HERO.frames[i].at,
  end: f.at,
}));

/**
 * Camera: push-in through the intro, settle, then a slow float and roll.
 * Applied as a CSS transform on the canvas element, so the compositor moves the
 * finished layer and canvas drawing stays 1:1 (a transformed full-canvas draw is
 * the single most expensive operation on CPU-rasterised canvases).
 */
function camera(t: number) {
  const intro = Math.min(t, INTRO_END);
  const idle = Math.max(0, t - INTRO_END);
  const scale =
    1 + 0.024 * smoothstep(0, INTRO_END - 1.2, intro) - 0.004 * smoothstep(INTRO_END - 1.2, INTRO_END, intro) + 0.003 * Math.sin((idle * 2 * Math.PI) / 9);
  const roll = (-0.45 * smoothstep(INTRO_END - 3.5, INTRO_END - 0.6, intro) + 0.35 * Math.sin((idle * 2 * Math.PI) / 32)) * DEG;
  const amp = 0.006 + 0.006 * smoothstep(INTRO_END - 1.2, INTRO_END, t);
  /** Vertical offset as a fraction of the visual's height. */
  const float = amp * Math.sin((t * 2 * Math.PI) / 6.5) * smoothstep(0, 1.2, t);
  return { scale, roll, float };
}

// ------------------------------------------------------------------ player

export function createHeroSequence(opts: SequenceOptions): SequenceHandle {
  const { canvas, variant, quality } = opts;
  const high = quality === 'high';
  const ctx = canvas.getContext('2d');
  let readyResolve: () => void = () => {};
  const ready = new Promise<void>((r) => (readyResolve = r));
  if (!ctx) {
    opts.onFallback?.('load-error');
    return { dispose() {}, ready, seek() {} };
  }
  const container = canvas.parentElement ?? canvas;
  const sources: (HTMLImageElement | undefined)[] = HERO.frames.map(() => undefined);
  const frameAt = (i: number): Drawable => sources[i]!;
  const bands = HERO.bands;
  const edges = bands.map((b) => b.to ?? Infinity).slice(0, -1);
  const { ratio, angle } = HERO.ellipse;

  let W = 1;
  let H = 1;
  let bufA = makeCanvas(1, 1);
  let bufB = makeCanvas(1, 1);
  let tmp = makeCanvas(1, 1);

  // ---- band masks as radial gradients in ellipse space (no mask bitmaps needed)

  /** Weight of band i at ellipse radius r (output units). Bands form a partition of unity. */
  const bandWeight = (i: number, r: number) => {
    const f = HERO.feather;
    const lo = i === 0 ? 1 : clamp01((r - (edges[i - 1] - f)) / (2 * f));
    const hi = i === edges.length ? 0 : clamp01((r - (edges[i] - f)) / (2 * f));
    return lo - hi;
  };

  /** Fill `c` (with the current composite op) by the summed weight of `set` bands. */
  function fillBands(c: CanvasRenderingContext2D, set: number[], ox = 0, oy = 0) {
    const R = 1.2; // output units; covers the canvas corners in ellipse space
    const pts = new Set<number>([0, R]);
    for (const e of edges) {
      pts.add(Math.max(0, e - HERO.feather));
      pts.add(Math.min(R, e + HERO.feather));
    }
    const grad = c.createRadialGradient(0, 0, 0, 0, 0, R * W);
    for (const r of [...pts].sort((a, b) => a - b)) {
      const a = set.reduce((sum, i) => sum + bandWeight(i, r), 0);
      grad.addColorStop(r / R, `rgba(0,0,0,${clamp01(a).toFixed(4)})`);
    }
    c.save();
    c.setTransform(1, 0, 0, 1, ox, oy);
    c.translate(HERO.core.x * W, HERO.core.y * H);
    c.rotate(angle);
    c.scale(1, ratio);
    c.fillStyle = grad;
    c.fillRect(-2 * W, -2 * W, 4 * W, 4 * W);
    c.restore();
  }

  /** Transform of band content: isotropic scale about the core plus a rotation in the ring plane. */
  function setBandTransform(c: CanvasRenderingContext2D, s: number, theta: number) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.translate(HERO.core.x * W, HERO.core.y * H);
    if (theta) {
      c.rotate(angle);
      c.scale(1, ratio);
      c.rotate(theta);
      c.scale(1, 1 / ratio);
      c.rotate(-angle);
    }
    c.scale(s, s);
    c.translate(-HERO.core.x * W, -HERO.core.y * H);
  }

  /**
   * Pixel box that contains band i's mask (bands are concentric, so a box that
   * holds band i also holds every band inside it). Work on a band is clipped to
   * its box: inner bands touch a few percent of the canvas, not all of it.
   */
  function bandBox(i: number) {
    const outer = i < edges.length ? edges[i] + HERO.feather : Infinity;
    const r = (outer / Math.min(1, ratio)) * W + 2;
    const x0 = Math.max(0, Math.floor(HERO.core.x * W - r));
    const y0 = Math.max(0, Math.floor(HERO.core.y * H - r));
    const x1 = Math.min(W, Math.ceil(HERO.core.x * W + r));
    const y1 = Math.min(H, Math.ceil(HERO.core.y * H + r));
    return { x: x0, y: y0, w: Math.max(0, x1 - x0), h: Math.max(0, y1 - y0) };
  }

  function clipTo(c: CanvasRenderingContext2D, box: { x: number; y: number; w: number; h: number }) {
    c.beginPath();
    c.rect(box.x, box.y, box.w, box.h);
    c.clip();
  }

  /**
   * Alpha mask for a set of bands, rendered once per canvas size and cached:
   * copying a small bitmap is far cheaper than filling a gradient every frame
   * (which matters on CPU-rasterised canvases).
   */
  const maskCache = new Map<string, { canvas: HTMLCanvasElement; x: number; y: number }>();
  function bandMask(set: number[]) {
    const key = set.join(',');
    const hit = maskCache.get(key);
    if (hit) return hit;
    const box = bandBox(Math.max(...set));
    const m = makeCanvas(Math.max(1, box.w), Math.max(1, box.h));
    m.ctx.translate(-box.x, -box.y);
    fillBands(m.ctx, set, -box.x, -box.y);
    const entry = { canvas: m.canvas, x: box.x, y: box.y };
    maskCache.set(key, entry);
    return entry;
  }

  /** Draw `img` into `out`, each band with its own scale/rotation. */
  function warpInto(out: CanvasRenderingContext2D, img: Drawable, scales: number[], thetas: number[]) {
    out.setTransform(1, 0, 0, 1, 0, 0);
    out.globalCompositeOperation = 'source-over';
    out.clearRect(0, 0, W, H);
    out.drawImage(img, 0, 0, W, H);
    const moving = bands.map((_, i) => i).filter((i) => !isIdentity(scales[i], thetas[i]));
    if (!moving.length) return;
    // Remove the moving bands from the untouched copy, then add each band warped.
    const hole = bandMask(moving);
    out.globalCompositeOperation = 'destination-out';
    out.drawImage(hole.canvas, hole.x, hole.y);
    const t = tmp.ctx;
    for (const i of moving) {
      const box = bandBox(i);
      if (!box.w || !box.h) continue;
      t.save();
      t.setTransform(1, 0, 0, 1, 0, 0);
      t.globalCompositeOperation = 'source-over';
      t.clearRect(box.x, box.y, box.w, box.h);
      clipTo(t, box);
      setBandTransform(t, scales[i], thetas[i]);
      t.drawImage(img, 0, 0, W, H);
      t.setTransform(1, 0, 0, 1, 0, 0);
      t.globalCompositeOperation = 'destination-in';
      const mask = bandMask([i]);
      t.drawImage(mask.canvas, mask.x, mask.y);
      t.restore();
      out.globalCompositeOperation = 'lighter';
      out.drawImage(tmp.canvas, box.x, box.y, box.w, box.h, box.x, box.y, box.w, box.h);
    }
    out.globalCompositeOperation = 'source-over';
  }

  /** Centre-out reveal: alpha of the incoming frame by radius for progress p. */
  function revealGradient(c: CanvasRenderingContext2D, p: number) {
    const F = 0.2; // feather, output units
    const front = -F / 2 + p * (0.62 + F);
    const R = 0.75;
    const grad = c.createRadialGradient(HERO.core.x * W, HERO.core.y * H, 0, HERO.core.x * W, HERO.core.y * H, R * W);
    const m = (r: number) => clamp01((front + F / 2 - r) / F);
    const stops = [0, clamp01((front - F / 2) / R) * R, clamp01((front + F / 2) / R) * R, R];
    for (const r of stops) grad.addColorStop(r / R, `rgba(0,0,0,${m(r).toFixed(4)})`);
    return grad;
  }

  // ---- ring spin and per-band scales for a moment in time

  const ringSpinAt = (t: number) => {
    const spin = HERO.ringSpin;
    if (!high || !spin || t <= spin.from || t >= spin.to) return bands.map(() => 0);
    const u = (t - spin.from) / (spin.to - spin.from);
    const k = Math.sin(Math.PI * u) ** 2; // turns out and settles back, starting and ending at rest
    return bands.map((b) => (spin.degrees[b.name] ?? 0) * DEG * k);
  };

  // ---- overlays

  const rand = mulberry32(7);
  const particles = Array.from({ length: high ? 14 : 0 }, () => ({
    a: rand() * Math.PI * 2,
    r: 0.2 + rand() * 0.24,
    speed: (0.006 + rand() * 0.01) * (rand() < 0.5 ? -1 : 1),
    phase: rand() * Math.PI * 2,
    size: 0.9 + rand() * 0.9,
  }));

  function drawGlow(c: CanvasRenderingContext2D, g: number) {
    const x = HERO.core.x * W;
    const y = HERO.core.y * H;
    c.globalCompositeOperation = 'lighter';
    const inner = c.createRadialGradient(x, y, 0, x, y, W * 0.15);
    inner.addColorStop(0, `rgba(120,225,255,${(0.11 * g).toFixed(4)})`);
    inner.addColorStop(0.45, `rgba(57,215,255,${(0.045 * g).toFixed(4)})`);
    inner.addColorStop(1, 'rgba(30,167,255,0)');
    c.fillStyle = inner;
    c.fillRect(x - W * 0.15, y - W * 0.15, W * 0.3, W * 0.3);
    c.globalCompositeOperation = 'source-over';
  }

  function drawOrbitGlints(c: CanvasRenderingContext2D, t: number, alpha: number) {
    const path = HERO.orbit;
    if (!high || !path || alpha <= 0) return;
    c.globalCompositeOperation = 'lighter';
    for (const phase of [0, 0.5]) {
      const u = (((t / 34 + phase) % 1) + 1) % 1;
      const f = u * path.length;
      const i = Math.floor(f);
      const a = path[i % path.length];
      const b = path[(i + 1) % path.length];
      const k = f - i;
      const x = lerp(a[0], b[0], k) * W;
      const y = lerp(a[1], b[1], k) * H;
      const front = lerp(a[2], b[2], k);
      const r = W * 0.012;
      const grad = c.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(190,240,255,${(alpha * (0.15 + 0.5 * front)).toFixed(4)})`);
      grad.addColorStop(1, 'rgba(57,215,255,0)');
      c.fillStyle = grad;
      c.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    c.globalCompositeOperation = 'source-over';
  }

  function drawParticles(c: CanvasRenderingContext2D, t: number, alpha: number) {
    if (!particles.length || alpha <= 0) return;
    const pxPerCss = W / Math.max(1, container.clientWidth);
    c.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      const a = p.a + t * p.speed;
      const r = p.r + 0.012 * Math.sin(t * 0.21 + p.phase);
      const x = (HERO.core.x + Math.cos(a) * r) * W;
      const y = (HERO.core.y + Math.sin(a) * r * 0.92) * H;
      const tw = 0.5 + 0.5 * Math.sin(t * 0.7 + p.phase * 3);
      c.fillStyle = `rgba(150,220,255,${(alpha * (0.12 + 0.22 * tw)).toFixed(4)})`;
      c.beginPath();
      c.arc(x, y, p.size * pxPerCss, 0, Math.PI * 2);
      c.fill();
    }
    c.globalCompositeOperation = 'source-over';
  }

  // ---- render one moment

  /** Premultiplied linear blend A(1 - p) + B p onto the (cleared) main canvas. */
  function crossfade(A: CanvasImageSource, B: CanvasImageSource, p: number) {
    const main = ctx!;
    main.globalAlpha = 1 - p;
    main.drawImage(A, 0, 0, W, H);
    main.globalCompositeOperation = 'lighter';
    main.globalAlpha = p;
    main.drawImage(B, 0, 0, W, H);
    main.globalAlpha = 1;
    main.globalCompositeOperation = 'source-over';
  }

  function maskBuffer(c: CanvasRenderingContext2D, op: GlobalCompositeOperation, p: number) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = op;
    c.fillStyle = revealGradient(c, p);
    c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'source-over';
  }

  function glowAt(t: number) {
    const fr = HERO.frames;
    if (t >= INTRO_END) return FINAL_FRAME.glow * (1 + 0.1 * Math.sin((t - INTRO_END) * ((2 * Math.PI) / 3.8)));
    const seg = SEGMENTS.find((s) => t < s.end);
    if (!seg) return FINAL_FRAME.glow;
    const p = clamp01((t - seg.start) / (seg.end - seg.start));
    const swell = seg.to === 1 ? 0.35 * Math.sin(Math.PI * p) : 0; // activation energy swell
    return lerp(fr[seg.to - 1].glow, fr[seg.to].glow, EASE.sine(p)) + swell + 0.04 * Math.sin(t * 2.2) * smoothstep(0, 0.8, t);
  }

  function render(t: number) {
    const cam = camera(t);
    canvas.style.transform = `translate(0, ${(cam.float * 100).toFixed(3)}%) rotate(${cam.roll.toFixed(5)}rad) scale(${cam.scale.toFixed(5)})`;
    const thetas = ringSpinAt(t);
    const seg = t < INTRO_END ? SEGMENTS.find((s) => t < s.end) : undefined;
    const main = ctx!;
    main.setTransform(1, 0, 0, 1, 0, 0);
    main.globalCompositeOperation = 'source-over';
    main.globalAlpha = 1;
    main.clearRect(0, 0, W, H);

    if (!seg || t < seg.start) {
      // Holding a keyframe (or idle on the final frame).
      const img = frameAt(seg ? seg.to - 1 : HERO.frames.length - 1);
      if (thetas.some((v) => v)) {
        warpInto(bufA.ctx, img, bands.map(() => 1), thetas);
        main.drawImage(bufA.canvas, 0, 0);
      } else {
        main.drawImage(img, 0, 0, W, H);
      }
    } else {
      const A = frameAt(seg.to - 1);
      const B = frameAt(seg.to);
      const entry = HERO.frames[seg.to];
      const p = (EASE[entry.ease] ?? EASE.inOut)(clamp01((t - seg.start) / (seg.end - seg.start)));
      // A band of A grows by s^p towards B; the same band of B starts at s^-1 and grows to 1.
      const scales = bands.map((b) => HERO.transitions[seg.to - 1].scales[b.name] ?? 1);
      const sA = scales.map((s) => s ** p);
      const sB = scales.map((s) => s ** (p - 1));
      const still = (sc: number[]) => sc.every((v, i) => isIdentity(v, thetas[i]));
      const radial = entry.reveal === 'radial';
      if (!radial && still(sA) && still(sB)) {
        // Nothing moves: a straight cross-fade needs no buffers.
        crossfade(A, B, p);
      } else {
        warpInto(bufA.ctx, A, sA, thetas);
        warpInto(bufB.ctx, B, sB, thetas);
        if (radial) {
          // Centre-out: the incoming frame spreads from the core, the outgoing one recedes.
          maskBuffer(bufA.ctx, 'destination-out', p);
          maskBuffer(bufB.ctx, 'destination-in', p);
          main.drawImage(bufA.canvas, 0, 0);
          main.globalCompositeOperation = 'lighter';
          main.drawImage(bufB.canvas, 0, 0);
          main.globalCompositeOperation = 'source-over';
        } else {
          crossfade(bufA.canvas, bufB.canvas, p);
        }
      }
    }

    drawGlow(main, glowAt(t) * smoothstep(0, 0.6, t));
    drawOrbitGlints(main, t, smoothstep(HERO.frames[Math.max(0, HERO.frames.length - 2)].at - 0.3, INTRO_END, t));
    drawParticles(main, t, smoothstep(HERO.frames[Math.min(4, HERO.frames.length - 1)].at, INTRO_END, t));
  }

  // ---- sizing

  /**
   * The canvas backing store is the keyframes' native size: frames are copied 1:1
   * and the browser scales the canvas exactly as it scales the poster <img>, so the
   * hand-over from poster to canvas is pixel-identical.
   */
  function setup() {
    W = H = HERO.sizes[variant];
    canvas.width = W;
    canvas.height = H;
    bufA = makeCanvas(W, H);
    bufB = makeCanvas(W, H);
    tmp = makeCanvas(W, H);
    for (const c of [ctx!, bufA.ctx, bufB.ctx, tmp.ctx]) {
      c.imageSmoothingEnabled = true;
      // Only bands in motion are resampled; bilinear is indistinguishable there and far cheaper on CPU canvases.
      c.imageSmoothingQuality = 'low';
    }
  }

  // ---- loop

  let clock = 0;
  let started = false;
  let running = false;
  let disposed = false;
  let raf = 0;
  let last = 0;
  let drewFirst = false;
  let lastIdleDraw = 0;
  const perf = { samples: [] as number[], checked: false };

  /** The clock may not enter a segment whose incoming frame has not loaded yet. */
  function gate(t: number) {
    for (const s of SEGMENTS) {
      if (t >= s.start && (!sources[s.to] || !sources[s.to - 1])) return s.start;
    }
    return t;
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const interval = now - last;
    last = now;
    const dt = Math.min(0.05, interval / 1000);
    clock = gate(clock + dt);

    // Idle: the motion is slow, so ~30 fps is plenty and saves battery.
    if (clock > INTRO_END + 0.5 && now - lastIdleDraw < 30) return;
    lastIdleDraw = now;

    const t0 = performance.now();
    render(clock);
    const cost = performance.now() - t0;
    if (!drewFirst) {
      drewFirst = true;
      opts.onFirstDraw?.();
    }
    monitor(interval, cost);
  }

  /**
   * Fall back to the static final frame if the device clearly cannot keep up:
   * judged on the first ~30 frames (or 2.5 s) of the intro by the median frame
   * time. Pauses (tab switch, off-screen) restart the loop and its timestamp,
   * so only gaps over a second are discarded.
   */
  function monitor(interval: number, cost: number) {
    if (opts.debug || perf.checked || clock < 0.4 || interval > 1000) return;
    perf.samples.push(Math.max(interval, cost));
    const spent = perf.samples.reduce((a, b) => a + b, 0);
    if (perf.samples.length < 30 && spent < 2500) return;
    perf.checked = true;
    const sorted = [...perf.samples].sort((a, b) => a - b);
    if (sorted[sorted.length >> 1] > 50) {
      stop();
      opts.onFallback?.('performance');
    }
  }

  function start() {
    if (running || disposed || !started || document.hidden || !inView) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  // ---- visibility

  let inView = true;
  const io = new IntersectionObserver(
    ([e]) => {
      inView = e.isIntersecting;
      if (inView) start();
      else stop();
    },
    { threshold: 0 },
  );
  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);

  // ---- loading: first three frames gate the start, the rest load after first paint

  const load = (i: number, priority: 'high' | 'low') =>
    loadFrame(HERO.frames[i].src[variant], priority).then((img) => {
      if (!disposed) sources[i] = img;
    });

  const firstBatch = HERO.frames.slice(0, 3).map((_, i) => load(i, 'high'));
  Promise.all(firstBatch)
    .then(() => {
      if (disposed) return;
      setup();
      io.observe(container);
      started = true;
      start();
      const rest = () => {
        Promise.all(HERO.frames.slice(3).map((_, k) => load(k + 3, 'low')))
          .then(() => readyResolve())
          .catch(() => {
            if (!disposed) {
              stop();
              opts.onFallback?.('load-error');
            }
          });
      };
      // After first paint.
      requestAnimationFrame(() => setTimeout(rest, 0));
    })
    .catch(() => {
      if (!disposed) opts.onFallback?.('load-error');
    });

  return {
    ready,
    seek(t) {
      stop();
      started = false; // keep the loop from restarting
      clock = t;
      render(t);
    },
    dispose() {
      disposed = true;
      stop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      sources.fill(undefined);
    },
  };
}
