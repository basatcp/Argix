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
    const revealed = new WeakSet<Element>();
    let items: HTMLElement[] = [];
    const reveal = (els: Element[]) => {
      const fresh = els.filter((el) => !revealed.has(el));
      fresh.forEach((el) => revealed.add(el));
      // Jumping down the page (an anchor link, /#contact) enters everything above at once.
      // Content already scrolled past appears instantly; only what is on screen animates,
      // with the stagger capped so the last item never waits more than ~0.5 s.
      const above = fresh.filter((el) => el.getBoundingClientRect().bottom < 0);
      const onScreen = fresh.filter((el) => !above.includes(el));
      if (above.length) gsap.set(above, { opacity: 1, y: 0, overwrite: true });
      if (onScreen.length) {
        gsap.to(onScreen, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: Math.min(0.08, 0.5 / onScreen.length), overwrite: true });
      }
    };
    /** Safety net after a re-measure: reveal anything at or above the reveal line that was missed. */
    const revealPassed = () => {
      const line = window.innerHeight * 0.88;
      reveal(items.filter((el) => el.getBoundingClientRect().top < line));
    };

    const ctx = gsap.context(() => {
      items = gsap.utils.toArray<HTMLElement>('[data-reveal]');
      // Opacity only (not visibility) so keyboard focus can still reach content before it is revealed.
      gsap.set(items, { opacity: 0, y: 24 });
      ScrollTrigger.batch(items, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => reveal(batch),
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

    // Trigger positions are measured once; anything that changes the page height
    // afterwards (web fonts swapping in, the FAQ accordion, validation messages)
    // would leave them stale and content below would never be revealed.
    // Refreshing re-measures and restores the scroll position, which would cut a smooth
    // scroll short, so it waits until scrolling has settled.
    let timer = 0;
    let lastScroll = 0;
    const onScroll = () => (lastScroll = performance.now());
    const refresh = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (performance.now() - lastScroll < 200) return refresh();
        ScrollTrigger.refresh();
      }, 150);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // Observing <main> also covers web fonts swapping in.
    // After every refresh (ours or ScrollTrigger's own), once the scroll position is restored.
    const onRefreshed = () => {
      requestAnimationFrame(revealPassed);
    };
    ScrollTrigger.addEventListener('refresh', onRefreshed);
    const ro = new ResizeObserver(refresh);
    ro.observe(document.getElementById('main') ?? document.body);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      ScrollTrigger.removeEventListener('refresh', onRefreshed);
      ro.disconnect();
      ctx.revert();
    };
  }, []);
}
