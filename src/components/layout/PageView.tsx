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

/** Page transition (about 360ms in all): the old page fades out, the new one fades in with a short rise. */
const OUT_MS = 100;
const IN_MS = 260;

/** A known page whose code couldn't be fetched (offline, or an old cached HTML after a deploy). */
function PageLoadFailed() {
  return (
    <section aria-labelledby="load-failed-title" className="page-hero relative isolate pb-24 pt-36 md:pb-32 md:pt-44">
      <div aria-hidden="true" className="grid-bg absolute inset-0 -z-10 opacity-40" />
      <div className="container-site max-w-[760px]">
        <p className="eyebrow">
          <span className="h-px w-6 bg-cyan" aria-hidden="true" />
          Connection problem
        </p>
        <h1 id="load-failed-title" tabIndex={-1} className="mt-5 text-[38px] font-semibold leading-[1.06] tracking-[-0.032em] text-text sm:text-[46px]">
          This Page Couldn’t Load
        </h1>
        <p className="lead mt-6">Its content didn’t arrive, usually because the connection dropped. Reload to try again.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => window.location.reload()} className="btn-primary">
            Reload the Page
          </button>
          <a href="/" className="btn-secondary">
            Back to Home
          </a>
        </div>
      </div>
    </section>
  );
}

/** One page with its own scroll reveals (set up after the page's content has mounted). */
function Page({ path }: { path: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollReveal(ref);
  const key = routeByPath(path)?.key;
  // Pages are loaded before they are shown (see the navigation effect and main.tsx); a known
  // page that still isn't loaded failed to download.
  const Component = !key ? NotFoundPage : (loadedPage(key) ?? PageLoadFailed);
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
    if (location.path === shown.path) {
      // Same page: only the #hash changed (the router scrolled), or the reader came back
      // (e.g. Back) before the swap happened; then cancel the fade-out that had started.
      setPhase((p) => (p === 'out' ? 'in' : p));
      return;
    }
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
  }, [location, shown.path]);

  // Keep the focused element out from under the fixed header (e.g. when tabbing backwards,
  // browsers scroll it to the very top). Anchor jumps already clear it through scroll margins.
  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target;
      if (!(el instanceof HTMLElement) || el.tabIndex < 0 || el.closest('header, nav.sticky, [role="dialog"]')) return;
      if (!el.matches(':focus-visible')) return; // keyboard focus only, not mouse clicks
      const sticky = document.querySelector<HTMLElement>('main nav.sticky');
      const covered = 72 + (sticky && getComputedStyle(sticky).position === 'sticky' ? sticky.getBoundingClientRect().height : 0);
      const top = el.getBoundingClientRect().top;
      if (top < covered + 8) window.scrollBy({ top: top - covered - 16 });
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, []);

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

  // The new page is mounted at its start state (transparent, 12px lower): flush that style,
  // then start the fade-in right away, before the first paint.
  useLayoutEffect(() => {
    if (phase !== 'enter') return;
    void mainRef.current?.offsetHeight;
    setPhase('in');
  }, [phase]);

  useEffect(() => {
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
