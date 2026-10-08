import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { FINAL_FRAME, FIRST_FRAME, HERO, createHeroSequence, type SequenceHandle } from '../hero/sequence';

const ALT =
  'The Hexagonal Cyber Core opening: a closed hexagonal shell powers up, its outer panels slide apart to reveal rotating rings around a glowing central cube, and six service modules settle into orbit.';

/** Same breakpoint as the preload hints injected into index.html (vite.config.ts). */
const LG_QUERY = '(min-width: 768px)';

type Mode = 'poster' | 'playing' | 'static';

declare global {
  interface Window {
    /** Exposed with `?hero=debug` for frame-accurate QA captures. */
    __hero?: SequenceHandle;
  }
}

function prefersStatic() {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return !!conn?.saveData;
}

/**
 * Hero visual. The first keyframe is shown immediately as a plain image (it is
 * preloaded), the canvas takes over on its first draw with an identical frame,
 * and the final keyframe is the static fallback for reduced motion, data saver,
 * slow devices or load errors.
 */
export function HeroSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<Mode>('poster');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (reduced || prefersStatic()) {
      setMode('static');
      return;
    }
    setMode('poster');
    const variant = window.matchMedia(LG_QUERY).matches ? 'lg' : 'sm';
    const low = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches || (navigator.hardwareConcurrency ?? 8) <= 4;
    const debug = new URLSearchParams(window.location.search).get('hero') === 'debug';
    const handle = createHeroSequence({
      canvas,
      variant,
      quality: low ? 'low' : 'high',
      debug,
      onFirstDraw: () => setMode('playing'),
      onFallback: () => setMode('static'),
    });
    if (debug) window.__hero = handle;
    return () => handle.dispose();
  }, [reduced]);

  const size = HERO.sizes.lg;
  // Reduced motion swaps the poster itself for the final frame, so nothing animates or reloads.
  const showPoster = mode === 'poster' || (mode === 'static' && reduced);

  return (
    <div className="relative aspect-square w-full" role="img" aria-label={ALT}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[16%] rounded-full bg-[radial-gradient(circle,rgba(30,167,255,0.14),rgba(59,130,246,0.04)_50%,transparent_72%)]"
      />
      <picture>
        <source media={`(prefers-reduced-motion: reduce) and ${LG_QUERY}`} srcSet={FINAL_FRAME.src.lg} />
        <source media="(prefers-reduced-motion: reduce)" srcSet={FINAL_FRAME.src.sm} />
        <source media={LG_QUERY} srcSet={FIRST_FRAME.src.lg} />
        <img
          src={FIRST_FRAME.src.sm}
          alt=""
          width={size}
          height={size}
          decoding="async"
          {...{ fetchpriority: 'high' }}
          className={`absolute inset-0 h-full w-full select-none ${showPoster ? 'opacity-100' : 'opacity-0'}`}
        />
      </picture>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        style={{ opacity: mode === 'playing' ? 1 : 0, transition: mode === 'static' ? 'opacity 700ms ease' : 'none' }}
      />
      {mode === 'static' && !reduced && (
        <picture>
          <source media={LG_QUERY} srcSet={FINAL_FRAME.src.lg} />
          <img
            src={FINAL_FRAME.src.sm}
            alt=""
            width={size}
            height={size}
            decoding="async"
            className="absolute inset-0 h-full w-full select-none motion-safe:animate-[fadein_700ms_ease_both]"
          />
        </picture>
      )}
    </div>
  );
}
