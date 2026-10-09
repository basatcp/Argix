import { COMPLIANCE_NOTE, INTEGRATED_INTRO, SECURE_COMPLY, SECURE_COMPLY_INTRO, SERVICES_CTA } from '../data/services';
import { Icon } from '../components/Icons';
import { SectionHeading } from '../components/ui';
import { FinalCTA } from '../components/page/FinalCTA';
import { PageHero } from '../components/page/PageHero';
import { PageSection } from '../components/page/PageSection';
import { ActiveGlow } from '../components/services/ActiveGlow';
import { BuildRunServices } from '../components/services/BuildRunServices';
import { GroupConnector } from '../components/services/GroupConnector';
import { IntegratedFlow } from '../components/services/IntegratedFlow';
import { SECURE_CARD_ROWS, SecurityServiceCard } from '../components/services/SecurityServiceCard';
import { ServicesHeroDiagram } from '../components/services/ServicesHeroDiagram';

export function ServicesPage() {
  return (
    <>
      <PageHero
        id="services-title"
        crumb="Services"
        eyebrow="Services"
        title="Build, Run, and Secure Your Technology"
        lead="From custom software and AI to cloud infrastructure, penetration testing, compliance, and monitoring, our teams help you build and protect technology across its full lifecycle."
        variant="page-build"
        primary={{ label: 'Book a Free Consultation', source: 'services-hero' }}
        secondary={{ label: 'Explore Services', href: '#build-run' }}
        visual={<ServicesHeroDiagram />}
      />

      <PageSection id="build-run" labelledBy="build-run-title" tone="raised" background="build">
        <ActiveGlow at="22% 12%" />
        <BuildRunServices />
      </PageSection>

      <GroupConnector />

      <PageSection id="secure-comply" labelledBy="secure-comply-title" background="secure">
        <ActiveGlow at="50% 14%" />
        <div data-bg-anchor="copy" className="relative mx-auto max-w-[760px]">
          <SectionHeading id="secure-comply-title" eyebrow={SECURE_COMPLY_INTRO.eyebrow} title={SECURE_COMPLY_INTRO.title} lead={SECURE_COMPLY_INTRO.lead} />
        </div>
        <ul className="mt-12 grid gap-4 md:mt-14 md:grid-cols-2 md:gap-5 lg:mt-16 lg:grid-cols-3">
          {SECURE_COMPLY.map((s) => (
            <li key={s.slug} data-reveal className={SECURE_CARD_ROWS}>
              <SecurityServiceCard service={s} />
            </li>
          ))}
        </ul>
        <p data-reveal className="mx-auto mt-10 max-w-[640px] text-center text-[13.5px] leading-relaxed text-muted [text-wrap:balance]">
          <Icon name="lock" className="mr-2 inline h-4 w-4 -translate-y-px" />
          {COMPLIANCE_NOTE}
        </p>
      </PageSection>

      <PageSection id="integrated-approach" labelledBy="integrated-approach-title" tone="raised" background="blueprint">
        <ActiveGlow at="50% 55%" />
        <SectionHeading id="integrated-approach-title" eyebrow={INTEGRATED_INTRO.eyebrow} title={INTEGRATED_INTRO.title} lead={INTEGRATED_INTRO.lead} />
        <div data-reveal className="mt-12 md:mt-14 lg:mt-16">
          <IntegratedFlow />
        </div>
        <div className="mt-12 flex justify-center lg:mt-14">
          <a data-reveal href="/process" className="group inline-flex min-h-[44px] items-center gap-1.5 rounded text-sm font-medium text-electric transition-colors hover:text-cyan">
            See the full delivery process
            <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </PageSection>

      <FinalCTA
        id="services-cta-title"
        heading={SERVICES_CTA.heading}
        text={SERVICES_CTA.text}
        cta="Book a Free Consultation"
        source="services-final-cta"
        secondary={{ label: 'Read Common Questions', href: '/faq' }}
      />
    </>
  );
}
