import { useEffect, useRef } from 'react';

const FADE_EDGES = 'linear-gradient(180deg, transparent, #000 220px, #000 calc(100% - 220px), transparent)';

/**
 * "The active section slightly brightens": a soft light over the section's
 * background that fades in while the section crosses the middle of the
 * viewport. Place it inside a PageSection (it fills the section, above the
 * background and below the content). Opacity only; a plain switch for reduced motion.
 */
export function ActiveGlow({ at = '50% 22%' }: { at?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const section = el?.closest('section');
    if (!el || !section) return;
    const io = new IntersectionObserver(([e]) => (el.dataset.on = String(e.isIntersecting)), { rootMargin: '-45% 0px -45% 0px' });
    io.observe(section);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-on="false"
      className="pointer-events-none absolute inset-0 -z-[5] opacity-0 transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] data-[on=true]:opacity-100"
      style={{
        background: `radial-gradient(ellipse 70% 45% at ${at}, rgba(30,167,255,0.075), transparent 70%)`,
        // never a hard edge where sections meet
        maskImage: FADE_EDGES,
        WebkitMaskImage: FADE_EDGES,
      }}
    />
  );
}
