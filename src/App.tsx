import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BuildRunSecure, FrameworkStrip, ServiceCards } from './components/sections/Offer';
import { Industries, Stats } from './components/sections/Trust';
import { Process } from './components/sections/Process';
import { Certifications, SecureDevelopment, SecurityDepartment } from './components/sections/Security';
import { Faq, FinalCta, Footer } from './components/sections/Closing';
import { useScrollReveal } from './hooks/useScrollReveal';

export default function App() {
  useScrollReveal();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
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
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
