import { SECURITY_CTA, SECURITY_HERO, SECURITY_SECTIONS } from '../data/security';
import { FinalCTA } from '../components/page/FinalCTA';
import { PageHero } from '../components/page/PageHero';
import { GrcCompliance } from '../components/security/GrcCompliance';
import { IncidentResponse } from '../components/security/IncidentResponse';
import { PenetrationTesting } from '../components/security/PenetrationTesting';
import { SecureDevelopment } from '../components/security/SecureDevelopment';
import { SecurityHeroDiagram } from '../components/security/SecurityHeroDiagram';
import { SecuritySubNav } from '../components/security/SecuritySubNav';
import { SocMonitoring } from '../components/security/SocMonitoring';
import { VirtualCiso } from '../components/security/VirtualCiso';

/**
 * /security: six security services, each in its own section and layout, with
 * a sticky in-page navigation (desktop) between the hero and the closing CTA.
 *
 *   penetration-testing (base, secure)      grc-compliance (raised, blueprint)
 *   vciso (base, minimal)                   soc-monitoring (raised, monitor)
 *   incident-response (base, timeline)      secure-development (raised, split)
 */
export function SecurityPage() {
  return (
    <>
      <PageHero
        id="security-title"
        crumb="Security"
        eyebrow={SECURITY_HERO.eyebrow}
        title={SECURITY_HERO.title}
        lead={SECURITY_HERO.lead}
        variant="page-secure"
        primary={{ label: SECURITY_HERO.cta, source: 'security-hero' }}
        secondary={{ label: 'Explore Security Services', href: '#penetration-testing' }}
        visual={<SecurityHeroDiagram />}
      />

      {/* The sub-navigation sticks only while these sections are on screen. */}
      <div className="relative">
        <SecuritySubNav items={SECURITY_SECTIONS} />
        <PenetrationTesting />
        <GrcCompliance />
        <VirtualCiso />
        <SocMonitoring />
        <IncidentResponse />
        <SecureDevelopment />
      </div>

      <FinalCTA
        id="security-cta-title"
        eyebrow="Next step"
        heading={SECURITY_CTA.heading}
        text={SECURITY_CTA.text}
        cta={SECURITY_CTA.cta}
        source="security-final-cta"
        secondary={{ label: 'Security & Compliance FAQ', href: '/faq#cybersecurity' }}
      />
    </>
  );
}
