import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

/**
 * One shared reveal for every element marked with `data-reveal`: a fade with a
 * short rise that depends on what the element is (headings 24px, body copy
 * 14px, cards and groups 20px), 650 ms, ease-out-quint (= cubic-bezier(0.22, 1,
 * 0.36, 1)), 80 ms stagger. Initial state is set from JS so content stays
 * visible if scripts fail; skipped entirely for reduced motion.
 *
 * Called once per page with the page's root element, so every page (and every
 * visit to it) sets up its own reveals and cleans them up when it unmounts.
 */
const EASE = 'power4.out'; // quint out, i.e. cubic-bezier(0.22, 1, 0.36, 1)
const rise = (el: Element) => {
  if (/^H[1-6]$/.test(el.tagName) || el.classList.contains('h-section')) return 24;
  if (el.tagName === 'P') return 14;
  return 20;
};
function hashTarget() {
  try {
    const id = decodeURIComponent(window.location.hash.slice(1));
    return id ? document.getElementById(id) : null;
  } catch {
    return null;
  }
}

export function useScrollReveal(rootRef: RefObject<HTMLElement>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (prefersReducedMotion() || !root) return;
    const revealed = new WeakSet<Element>();
    let items: HTMLElement[] = [];
    const reveal = (els: Element[]) => {
      const fresh = els.filter((el) => !revealed.has(el));
      fresh.forEach((el) => revealed.add(el));
      // Jumping down the page (an anchor link, /#contact) enters everything above at once.
      // Content already scrolled past appears instantly; only what is on screen animates,
      // 80 ms apart; from the seventh item on they start together, so nothing waits more than ~0.5 s.
      const above = fresh.filter((el) => el.getBoundingClientRect().bottom < 0);
      const onScreen = fresh.filter((el) => !above.includes(el));
      if (above.length) gsap.set(above, { opacity: 1, y: 0, overwrite: true });
      if (onScreen.length) {
        gsap.to(onScreen, { opacity: 1, y: 0, duration: 0.65, ease: EASE, stagger: (i: number) => Math.min(i, 6) * 0.08, overwrite: true });
      }
    };
    /** Safety net after a re-measure: reveal anything at or above the reveal line that was missed. */
    const revealPassed = () => {
      const line = window.innerHeight * 0.88;
      reveal(items.filter((el) => el.getBoundingClientRect().top < line));
    };

    const ctx = gsap.context(() => {
      items = gsap.utils.toArray<HTMLElement>('[data-reveal]', root);
      // A #fragment target (or the block containing it) only fades, without the rise, so a
      // deep link lands exactly where the router scrolled it.
      const target = hashTarget();
      // Opacity only (not visibility) so keyboard focus can still reach content before it is revealed.
      gsap.set(items, { opacity: 0, y: (_: number, el: Element) => (target && el.contains(target) ? 0 : rise(el)) });
      ScrollTrigger.batch(items, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => reveal(batch),
      });

      // Line-draw dividers
      gsap.utils.toArray<HTMLElement>('[data-draw]', root).forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          { scaleX: 1, duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } },
        );
      });
    }, root);

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
    // Observing the page also covers web fonts swapping in.
    // After every refresh (ours or ScrollTrigger's own), once the scroll position is restored.
    const onRefreshed = () => {
      requestAnimationFrame(revealPassed);
    };
    ScrollTrigger.addEventListener('refresh', onRefreshed);
    const ro = new ResizeObserver(refresh);
    ro.observe(root);
    // Keyboard focus can land on content below the reveal line (a focused element is scrolled
    // only just into view): reveal whatever holds it, so focus is never on something invisible.
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as Node | null;
      const hit = items.filter((el) => !revealed.has(el) && t && el.contains(t));
      if (hit.length) reveal(hit);
    };
    root.addEventListener('focusin', onFocusIn);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      ScrollTrigger.removeEventListener('refresh', onRefreshed);
      ro.disconnect();
      root.removeEventListener('focusin', onFocusIn);
      ctx.revert();
    };
  }, [rootRef]);
}
