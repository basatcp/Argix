import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BuildRunSecure, FrameworkStrip, ServiceCards } from './components/sections/Offer';
import { Industries, Stats } from './components/sections/Trust';
import { Process } from './components/sections/Process';
import { Certifications, SecureDevelopment, SecurityDepartment } from './components/sections/Security';
import { Faq, Footer } from './components/sections/Closing';
import { ConsultationProvider } from './components/consultation/ConsultationModal';
import { ConsultationSection } from './components/consultation/ConsultationSection';
import { useEffect } from 'react';
import { useScrollReveal } from './hooks/useScrollReveal';

export default function App() {
  useScrollReveal();

  useEffect(() => {
    // The page renders after the browser has tried to honour a #fragment in the URL
    // (e.g. a shared link to /#contact), so jump to it once the content exists.
    const initial = decodeURIComponent(window.location.hash.slice(1));
    if (initial) document.getElementById(initial)?.scrollIntoView();

    // Smooth in-page navigation (instant for reduced motion). Done here rather than
    // with CSS scroll-behavior, which interferes with ScrollTrigger's measurements.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const id = link?.getAttribute('href')?.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      window.history.pushState(null, '', `#${id}`);
      // Keep keyboard users in step with what they jumped to (e.g. the skip link).
      if (target.tabIndex >= 0 || target.hasAttribute('tabindex')) target.focus({ preventScroll: true });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return (
    <ConsultationProvider>
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
        <ConsultationSection />
      </main>
      <Footer />
    </ConsultationProvider>
  );
}
