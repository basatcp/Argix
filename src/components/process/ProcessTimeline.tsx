import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ProcessStage } from '../../data/process';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import { StageCard, type StageState } from './StageCard';
import { StageIndex } from './StageIndex';

gsap.registerPlugin(ScrollTrigger);

/** Where the reading line sits: 60% down the viewport, but never lower than 480px, so a stage opened from the index is the one that lights. */
const readingLine = () => Math.min(window.innerHeight * 0.6, 480);

/**
 * Scroll-driven process timeline.
 *
 * One ScrollTrigger maps the scroll position to the spine, from the first
 * stage's node to the last one's, as each node crosses the reading line
 * (scrubbed, so it eases a little). From that single progress value:
 * the lit line grows down the spine, a glowing head (the data pulse) travels
 * with it, the stage whose node it has reached becomes active (earlier stages
 * stay softly lit, later ones dim), and the sticky index follows.
 * Per-frame work only writes transforms; React re-renders once per stage change.
 *
 * Desktop: sticky stage index beside the timeline. Tablet: no index. Phones:
 * no travelling head, and details stay in place (only their colour changes).
 * Reduced motion: everything lit and static (the index still marks the stage
 * being read).
 * Never pins or changes scrolling.
 */
export function ProcessTimeline({ stages, intro, after }: { stages: ProcessStage[]; intro: ReactNode; after?: ReactNode }) {
  const [reduced] = useState(prefersReducedMotion);
  const [active, setActive] = useState(-1);
  const activeRef = useRef(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const litRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const tailRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    const items = Array.from(wrap.querySelectorAll<HTMLElement>('[data-stage]'));
    if (!items.length) return;
    const geo = { top: 0, len: 1, at: [] as number[] };

    // Node centres relative to the wrapper (offsets ignore the reveal transforms).
    const measure = () => {
      const ys = items.map((li) => {
        const node = li.querySelector<HTMLElement>('[data-node]');
        return li.offsetTop + (node ? node.offsetTop + node.offsetHeight / 2 : 0);
      });
      geo.top = ys[0];
      geo.len = Math.max(1, ys[ys.length - 1] - ys[0]);
      geo.at = ys.map((y) => y - ys[0]);
      track.style.top = `${geo.top}px`;
      track.style.height = `${geo.len}px`;
      if (headRef.current) headRef.current.style.top = `${geo.top}px`;
      // Dashed continuation from the last node to the closing note (after launch, monitoring continues).
      const tail = tailRef.current;
      const note = afterRef.current;
      if (tail && note) {
        const from = ys[ys.length - 1] + (items[items.length - 1].querySelector<HTMLElement>('[data-node]')?.offsetHeight ?? 24) / 2 + 3;
        const to = note.offsetTop + note.offsetHeight / 2;
        tail.style.top = `${from}px`;
        tail.style.height = `${Math.max(0, to - from)}px`;
      }
    };

    const setStage = (a: number) => {
      if (a === activeRef.current) return;
      activeRef.current = a;
      setActive(a);
    };
    const stageAt = (p: number) => {
      if (p <= 0.0005) return -1;
      const y = p * geo.len + 2;
      let a = 0;
      geo.at.forEach((v, i) => {
        if (v <= y) a = i;
      });
      return a;
    };

    const range = {
      trigger: wrap,
      start: () => {
        measure();
        return `top+=${geo.top} ${readingLine()}px`;
      },
      end: () => `top+=${geo.top + geo.len} ${readingLine()}px`,
    };

    const ctx = gsap.context(() => {
      if (reduced) {
        // Static and fully lit; only the index tracks the stage being read.
        const st = ScrollTrigger.create({ ...range, onUpdate: (s) => setStage(stageAt(s.progress)), onRefresh: (s) => setStage(stageAt(s.progress)) });
        setStage(stageAt(st.progress));
        return;
      }
      const lit = litRef.current;
      const head = headRef.current;
      const bar = barRef.current;
      const proxy = { p: 0 };
      const apply = () => {
        const p = proxy.p;
        if (lit) lit.style.transform = `scaleY(${p.toFixed(4)})`;
        if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
        if (head) {
          head.style.transform = `translate3d(0, ${(p * geo.len).toFixed(1)}px, 0)`;
          head.style.opacity = p > 0.0005 ? '1' : '0';
        }
        setStage(stageAt(p));
      };
      gsap.to(proxy, { p: 1, ease: 'none', onUpdate: apply, scrollTrigger: { ...range, scrub: 0.5, onRefresh: apply } });
    }, wrap);
    return () => ctx.revert();
  }, [reduced]);

  // A short ring burst on the node that just became active.
  useEffect(() => {
    if (reduced || active < 0) return;
    const ring = wrapRef.current?.querySelectorAll<HTMLElement>('[data-burst]')[active];
    if (!ring) return;
    const tween = gsap.fromTo(ring, { scale: 1, opacity: 0.85 }, { scale: 2.6, opacity: 0, duration: 1.1, ease: 'power2.out' });
    return () => {
      tween.kill();
      gsap.set(ring, { opacity: 0 });
    };
  }, [active, reduced]);

  const stateOf = (i: number): StageState => {
    if (reduced) return i === active ? 'active' : 'passed';
    return i < active ? 'passed' : i === active ? 'active' : 'future';
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14 xl:gap-20">
      <div>
        {intro}
        <div className="sticky top-28 mt-12 hidden lg:block">
          <StageIndex stages={stages} active={active} reduced={reduced} barRef={barRef} />
        </div>
      </div>

      <div ref={wrapRef} className="relative">
        {/* Spine: dim line, lit progress, behind the nodes */}
        <div ref={trackRef} aria-hidden="true" className="pointer-events-none absolute left-[11px] top-0 h-0 w-px md:left-4">
          <div className="absolute inset-0 bg-[rgba(90,150,220,0.22)]" />
          <div
            ref={litRef}
            className="absolute inset-0 origin-top bg-gradient-to-b from-cyan via-electric to-primary"
            style={{ transform: reduced ? 'none' : 'scaleY(0)' }}
          />
        </div>
        {after && (
          <div
            ref={tailRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-[11px] top-0 h-0 w-px bg-[linear-gradient(180deg,rgba(90,150,220,0.45)_50%,transparent_50%)] bg-[length:1px_6px] md:left-4"
          />
        )}

        <ol>
          {stages.map((s, i) => (
            <StageCard key={s.id} stage={s} index={i} total={stages.length} state={stateOf(i)} />
          ))}
        </ol>

        {/* Data pulse: a glowing head with a short trail, travelling with the progress (not on phones) */}
        {!reduced && (
          <div ref={headRef} aria-hidden="true" className="pointer-events-none absolute left-[11.5px] top-0 hidden opacity-0 transition-opacity duration-300 md:left-[16.5px] md:block">
            <span className="absolute bottom-0 left-0 h-24 w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-cyan/30 to-cyan/90" />
            <span className="absolute left-0 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#CFF4FF] shadow-[0_0_0_4px_rgba(57,215,255,0.14),0_0_18px_5px_rgba(57,215,255,0.5)]" />
          </div>
        )}

        {after && (
          <div ref={afterRef} className="relative mt-5 pl-9 md:mt-10 md:pl-[76px]">
            <span aria-hidden="true" className="absolute left-[7px] top-1/2 h-[10px] w-[10px] -translate-y-1/2 rotate-45 border border-electric/60 bg-ink-900 md:left-3" />
            <span aria-hidden="true" className="absolute left-5 top-1/2 h-px w-4 bg-[linear-gradient(90deg,rgba(90,150,220,0.45)_50%,transparent_50%)] bg-[length:6px_1px] md:left-[30px] md:w-[46px]" />
            {after}
          </div>
        )}
      </div>
    </div>
  );
}
