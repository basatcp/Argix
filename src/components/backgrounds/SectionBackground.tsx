import { useEffect, useMemo, useRef, useState } from 'react';
import { BgContext, type AnchorRect, type BgContextValue } from './context';
import { observeVisibility, readEnv, trackMotion, whenCoreReady, type MotionEnv } from './motion';
import { VARIANTS, type Variant } from './variants';

/**
 * Background layer for one section. Place it as a direct child of a section
 * that has `relative isolate`; it sits behind the content (-z-10), never takes
 * pointer events and clips its own layers (so the section keeps its overflow,
 * which sticky children rely on).
 *
 * It measures its box, finds `data-bg-anchor` elements in the section for the
 * variant to build around, pauses everything while off screen and registers
 * for parallax / pointer only while visible and allowed.
 */
export function SectionBackground({
  variant,
  blend = 'none',
}: {
  variant: Variant;
  /** Fade from the page colour at the top and/or bottom, so alternating section tones meet softly. */
  blend?: 'none' | 'top' | 'bottom' | 'both';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number; anchors: Record<string, AnchorRect[]> }>({ w: 0, h: 0, anchors: {} });
  const [env, setEnv] = useState<MotionEnv>(readEnv);
  const [active, setActive] = useState(false);
  const spec = VARIANTS[variant];
  // The hero's environment waits for the Cyber Core's first frame, then fades in.
  const [ready, setReady] = useState(!spec.afterCore);
  useEffect(() => {
    if (ready) return;
    return whenCoreReady(() => window.setTimeout(() => setReady(true), 250));
  }, [ready]);

  // Size + anchors (debounced; re-measured when the section changes size).
  useEffect(() => {
    const root = ref.current;
    const section = root?.parentElement;
    if (!root || !section) return;
    let t = 0;
    const measure = () => {
      const r = root.getBoundingClientRect();
      const anchors: Record<string, AnchorRect[]> = {};
      section.querySelectorAll<HTMLElement>('[data-bg-anchor]').forEach((el) => {
        if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return; // hidden at this breakpoint
        const a = el.getBoundingClientRect();
        const rect = { x: a.left - r.left, y: a.top - r.top, w: a.width, h: a.height, cx: a.left - r.left + a.width / 2, cy: a.top - r.top + a.height / 2 };
        (anchors[el.dataset.bgAnchor!] ??= []).push(rect);
      });
      setBox((prev) => {
        const w = Math.round(r.width);
        const h = Math.round(r.height);
        const same = prev.w === w && prev.h === h && JSON.stringify(prev.anchors) === JSON.stringify(anchors);
        return same ? prev : { w, h, anchors };
      });
      setEnv((prev) => {
        const next = readEnv();
        return prev.tier === next.tier && prev.reduced === next.reduced && prev.finePointer === next.finePointer ? prev : next;
      });
    };
    const schedule = () => {
      window.clearTimeout(t);
      t = window.setTimeout(measure, 120);
    };
    measure();
    const ro = new ResizeObserver(schedule);
    ro.observe(section);
    return () => {
      window.clearTimeout(t);
      ro.disconnect();
    };
  }, []);

  // Visibility: pause CSS animations and stop work off screen; first entry triggers reveals.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (env.reduced) root.dataset.entered = 'true';
    return observeVisibility(root, (visible) => {
      root.dataset.active = String(visible);
      if (visible) root.dataset.entered = 'true';
      setActive(visible);
    });
  }, [env.reduced]);

  // Parallax and pointer glow, only while visible, never on phones or for reduced motion.
  useEffect(() => {
    const root = ref.current;
    if (!root || !active || env.reduced || env.tier === 'mobile') return;
    const parallax = env.tier === 'desktop' ? spec.parallax ?? 0 : (spec.parallax ?? 0) * 0.4;
    const pointer = env.tier === 'desktop' && env.finePointer ? spec.pointer ?? 0 : 0;
    if (!parallax && !pointer) return;
    return trackMotion({ el: root, parallax, pointer });
  }, [active, env, spec]);

  const value = useMemo<BgContextValue>(
    () => ({ w: box.w, h: box.h, anchors: box.anchors, env, active, animate: !env.reduced }),
    [box, env, active],
  );
  const Layers = spec.Component;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`sbg pointer-events-none absolute inset-0 -z-10 ${spec.afterCore ? 'sbg--after-core' : ''}`}
      data-active="false"
      data-entered="false"
      data-variant={variant}
    >
      {ready && box.w > 0 && box.h > 0 && (
        <BgContext.Provider value={value}>
          <Layers />
        </BgContext.Provider>
      )}
      {(blend === 'top' || blend === 'both') && <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink-950 to-transparent" />}
      {(blend === 'bottom' || blend === 'both') && <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-950 to-transparent" />}
    </div>
  );
}
