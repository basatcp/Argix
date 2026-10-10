import { pad2 } from '../../lib/format';
import type { ReactNode } from 'react';
import type { Industry } from '../../data/industries';
import { Icon, type IconName } from '../Icons';
import type { Variant } from '../backgrounds/variants';
import { PageSection } from '../page/PageSection';
import { IndustryVisual } from './IndustryVisual';

/**
 * One industry on /industries, as its own section (h2, shared anchor id), in
 * two columns:
 *
 *   index + heading + challenge + example solution types + relevant services (text links)
 *   sector diagram panel (+ standards), then what we build | security considerations
 *
 * The diagram side alternates from block to block; tone and background are
 * passed in so the page can alternate bands. `scrim` softens a busy band
 * background behind the text column. The diagram brightens while its own panel
 * is hovered.
 */
export function IndustrySection({
  industry,
  index,
  total,
  tone,
  background,
  flip = false,
  scrim = false,
}: {
  industry: Industry;
  index: number;
  total: number;
  tone: 'base' | 'raised';
  background: Variant;
  /** Diagram on the left (desktop). */
  flip?: boolean;
  /** Soften the band's background traces behind the text column. */
  scrim?: boolean;
}) {
  const titleId = `${industry.id}-title`;
  const num = pad2(index + 1);
  return (
    // scroll-mt clears the 72px header plus the sticky sub-navigation (61px below xl, 57px at xl).
    <PageSection
      id={industry.id}
      labelledBy={titleId}
      tone={tone}
      background={background}
      className="scroll-mt-[134px] xl:scroll-mt-[130px]"
    >
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <div className={`relative z-[1] ${flip ? 'lg:order-2' : ''}`}>
          {scrim && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-3 -inset-y-10 -z-10 bg-[radial-gradient(ellipse_75%_62%_at_45%_50%,rgba(7,17,31,0.8),rgba(7,17,31,0.55)_55%,transparent_100%)] sm:-inset-x-5 lg:-inset-x-6"
            />
          )}
          <div data-reveal className="flex items-center gap-4">
            <span className="icon-tile h-12 w-12">
              <Icon name={industry.icon} className="h-6 w-6" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              <span className="text-cyan">{num}</span>
              <span aria-hidden="true" className="mx-2 text-muted/60">
                /
              </span>
              <span className="sr-only"> of </span>
              {pad2(total)}
            </p>
          </div>
          <h2 id={titleId} data-reveal className="h-section mt-6 md:mt-7">
            {industry.title}
          </h2>
          <div data-reveal className="mt-6 border-l border-electric/40 pl-5 md:mt-7">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C9D3E0]">Industry challenge</h3>
            <p className="mt-3 text-[16px] leading-relaxed text-muted md:text-[17px]">{industry.challenge}</p>
          </div>
          <div data-reveal className="mt-8">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C9D3E0]">Example solution types</h3>
            <ul className="mt-3 grid border-b border-line sm:grid-cols-2 sm:gap-x-8">
              {industry.solutions.map((item) => (
                <li key={item} className="flex items-start gap-3 border-t border-line py-3 text-[15px] leading-snug text-[#D5DDE8]">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-electric" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal className="mt-8">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C9D3E0]">Relevant services</h3>
            <ul className="mt-2 flex flex-wrap gap-x-6">
              {industry.services.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    className="group inline-flex min-h-[44px] items-center gap-1.5 text-[14.5px] font-medium text-electric transition-colors duration-300 hover:text-cyan"
                  >
                    {s.label}
                    <Icon name="arrowRight" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={flip ? 'lg:order-1' : ''}>
          <div data-reveal className="group/panel relative overflow-hidden rounded-card border border-line bg-ink-900/95 transition-colors duration-500 hover:border-electric/30">
            <div aria-hidden="true" className="grid-bg absolute inset-0 opacity-70" />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,rgba(30,167,255,0.09),transparent_70%)] opacity-70 transition-opacity duration-500 group-hover/panel:opacity-100"
            />
            {/* Phones: edge to edge and cropped to a short strip, so the diagram stays legible without a tall panel. */}
            <div className="relative flex max-h-[184px] items-center overflow-hidden opacity-90 transition-opacity duration-500 group-hover/panel:opacity-100 sm:block sm:max-h-none sm:overflow-visible sm:px-6 sm:py-6 md:py-8">
              <IndustryVisual kind={industry.motif} />
            </div>
            <div className="relative border-t border-line bg-ink-950/40 px-5 py-4 md:px-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Standards that commonly apply</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {industry.frameworks.map((f) => (
                  <li key={f} className="rounded-lg border border-line px-3 py-1.5 text-[13px] font-medium tracking-wide text-[#C9D3E0]">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* What we build and what we secure, as quiet divider lists under the diagram. */}
          <div data-reveal className="mt-8 grid gap-8 sm:grid-cols-2 sm:gap-8">
            <SpecList icon="code" label="What we build" accent="text-electric">
              {industry.build.map((item) => (
                <li key={item} className="flex items-start gap-3 border-t border-line py-2.5 text-[14.5px] leading-snug text-[#D5DDE8]">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-electric" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </SpecList>
            <SpecList icon="shield" label="Security considerations" accent="text-cyan">
              {industry.security.map((item) => (
                <li key={item} className="flex items-start gap-3 border-t border-line py-2.5 text-[14.5px] leading-snug text-[#D5DDE8]">
                  <Icon name="check" className="mt-px h-4 w-4 shrink-0 text-cyan" />
                  {item}
                </li>
              ))}
            </SpecList>
          </div>
        </div>
      </div>
    </PageSection>
  );
}

function SpecList({ icon, label, accent, children }: { icon: IconName; label: string; accent: string; children: ReactNode }) {
  return (
    <div>
      <h3 className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] ${accent}`}>
        <Icon name={icon} className="h-4 w-4" />
        {label}
      </h3>
      <ul className="mt-3 border-b border-line">{children}</ul>
    </div>
  );
}
