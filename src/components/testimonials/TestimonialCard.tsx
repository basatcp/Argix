import type { Testimonial } from '../../data/testimonials';

/** Small outline quotation mark, in the same icon tile as other cards. */
function QuoteMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 6.5h5.2v5.4c0 3.1-1.7 5.1-4.7 5.9l-.6-1.5c1.7-.6 2.6-1.8 2.7-3.3H4.5Zm9.8 0h5.2v5.4c0 3.1-1.7 5.1-4.7 5.9l-.6-1.5c1.7-.6 2.6-1.8 2.7-3.3h-2.6Z" />
    </svg>
  );
}

/** Neutral hexagonal avatar mark (no photos). */
function AvatarMark() {
  return (
    <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-ink-800">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path d="M12 3.5 19.4 7.75v8.5L12 20.5l-7.4-4.25v-8.5Z" stroke="rgba(56,189,248,0.55)" strokeWidth="1.2" />
        <circle cx="12" cy="10.4" r="2.4" stroke="rgba(56,189,248,0.8)" strokeWidth="1.2" />
        <path d="M8.2 16.2c.8-1.7 2.2-2.6 3.8-2.6s3 .9 3.8 2.6" stroke="rgba(56,189,248,0.8)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="t-card card group relative flex h-full flex-col p-7 transition-[transform,border-color,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] hover:border-electric/45 hover:bg-card md:p-8">
      <div className="flex items-center justify-between gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-ink-800 text-electric/60 transition-colors duration-300 group-hover:border-electric/40 group-hover:text-cyan">
          <QuoteMark />
        </span>
        {t.projectType && <span className="text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-muted/80">{t.projectType}</span>}
      </div>
      <blockquote className="mt-6 flex-1">
        <p className="text-[16.5px] leading-relaxed text-[#D5DDE8] md:text-[17px]">{t.quote}</p>
      </blockquote>
      <figcaption className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-5">
        <span className="flex min-w-0 items-center gap-3">
          <AvatarMark />
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-semibold tracking-[-0.005em] text-text">{t.name}</span>
            <span className="block truncate text-[13.5px] text-muted">
              {t.role}, {t.company}
            </span>
          </span>
        </span>
        {t.industry && (
          <span className="shrink-0 rounded-md border border-line px-2.5 py-1 text-[12px] font-medium tracking-wide text-[#C9D3E0]">{t.industry}</span>
        )}
      </figcaption>
    </figure>
  );
}
