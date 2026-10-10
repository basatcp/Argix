import { BRAND, FAQS, FOOTER_COLUMNS } from '../../data/site';
import { FAQAccordion } from '../FAQAccordion';
import { Icon } from '../Icons';
import { Logo } from '../Logo';
import { SectionHeading } from '../ui';
import { SectionBackground } from '../backgrounds/SectionBackground';

/* SECTION 11: FAQ */
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="section-pad relative isolate">
      <SectionBackground variant="minimal" />
      <div className="container-site grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <SectionHeading id="faq-title" align="left" eyebrow="FAQ" title="Questions We Hear Before Every Project" />
          <p data-reveal className="mt-6 text-[15px] text-muted">
            Something else on your mind?{' '}
            <a href="#contact" className="font-medium text-electric underline-offset-4 hover:underline">
              Ask an engineer directly.
            </a>
          </p>
          <a data-reveal href="/faq" className="group mt-2 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-electric">
            Browse all questions
            <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
        <FAQAccordion items={FAQS} />
      </div>
    </section>
  );
}

/* Footer */
export function Footer() {
  return (
    <footer className="relative isolate border-t border-line bg-ink-900" aria-labelledby="footer-title">
      <SectionBackground variant="footer" blend="top" />
      <h2 id="footer-title" className="sr-only">
        Site footer
      </h2>
      <div className="container-site grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-16">
        <div className="max-w-[320px]">
          <a href="/" aria-label={`${BRAND.name} home`} className="inline-block rounded-md">
            <Logo />
          </a>
          <p className="mt-5 text-[14.5px] leading-relaxed text-muted">{BRAND.tagline}</p>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-text">{col.title}</h3>
            {/* 44px tall rows on touch screens; the compact list from 1024px. */}
            <ul className="mt-3 lg:mt-5 lg:space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="inline-flex min-h-[44px] items-center text-[14.5px] text-muted transition-colors hover:text-text lg:min-h-0">
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
