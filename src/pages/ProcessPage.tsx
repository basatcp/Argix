import { PROCESS_STAGES } from '../data/process';
import { Icon } from '../components/Icons';
import { SectionHeading } from '../components/ui';
import { FinalCTA } from '../components/page/FinalCTA';
import { PageHero } from '../components/page/PageHero';
import { PageSection } from '../components/page/PageSection';
import { ProcessHeroDiagram } from '../components/process/ProcessHeroDiagram';
import { ProcessTimeline } from '../components/process/ProcessTimeline';

export function ProcessPage() {
  return (
    <>
      <PageHero
        id="process-title"
        crumb="Process"
        eyebrow="Our Process"
        title="Security at Every Stage of Development"
        lead="From discovery through launch and monitoring, security is integrated into the way we design, build, test, and operate technology."
        variant="page-process"
        primary={{ label: 'Book a Free Consultation', source: 'process-hero' }}
        secondary={{ label: 'See the Stages', href: '#stages' }}
        visual={<ProcessHeroDiagram />}
      />

      <PageSection id="stages" labelledBy="stages-title" tone="raised" background="timeline">
        <ProcessTimeline
          stages={PROCESS_STAGES}
          intro={
            <SectionHeading
              id="stages-title"
              align="left"
              eyebrow="The stages"
              title="Six Stages, Two Tracks"
              lead="Every stage pairs the delivery work with the security work that belongs to it, so security is never left for a final checkpoint."
            />
          }
          after={
            <div
              data-reveal
              className="flex flex-col gap-3 rounded-xl border border-line bg-ink-900/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <p className="text-balance text-[14.5px] leading-relaxed text-[#C9D3E0]">
                Already in production? Security work can start with the system you run today.
              </p>
              <a
                href="/security"
                className="group inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded text-sm font-medium text-electric transition-colors hover:text-cyan"
              >
                Explore security services
                <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          }
        />
      </PageSection>

      <FinalCTA
        id="process-cta-title"
        heading="Ready to Plan Your Project?"
        text="Every project starts with discovery. Tell us about your goals and constraints, and we will outline how each stage applies to your project."
        source="process-final-cta"
      />
    </>
  );
}
