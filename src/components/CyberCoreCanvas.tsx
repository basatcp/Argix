import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

const FALLBACK_ALT =
  'The Hexagonal Cyber Core: a layered hexagonal structure with a glowing central cube, inner rotating rings, an opened outer shield and six orbiting service modules.';

type Status = 'loading' | 'ready' | 'fallback';

/**
 * Mounts the WebGL Cyber Core. The three.js scene is code-split so it never
 * blocks first paint; without WebGL a static render of the final state is shown.
 */
export function CyberCoreCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let disposed = false;
    let handle: { dispose: () => void } | undefined;

    import('../three/CyberCore')
      .then(({ createCyberCore, isWebGLAvailable }) => {
        if (disposed || !canvasRef.current) return;
        if (!isWebGLAvailable()) {
          setStatus('fallback');
          return;
        }
        const low = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches || (navigator.hardwareConcurrency ?? 8) <= 4;
        handle = createCyberCore(canvasRef.current, {
          reducedMotion: reduced,
          quality: low ? 'low' : 'high',
          onFirstFrame: () => !disposed && setStatus('ready'),
        });
      })
      .catch(() => !disposed && setStatus('fallback'));

    return () => {
      disposed = true;
      handle?.dispose();
    };
  }, [reduced]);

  return (
    <div className="relative aspect-square w-full">
      {/* Ambient glow behind the object */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(30,167,255,0.22),rgba(59,130,246,0.06)_45%,transparent_70%)]"
      />
      {status === 'fallback' ? (
        <picture>
          <source srcSet="/cyber-core.webp" type="image/webp" />
          <img
            src="/cyber-core.png"
            alt={FALLBACK_ALT}
            width={960}
            height={960}
            className="relative h-full w-full object-contain"
            decoding="async"
          />
        </picture>
      ) : (
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={FALLBACK_ALT}
          className={`relative block h-full w-full transition-opacity duration-700 ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}
