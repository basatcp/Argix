import { VCISO } from '../../data/security';
import { Icon } from '../Icons';
import { ConsultButton } from '../page/ConsultButton';
import { PageSection } from '../page/PageSection';
import { SecurityIntro } from './SecurityIntro';

/**
 * 03 vCISO: the intro stays in view (sticky) beside an index of the five
 * capabilities. They are areas of responsibility, not a sequence, so the
 * index is an unordered list of title/description rows.
 */
export function VirtualCiso() {
  return (
    <PageSection id="vciso" labelledBy="vciso-title" background="minimal" className="lg:!scroll-mt-[60px]">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 xl:gap-20">
        <div className="lg:sticky lg:top-44 lg:self-start">
          <SecurityIntro id="vciso-title" eyebrow={VCISO.eyebrow} title={VCISO.title} lead={VCISO.lead} />
          <p data-reveal className="mt-8 flex max-w-[520px] gap-3 rounded-xl border border-line bg-ink-900/60 p-4 text-[14.5px] leading-relaxed text-[#C9D3E0]">
            <Icon name="userShield" className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
            {VCISO.fit}
          </p>
          <div data-reveal className="mt-7">
            <ConsultButton source="security-vciso" label="Discuss vCISO Support" variant="link" className="min-h-[44px]" />
          </div>
        </div>

        {/* lg:mt-2 puts the top rule on the eyebrow's line. */}
        <ul className="border-t border-line lg:mt-2">
          {VCISO.capabilities.map((c) => (
            <li key={c.title} data-reveal className="group relative border-b border-line">
              <span
                aria-hidden="true"
                className="absolute -top-px left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-cyan to-primary/0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
              />
              <div className="grid gap-2 py-7 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)] md:gap-x-8 md:py-8">
                <h3 className="flex items-center gap-3.5 text-[20px] font-semibold tracking-[-0.015em] text-text md:text-[21px]">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rotate-45 bg-electric transition-colors duration-300 group-hover:bg-cyan"
                  />
                  {c.title}
                </h3>
                <p className="pl-5 text-[15px] leading-relaxed text-muted md:pl-0 md:pt-0.5">{c.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </PageSection>
  );
}
