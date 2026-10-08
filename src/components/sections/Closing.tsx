import { useId, useState } from 'react';
import { BRAND, FAQS, FOOTER_COLUMNS } from '../../data/site';
import { Icon } from '../Icons';
import { Logo } from '../Logo';
import { SectionHeading } from '../ui';

/* SECTION 11: FAQ (accessible accordion) */
function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const id = useId();
  const btnId = `${id}-btn`;
  const panelId = `${id}-panel`;
  return (
    <li className="border-b border-line last:border-b-0">
      <h3>
        <button
          id={btnId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-6 py-6 text-left text-[17px] font-medium text-text transition-colors hover:text-cyan md:text-[18px]"
        >
          {q}
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition duration-300 ${
              open ? 'rotate-180 border-electric/50 text-cyan' : 'border-line text-muted'
            }`}
            aria-hidden="true"
          >
            <Icon name="chevronDown" className="h-4 w-4" />
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        className={`grid transition-[grid-template-rows,visibility] duration-300 ease-out ${open ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <p className="max-w-[680px] pb-6 pr-12 text-[15.5px] leading-relaxed text-muted">{a}</p>
        </div>
      </div>
    </li>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" aria-labelledby="faq-title" className="section-pad relative">
      <div className="container-site grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <SectionHeading id="faq-title" align="left" eyebrow="FAQ" title="Questions We Hear Before Every Project" />
          <p data-reveal className="mt-6 text-[15px] text-muted">
            Something else on your mind?{' '}
            <a href="#contact" className="font-medium text-electric underline-offset-4 hover:underline">
              Ask an engineer directly.
            </a>
          </p>
        </div>
        <ul data-reveal className="card px-6 md:px-8">
          {FAQS.map((f, i) => (
            <FaqItem key={f.q} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/* Footer */
export function Footer() {
  return (
    <footer className="relative border-t border-line bg-ink-900" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        Site footer
      </h2>
      <div className="container-site grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-16">
        <div className="max-w-[320px]">
          <a href="#top" aria-label={`${BRAND.name} home`} className="inline-block rounded-md">
            <Logo />
          </a>
          <p className="mt-5 text-[14.5px] leading-relaxed text-muted">{BRAND.tagline}</p>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-text">{col.title}</h3>
            <ul className="mt-5 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-[14.5px] text-muted transition-colors hover:text-text">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-site flex flex-col items-start justify-between gap-4 py-6 text-sm text-muted sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {/* TODO: Link to the published privacy policy and terms. */}
            <li>
              <a href="#" className="hover:text-text">
                Privacy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-text">
                Terms
              </a>
            </li>
            <li>
              <a href={BRAND.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-text">
                <Icon name="linkedin" className="h-4 w-4" />
                LinkedIn
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${BRAND.email}`} className="inline-flex items-center gap-1.5 hover:text-text">
                <Icon name="mail" className="h-4 w-4" />
                Email
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
