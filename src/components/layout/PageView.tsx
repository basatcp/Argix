import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { routeByPath } from '../../data/routes';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { applyMeta, scrollToHash, useRouter, type Location } from '../../router';
import { loadPage, loadedPage, prefetchPages } from '../../pages/registry';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { whenCoreReady } from '../backgrounds/motion';
import { Footer } from '../sections/Closing';

/** Page transition: the old page fades out, the new one fades in with a short rise. */
const OUT_MS = 160;
const IN_MS = 340;

/** One page with its own scroll reveals (set up after the page's content has mounted). */
function Page({ path }: { path: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollReveal(ref);
  const key = routeByPath(path)?.key;
  // Pages are loaded before they are shown (see the navigation effect and main.tsx).
  const Component = (key && loadedPage(key)) || NotFoundPage;
  return (
    <div ref={ref}>
      <Component />
    </div>
  );
}

type Phase = 'idle' | 'out' | 'enter' | 'in';

/**
 * The routed part of the layout: <main> plus the footer. The header stays
 * outside, so it never moves or re-renders between pages.
 */
export function PageView() {
  const { location } = useRouter();
  const [shown, setShown] = useState<Location>(location);
  const [phase, setPhase] = useState<Phase>('idle');
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  // A new page was requested: fade the current one out while its code loads, then swap.
  useEffect(() => {
    if (location.path === shown.path) return; // same page (only the #hash changed; the router scrolled)
    const key = routeByPath(location.path)?.key;
    let cancelled = false;
    const ready = key ? loadPage(key) : Promise.resolve();
    const reduced = prefersReducedMotion();
    if (!reduced) setPhase('out');
    Promise.all([ready, new Promise((r) => window.setTimeout(r, reduced ? 0 : OUT_MS))]).then(
      () => {
        if (cancelled) return;
        setShown(location);
        if (!reduced) setPhase('enter');
      },
      // The page's code couldn't load (e.g. offline): let the browser load the URL itself.
      () => !cancelled && window.location.reload(),
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // Fetch the other pages in the background; on the homepage, only once the Cyber Core is up.
  useEffect(() => {
    if (location.path === '/') return whenCoreReady(prefetchPages, 6000);
    prefetchPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The new page is in the DOM: update meta, scroll, move focus.
  useLayoutEffect(() => {
    applyMeta(shown.path);
    if (firstRender.current) {
      firstRender.current = false;
      // The page renders after the browser tried to honour a #fragment (e.g. /#contact), so jump to it now.
      if (shown.hash) scrollToHash(shown.hash, false);
      return;
    }
    window.scrollTo(0, shown.restoreY ?? 0);
    const toHash = shown.hash && shown.restoreY === undefined && scrollToHash(shown.hash, false);
    if (!toHash) {
      // Start keyboard and screen reader users at the new page's heading.
      const h1 = mainRef.current?.querySelector('h1');
      if (h1) {
        if (!h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1');
        h1.focus({ preventScroll: true });
      }
    }
  }, [shown.key]);

  useEffect(() => {
    if (phase === 'enter') {
      // Paint the start state once, then transition in.
      let inner = 0;
      const outer = requestAnimationFrame(() => (inner = requestAnimationFrame(() => setPhase('in'))));
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }
    if (phase === 'in') {
      const t = window.setTimeout(() => {
        setPhase('idle');
        // Scroll-linked positions were measured while the page was still offset.
        ScrollTrigger.refresh();
      }, IN_MS + 40);
      return () => window.clearTimeout(t);
    }
  }, [phase]);

  return (
    <div className="page-view" data-phase={phase}>
      <main ref={mainRef} id="main" tabIndex={-1} className="outline-none">
        <Page key={shown.key} path={shown.path} />
      </main>
      <Footer />
    </div>
  );
}
