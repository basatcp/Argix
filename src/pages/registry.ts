import type { ComponentType } from 'react';
import type { PageKey } from '../data/routes';
import { HomePage } from './HomePage';

/**
 * Page components by route. The homepage is part of the main bundle; inner pages
 * are separate chunks, loaded before they are shown (during the page transition,
 * or before the first render on a direct visit) and prefetched when the browser
 * is idle, so navigating never waits on the network.
 */
const LOADERS: Record<Exclude<PageKey, 'home'>, () => Promise<ComponentType>> = {
  services: () => import('./ServicesPage').then((m) => m.ServicesPage),
  industries: () => import('./IndustriesPage').then((m) => m.IndustriesPage),
  process: () => import('./ProcessPage').then((m) => m.ProcessPage),
  security: () => import('./SecurityPage').then((m) => m.SecurityPage),
  faq: () => import('./FaqPage').then((m) => m.FaqPage),
};

const loaded = new Map<PageKey, ComponentType>([['home', HomePage]]);
const pending = new Map<PageKey, Promise<ComponentType>>();

/** The page component if it is already loaded. */
export function loadedPage(key: PageKey): ComponentType | undefined {
  return loaded.get(key);
}

/** Load a page (once); resolves immediately for loaded pages. */
export function loadPage(key: PageKey): Promise<ComponentType> {
  const ready = loaded.get(key);
  if (ready) return Promise.resolve(ready);
  let p = pending.get(key);
  if (!p) {
    p = LOADERS[key as Exclude<PageKey, 'home'>]().then((c) => {
      loaded.set(key, c);
      return c;
    });
    pending.set(key, p);
    // A failed load (e.g. offline) can be retried on the next navigation.
    p.catch(() => pending.delete(key));
  }
  return p;
}

/** Fetch every inner page in the background once the browser is idle. */
export function prefetchPages() {
  const run = () => (Object.keys(LOADERS) as PageKey[]).forEach((k) => loadPage(k).catch(() => {}));
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  if (idle) idle(run, { timeout: 4000 });
  else window.setTimeout(run, 2500);
}
