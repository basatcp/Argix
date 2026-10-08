import { useEffect, useRef, useState } from 'react';
import { BRAND, NAV } from '../data/site';
import { Icon } from './Icons';
import { Logo } from './Logo';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? 'border-b border-line bg-ink-950/85 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <div className="container-site flex h-[72px] items-center justify-between">
        <a href="#top" className="rounded-md" aria-label={`${BRAND.name} home`}>
          <Logo />
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-lg px-3.5 py-2 text-[14.5px] font-medium text-muted transition-colors hover:text-text"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a href={BRAND.bookingUrl} className="btn-primary hidden !py-2.5 !text-sm sm:inline-flex">
            Book a Consultation
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line text-text lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      <div id="mobile-menu" hidden={!open} className="border-t border-line bg-ink-950/95 lg:hidden">
        <nav aria-label="Mobile" className="container-site py-4">
          <ul className="flex flex-col">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 text-base font-medium text-text/90 hover:text-cyan"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a href={BRAND.bookingUrl} onClick={() => setOpen(false)} className="btn-primary mt-3 w-full">
            Book a Free Consultation
          </a>
        </nav>
      </div>
    </header>
  );
}
