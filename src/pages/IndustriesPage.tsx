import { INDUSTRY_DETAILS } from '../data/industries';
import type { Variant } from '../components/backgrounds/variants';
import { FinalCTA } from '../components/page/FinalCTA';
import { PageHero } from '../components/page/PageHero';
import { IndustriesHeroDiagram } from '../components/industries/IndustriesHeroDiagram';
import { IndustrySection } from '../components/industries/IndustrySection';
import { SubNav } from '../components/page/SubNav';

/**
 * Bands alternate raised / base so the block before the closing CTA is raised.
 * Raised bands carry a background that matches the sector (monitoring,
 * connected systems, security) with a soft scrim behind their text column;
 * base bands keep the quiet industries field so the diagrams lead.
 */
const BANDS: { tone: 'base' | 'raised'; background: Variant }[] = [
  { tone: 'raised', background: 'monitor' },
  { tone: 'base', background: 'industries' },
  { tone: 'raised', background: 'network' },
  { tone: 'base', background: 'industries' },
  { tone: 'raised', background: 'secure' },
];

export function IndustriesPage() {
  return (
    <>
      <PageHero
        id="industries-title"
        crumb="Industries"
        eyebrow="Industries"
        title={
          <>
            Technology Built for <span className="sm:whitespace-nowrap">High-Stakes</span> Industries
          </>
        }
        lead="We help teams build secure, scalable digital products in industries where reliability, data protection, and compliance matter."
        variant="page-network"
        primary={{ label: 'Talk to Our Team', source: 'industries-hero' }}
        secondary={{ label: 'Explore Industries', href: '#healthcare' }}
        visual={<IndustriesHeroDiagram />}
      />

      <div className="relative">
        <SubNav label="Industries on this page" items={INDUSTRY_DETAILS.map((i) => ({ id: i.id, label: i.title, short: i.short }))} />
        {INDUSTRY_DETAILS.map((industry, i) => (
          <IndustrySection
            key={industry.id}
            industry={industry}
            index={i}
            total={INDUSTRY_DETAILS.length}
            tone={BANDS[i % BANDS.length].tone}
            background={BANDS[i % BANDS.length].background}
            scrim={BANDS[i % BANDS.length].tone === 'raised'}
            flip={i % 2 === 1}
          />
        ))}
      </div>

      <FinalCTA
        id="industries-cta-title"
        heading={
          <>
            Building in a <span className="sm:whitespace-nowrap">Security-Sensitive</span> Industry?
          </>
        }
        text="Tell us what you are building and the rules you work under. We will plan the architecture, security controls and compliance groundwork with you."
        cta="Talk to Our Team"
        source="industries-final-cta"
      />
    </>
  );
}
