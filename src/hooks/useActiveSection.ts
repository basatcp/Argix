import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The in-page section being read, for sub-navigation highlights (Industries,
 * Security, FAQ): the section spanning a line at `line` x viewport height.
 *
 * One IntersectionObserver on a 1px band at that line signals crossings; the
 * current section is then read from positions, so jumps and fast scrolls land
 * correctly. In a gap between two sections the previous one stays current;
 * above the first it is null, and below the last it is null unless `holdAtEnd`.
 *
 * `select(id)` marks a section at once when the reader picks it from the
 * navigation, and ignores the observer until the scroll that follows has
 * settled, so the highlight doesn't step through every section in between.
 */
export function useActiveSection(ids: string[], { line = 0.35, holdAtEnd = false }: { line?: number; holdAtEnd?: boolean } = {}) {
  const [active, setActive] = useState<string | null>(null);
  const muted = useRef(false);
  const startHold = useRef<() => void>(() => {});
  const key = ids.join('|');

  useEffect(() => {
    const els = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const pick = () => {
      if (muted.current) return;
      const y = window.innerHeight * line;
      const hit = els.find((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= y && r.bottom > y;
      });
      if (hit) return setActive(hit.id);
      if (y < els[0].getBoundingClientRect().top) setActive(null);
      else if (y >= els[els.length - 1].getBoundingClientRect().bottom) setActive(holdAtEnd ? els[els.length - 1].id : null);
      // Otherwise the line is in a gap between two sections: keep the current one.
    };
    const top = Math.round(line * 100);
    const io = new IntersectionObserver(pick, { rootMargin: `-${top}% 0px -${99 - top}% 0px` });
    els.forEach((el) => io.observe(el));
    pick();

    // End of a navigation-triggered scroll: `scrollend` where supported, otherwise 160ms
    // without scroll events; never muted for more than 2.5s.
    let quiet = 0;
    let cap = 0;
    const release = () => {
      if (!muted.current) return;
      muted.current = false;
      window.clearTimeout(quiet);
      window.clearTimeout(cap);
      pick();
    };
    const onScroll = () => {
      if (!muted.current) return;
      window.clearTimeout(quiet);
      quiet = window.setTimeout(release, 160);
    };
    startHold.current = () => {
      window.clearTimeout(quiet);
      window.clearTimeout(cap);
      cap = window.setTimeout(release, 2500);
      // A scroll that never starts (already in place) still releases.
      quiet = window.setTimeout(release, 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', release);
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', release);
      window.clearTimeout(quiet);
      window.clearTimeout(cap);
      muted.current = false;
    };
  }, [key, line, holdAtEnd]);

  const select = useCallback((id: string) => {
    muted.current = true;
    setActive(id);
    startHold.current();
  }, []);

  return { active, select };
}
