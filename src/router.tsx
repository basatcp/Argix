import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { NOT_FOUND_META, routeByPath, SITE_URL } from './data/routes';

/**
 * A small client-side router (no dependency). Pages are plain links
 * (`<a href="/services">`, `<a href="/security#vciso">`, `<a href="#faq">`): one
 * document-level click handler turns same-origin links into in-app navigation,
 * so every component keeps using ordinary anchors.
 *
 * - history mode (default): real URLs; every route also exists as its own
 *   HTML file after the build, so direct visits and reloads work anywhere.
 * - memory mode (VITE_ROUTER_MODE=memory): the URL never changes. Used for the
 *   single-file preview, which is served from a path the app does not own.
 */

const MODE: 'history' | 'memory' = import.meta.env.VITE_ROUTER_MODE === 'memory' ? 'memory' : 'history';
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export interface Location {
  path: string;
  hash: string;
  /** Increments on every navigation. */
  key: number;
  /** Scroll position to restore (back/forward). */
  restoreY?: number;
}

interface RouterValue {
  location: Location;
  navigate: (to: string, opts?: { replace?: boolean }) => void;
}

const RouterContext = createContext<RouterValue>({ location: { path: '/', hash: '', key: 0 }, navigate: () => {} });

export const useRouter = () => useContext(RouterContext);

/** '/services/' -> '/services', base path stripped, '' -> '/'. */
export function normalizePath(pathname: string) {
  let p = pathname;
  if (BASE && p.startsWith(BASE)) p = p.slice(BASE.length);
  p = p.replace(/\/index\.html$/, '/').replace(/\/+$/, '');
  return p === '' ? '/' : p;
}

/** The path the app starts on. */
export function initialPath() {
  return MODE === 'memory' ? '/' : normalizePath(window.location.pathname);
}

function fromWindow(key: number, restoreY?: number): Location {
  if (MODE === 'memory') return { path: '/', hash: '', key };
  return { path: normalizePath(window.location.pathname), hash: window.location.hash, key, restoreY };
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** A plain primary click (no modifier keys): the kind the app handles itself instead of the browser. */
export function isPlainClick(e: { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

/**
 * Scroll to the element a #hash names (smoothly unless reduced motion) and move
 * keyboard focus with it, so Tab continues from where the reader landed.
 */
export function scrollToHash(hash: string, smooth: boolean) {
  let id = hash.replace(/^#/, '');
  try {
    id = decodeURIComponent(id);
  } catch {
    // Malformed escape sequence: look the id up as written.
  }
  const target = id ? document.getElementById(id) : null;
  if (!target) return false;
  target.scrollIntoView({ behavior: smooth && !reduced() ? 'smooth' : 'auto', block: 'start' });
  if (!target.matches('a[href], button, input, select, textarea, [tabindex]')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  return true;
}

/** Title, description, canonical and social tags for the current page. */
export function applyMeta(path: string) {
  const route = routeByPath(path);
  const meta = route ?? NOT_FOUND_META;
  document.title = meta.title;
  const set = (selector: string, attr: string, value: string) => document.querySelector(selector)?.setAttribute(attr, value);
  const url = SITE_URL + (route ? route.path : path);
  set('meta[name="description"]', 'content', meta.description);
  set('link[rel="canonical"]', 'href', url);
  set('meta[property="og:url"]', 'content', url);
  set('meta[property="og:title"]', 'content', meta.title);
  set('meta[property="og:description"]', 'content', meta.description);
  set('meta[name="twitter:title"]', 'content', meta.title);
  set('meta[name="twitter:description"]', 'content', meta.description);
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location>(() => fromWindow(0));
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(() => {
    if (MODE !== 'history') return;
    // The router restores scroll positions itself (after the page has rendered).
    window.history.scrollRestoration = 'manual';
    const onPop = (e: PopStateEvent) => {
      const next = fromWindow(locationRef.current.key + 1, typeof e.state?.scrollY === 'number' ? e.state.scrollY : undefined);
      if (next.path === locationRef.current.path) {
        // Same page, different #hash (or none).
        if (!next.hash || !scrollToHash(next.hash, true)) window.scrollTo({ top: next.restoreY ?? 0, behavior: reduced() ? 'auto' : 'smooth' });
        setLocation((l) => ({ ...l, hash: next.hash }));
        return;
      }
      setLocation(next);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to: string, { replace = false }: { replace?: boolean } = {}) => {
    const current = locationRef.current;
    const i = to.indexOf('#');
    const rawPath = i === -1 ? to : to.slice(0, i);
    const hash = i === -1 ? '' : to.slice(i);
    const path = rawPath ? normalizePath(rawPath) : current.path;
    const url = BASE + path + (hash.length > 1 ? hash : '');

    if (MODE === 'history') {
      // Remember where we were, for the back button.
      window.history.replaceState({ ...(window.history.state ?? {}), scrollY: window.scrollY }, '');
    }

    if (path === current.path) {
      // In-page: scroll to the section (or back to the top).
      if (hash.length > 1) scrollToHash(hash, true);
      else window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
      if (MODE === 'history' && url !== window.location.pathname + window.location.hash) {
        window.history[replace ? 'replaceState' : 'pushState'](null, '', url);
      }
      if (hash !== current.hash) setLocation({ ...current, hash });
      return;
    }

    if (MODE === 'history') window.history[replace ? 'replaceState' : 'pushState'](null, '', url);
    setLocation({ path, hash: hash.length > 1 ? hash : '', key: current.key + 1 });
  }, []);

  // Turn same-origin link clicks into in-app navigation.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || !isPlainClick(e)) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const href = a.getAttribute('href') ?? '';
      if (!href || href === '#' || /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) return;
      e.preventDefault();
      if (href.startsWith('#')) {
        navigate(href);
        return;
      }
      const url = new URL(href, window.location.href);
      navigate(url.pathname + url.hash);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);

  const value = useMemo(() => ({ location, navigate }), [location, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}
