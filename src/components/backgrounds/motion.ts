/**
 * Shared infrastructure for the background motion system. Every section
 * background registers here instead of running its own observers and loops:
 *
 * - one IntersectionObserver decides which backgrounds are on screen
 * - one requestAnimationFrame loop runs only while a visible layer needs it
 * - one scroll listener drives parallax, one pointer listener drives glows
 *
 * Off-screen backgrounds get data-active="false", which pauses all their CSS
 * animations (see backgrounds.css), and are removed from the loop.
 */

export type Tier = 'desktop' | 'tablet' | 'mobile';

export interface MotionEnv {
  reduced: boolean;
  tier: Tier;
  /** Mouse or trackpad: pointer effects allowed. */
  finePointer: boolean;
}

const mq = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches;

export function readEnv(): MotionEnv {
  const w = typeof window === 'undefined' ? 1440 : window.innerWidth;
  return {
    reduced: mq('(prefers-reduced-motion: reduce)'),
    tier: w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop',
    finePointer: mq('(hover: hover) and (pointer: fine)'),
  };
}

// ---------------------------------------------------------------- visibility

type VisibilityListener = (visible: boolean) => void;
const visibilityListeners = new Map<Element, VisibilityListener>();
let io: IntersectionObserver | null = null;

export function observeVisibility(el: Element, listener: VisibilityListener) {
  if (!io) {
    io = new IntersectionObserver(
      (entries) => entries.forEach((e) => visibilityListeners.get(e.target)?.(e.isIntersecting)),
      { rootMargin: '120px 0px' },
    );
  }
  visibilityListeners.set(el, listener);
  io.observe(el);
  return () => {
    visibilityListeners.delete(el);
    io?.unobserve(el);
  };
}

// ---------------------------------------------------------------- frame loop

type FrameCallback = (dt: number, time: number) => void;
const frameCallbacks = new Set<FrameCallback>();
let raf = 0;
let last = 0;
let clock = 0;

function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  clock += dt;
  frameCallbacks.forEach((cb) => cb(dt, clock));
  raf = frameCallbacks.size && !document.hidden ? requestAnimationFrame(frame) : 0;
}

function ensureLoop() {
  if (raf || !frameCallbacks.size || document.hidden) return;
  last = performance.now();
  raf = requestAnimationFrame(frame);
}

/** Run `cb` every frame until the returned function is called. The loop stops when nothing is subscribed. */
export function onFrame(cb: FrameCallback) {
  frameCallbacks.add(cb);
  ensureLoop();
  return () => {
    frameCallbacks.delete(cb);
  };
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else ensureLoop();
  });
}

// ---------------------------------------------------------------- hero start-up

let coreReady = false;
const coreWaiters = new Set<() => void>();

/** Called by the hero once the Cyber Core has drawn its first frame (or shown its fallback). */
export function signalCoreReady() {
  if (coreReady) return;
  coreReady = true;
  coreWaiters.forEach((fn) => fn());
  coreWaiters.clear();
}

/** The core unmounted (the homepage was left); the next hero waits for its new core again. */
export function resetCoreReady() {
  coreReady = false;
}

/** Run `fn` once the core is on screen, or after `timeoutMs` at the latest. */
export function whenCoreReady(fn: () => void, timeoutMs = 4000) {
  if (coreReady) {
    fn();
    return () => {};
  }
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    window.clearTimeout(t);
    coreWaiters.delete(run);
    fn();
  };
  const t = window.setTimeout(run, timeoutMs);
  coreWaiters.add(run);
  return () => {
    done = true;
    window.clearTimeout(t);
    coreWaiters.delete(run);
  };
}

// ---------------------------------------------------------------- scroll + pointer

/** Something that wants scroll/pointer updates while visible (a section background root). */
export interface MotionTarget {
  el: HTMLElement;
  /** Max parallax shift of the deepest layer, px (0 = none). */
  parallax: number;
  /** Max pointer offset of the glow, px (0 = none). */
  pointer: number;
}

const targets = new Set<MotionTarget>();
let scheduled = false;
let pointerX = -1;
let pointerY = -1;

function update() {
  scheduled = false;
  const vh = window.innerHeight;
  targets.forEach((t) => {
    const r = t.el.getBoundingClientRect();
    if (t.parallax) {
      // -1 when the section centre is a viewport below centre, +1 a viewport above.
      const p = Math.max(-1, Math.min(1, (vh / 2 - (r.top + r.height / 2)) / vh));
      t.el.style.setProperty('--bg-shift', (p * t.parallax).toFixed(2) + 'px');
    }
    if (t.pointer && pointerX >= 0) {
      const inside = pointerY >= r.top && pointerY <= r.bottom;
      const nx = inside ? Math.max(-1, Math.min(1, (pointerX - (r.left + r.width / 2)) / (r.width / 2))) : 0;
      const ny = inside ? Math.max(-1, Math.min(1, (pointerY - (r.top + r.height / 2)) / (r.height / 2))) : 0;
      t.el.style.setProperty('--bg-px', (nx * t.pointer).toFixed(2) + 'px');
      t.el.style.setProperty('--bg-py', (ny * t.pointer).toFixed(2) + 'px');
    }
  });
}

function schedule() {
  if (scheduled || !targets.size) return;
  scheduled = true;
  requestAnimationFrame(update);
}

function onPointer(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return;
  pointerX = e.clientX;
  pointerY = e.clientY;
  schedule();
}

let listening = false;
function listen() {
  if (listening) return;
  listening = true;
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('pointermove', onPointer, { passive: true });
}

/** Register a visible background for parallax / pointer updates. */
export function trackMotion(t: MotionTarget) {
  targets.add(t);
  listen();
  schedule();
  return () => {
    targets.delete(t);
  };
}
