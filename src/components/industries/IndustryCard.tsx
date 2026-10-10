import type { IconName } from '../Icons';
import { Icon } from '../Icons';
import { CardMotif, type MotifKind } from '../backgrounds/CardMotif';

export interface IndustryCardData {
  /** Section id on the Industries page. */
  id: string;
  title: string;
  text: string;
  icon: IconName;
  motif: MotifKind;
}

/**
 * Industry summary card (homepage): icon, title, one line and the industry's
 * line motif, linking to its section on the Industries page. Hover lifts the
 * card, brightens the motif and shifts the arrow.
 */
export function IndustryCard({ industry }: { industry: IndustryCardData }) {
  return (
    <a
      href={`/industries#${industry.id}`}
      className="card group relative isolate flex h-full min-h-[240px] flex-col overflow-hidden p-7 transition duration-300 hover:-translate-y-1.5 hover:border-primary/70 hover:shadow-[0_24px_60px_-30px_rgba(59,130,246,0.6)] md:p-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(30,167,255,0.16),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <CardMotif kind={industry.motif} />
      <span className="icon-tile h-12 w-12">
        <Icon name={industry.icon} className="h-6 w-6 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[3px]" />
      </span>
      <h3 className="mt-auto flex items-center gap-2 pt-10 text-[22px] font-semibold tracking-[-0.015em] text-text">
        {industry.title}
        <Icon name="arrowRight" className="h-4 w-4 text-electric transition-transform duration-300 group-hover:translate-x-1" />
      </h3>
      <p className="mt-2.5 max-w-[440px] text-[15px] leading-relaxed text-muted">{industry.text}</p>
    </a>
  );
}
