import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import { hasNavigated } from '../router';
import { CyberCoreCanvas } from './CyberCoreCanvas';
import { Icon } from './Icons';
import { useConsultation } from './consultation/ConsultationModal';
import { SectionBackground } from './backgrounds/SectionBackground';

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { openConsultation } = useConsultation();

  useLayoutEffect(() => {
    // Copy entrance on first load only; returning from another page, the page transition brings it in.
    if (prefersReducedMotion() || hasNavigated()) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-hero]', { opacity: 0, y: 22, duration: 0.9, ease: 'power3.out', stagger: 0.09, delay: 0.1 });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[90vh] items-center overflow-hidden pb-16 pt-28 md:pt-32 lg:pb-20"
    >
      {/* Background */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_70%_40%,#0A1E38_0%,#07111F_45%,#050B14_100%)]" />
      <div aria-hidden="true" className="grid-bg absolute inset-0 -z-10 opacity-70" />
      <SectionBackground variant="hero" />
      <div aria-hidden="true" className="glow-divider absolute inset-x-0 bottom-0" />

      <div className="container-site grid items-center gap-10 md:grid-cols-2 md:gap-6 lg:grid-cols-[45%_55%] lg:gap-0">
        <div className="relative z-10 max-w-[600px]">
          <p data-hero className="eyebrow">
            <span className="h-px w-6 bg-cyan" aria-hidden="true" />
            Software · AI · Cybersecurity
          </p>
          <h1
            id="hero-title"
            data-hero
            className="mt-5 text-[42px] font-semibold leading-[1.04] tracking-[-0.035em] text-text sm:text-[48px] md:text-[54px] lg:text-[66px] xl:text-[74px]"
          >
            Build Secure Technology <span className="bg-gradient-to-r from-electric to-cyan bg-clip-text text-transparent">That Scales</span>
          </h1>
          <p data-hero className="lead mt-6 max-w-[540px] md:!text-[18px]">
            We design and develop software, AI and cloud systems with security built in from day one, then protect them with testing,
            compliance and continuous monitoring.
          </p>
          <div data-hero className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button type="button" aria-haspopup="dialog" onClick={(e) => openConsultation('hero', e.currentTarget)} className="btn-primary">
              Book a Free Consultation
              <Icon name="arrowRight" className="h-4 w-4" />
            </button>
            <a href="#services" className="btn-secondary">
              Explore Services
            </a>
          </div>
          <p data-hero className="mt-5 flex items-center gap-2 text-sm text-muted">
            <Icon name="check" className="h-4 w-4 text-cyan" />
            30-minute consultation · No obligation
          </p>
        </div>

        <div data-bg-anchor="core" className="relative mx-auto w-full max-w-[560px] md:max-w-none lg:-mr-6">
          <CyberCoreCanvas />
        </div>
      </div>
    </section>
  );
}
