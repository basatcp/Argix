import { Hero } from '../components/Hero';
import { BuildRunSecure, FrameworkStrip, ServiceCards } from '../components/sections/Offer';
import { Industries, Stats } from '../components/sections/Trust';
import { Process } from '../components/sections/Process';
import { Certifications, SecureDevelopment, SecurityDepartment } from '../components/sections/Security';
import { Faq } from '../components/sections/Closing';
import { TestimonialSection } from '../components/testimonials/TestimonialSection';
import { ConsultationSection } from '../components/consultation/ConsultationSection';

export function HomePage() {
  return (
    <>
      <Hero />
      <FrameworkStrip />
      <BuildRunSecure />
      <ServiceCards />
      <Stats />
      <Industries />
      <Process />
      <SecurityDepartment />
      <SecureDevelopment />
      <Certifications />
      <Faq />
      <TestimonialSection />
      <ConsultationSection />
    </>
  );
}
