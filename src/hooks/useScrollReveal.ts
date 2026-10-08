import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

/**
 * Fade-up reveal for every element marked with `data-reveal`.
 * Siblings entering together are staggered. Initial state is set from JS so
 * content stays visible if scripts fail; skipped entirely for reduced motion.
 */
export function useScrollReveal() {
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('[data-reveal]');
      // Opacity only (not visibility) so keyboard focus can still reach content before it is revealed.
      gsap.set(items, { opacity: 0, y: 24 });
      ScrollTrigger.batch(items, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, overwrite: true }),
      });

      // Line-draw dividers
      gsap.utils.toArray<HTMLElement>('[data-draw]').forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          { scaleX: 1, duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } },
        );
      });
    });
    return () => ctx.revert();
  }, []);
}
