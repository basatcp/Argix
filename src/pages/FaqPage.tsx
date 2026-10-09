import { useEffect, useState } from 'react';
import { FAQ_GROUPS } from '../data/faq';
import { useRouter } from '../router';
import { SectionBackground } from '../components/backgrounds/SectionBackground';
import { FinalCTA } from '../components/page/FinalCTA';
import { PageHero } from '../components/page/PageHero';
import { FaqCategoryNav } from '../components/faq/FaqCategoryNav';
import { FaqGroupSection } from '../components/faq/FaqGroupSection';
import { FaqTopicIndex } from '../components/faq/FaqTopicIndex';
import { findQuestion } from '../components/faq/meta';

export function FaqPage() {
  const { location } = useRouter();

  // /faq#retesting opens that question (and only that one). Group anchors leave the accordions as they are.
  const [landing] = useState(() => findQuestion(FAQ_GROUPS, location.hash));
  const [deep, setDeep] = useState(landing);
  useEffect(() => {
    const q = findQuestion(FAQ_GROUPS, location.hash);
    if (q) setDeep(q);
  }, [location.hash]);

  return (
    <>
      <PageHero
        id="faq-title"
        crumb="FAQ"
        eyebrow="FAQ"
        title={
          <>
            Questions Before<br className="hidden lg:inline" /> We Start
          </>
        }
        lead="Answers to common questions about development, cybersecurity, compliance, project delivery, and ongoing support."
        variant="page-calm"
        primary={{ label: 'Book a Free Consultation', source: 'faq-hero' }}
        aside={<FaqTopicIndex groups={FAQ_GROUPS} />}
      />

      {/* Custom markup instead of PageSection: each category is its own <section> with its own h2. */}
      <div className="section-pad relative isolate bg-ink-900">
        <SectionBackground variant="minimal" blend="both" />
        <div aria-hidden="true" className="section-seam glow-divider absolute inset-x-0 top-0 opacity-50" />
        <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,250px)_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[minmax(0,280px)_minmax(0,1fr)] xl:gap-24">
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <FaqCategoryNav groups={FAQ_GROUPS} />
            </div>
          </div>
          <div className="space-y-20 md:space-y-24">
            {FAQ_GROUPS.map((g, i) => {
              const target = deep?.group === g.id ? deep : null;
              return (
                <FaqGroupSection
                  key={g.id}
                  group={g}
                  index={i}
                  initialOpen={target ? target.index : deep ? null : i === 0 ? 0 : null}
                  accordionKey={target ? target.id : 'default'}
                  revealList={landing?.group !== g.id}
                />
              );
            })}
          </div>
        </div>
      </div>

      <FinalCTA
        id="faq-cta-title"
        heading="Still Have Questions?"
        text="Talk to an engineer about your project, security needs, or compliance goals."
        cta="Book a Free Consultation"
        source="faq-final-cta"
        secondary={{ label: 'See Our Process', href: '/process' }}
      />
    </>
  );
}
