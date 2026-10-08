import { BRAND } from '../../data/site';
import { Icon, type IconName } from '../Icons';
import { AnimatedTechnicalBackground } from './AnimatedTechnicalBackground';
import { ConsultationForm } from './ConsultationForm';

const TRUST: { title: string; text: string; icon: IconName }[] = [
  { title: 'Talk to an Engineer', text: 'Start with someone who understands technical requirements.', icon: 'code' },
  { title: 'No Sales Pressure', text: 'Use the first conversation to understand fit, scope, and next steps.', icon: 'check' },
  {
    title: 'Build + Security Expertise',
    text: 'Discuss development and cybersecurity together instead of treating them as separate problems.',
    icon: 'shield',
  },
];

/** Homepage consultation section (anchor #contact): editorial trust column + the full form. */
export function ConsultationSection() {
  return (
    <section id="contact" aria-labelledby="consult-title" className="section-pad relative isolate bg-ink-950">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_68%_50%,#0B1A30_0%,#07111F_55%,#050B14_100%)]" />
      <AnimatedTechnicalBackground />
      <div aria-hidden="true" className="glow-divider absolute inset-x-0 top-0 opacity-50" />

      <div className="container-site grid items-start gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] lg:gap-16">
        <div data-bg-anchor="copy" className="lg:sticky lg:top-28">
          <p data-reveal className="eyebrow">
            <span className="h-px w-6 bg-cyan" aria-hidden="true" />
            Start a Conversation
          </p>
          <h2 id="consult-title" data-reveal className="h-section mt-4">
            Have a Project, Security Challenge, or Big Idea?
          </h2>
          <p data-reveal className="lead mt-5 max-w-[480px]">
            Tell us what you’re building or protecting. We’ll help you identify the right development, cloud, AI, or security approach.
          </p>

          <ul data-reveal className="mt-10 grid gap-0 border-t border-line md:grid-cols-3 md:gap-6 md:border-t-0 lg:grid-cols-1 lg:gap-0 lg:border-t">
            {TRUST.map((item) => (
              <li key={item.title} className="flex gap-4 border-b border-line py-5 md:flex-col md:border-b-0 md:py-0 lg:flex-row lg:border-b lg:py-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-ink-800/80 text-cyan">
                  <Icon name={item.icon} className="h-[18px] w-[18px]" />
                </span>
                <span>
                  <span className="block text-[16px] font-semibold tracking-[-0.01em] text-text">{item.title}</span>
                  <span className="mt-1 block text-[14.5px] leading-relaxed text-muted">{item.text}</span>
                </span>
              </li>
            ))}
          </ul>

          <p data-reveal className="mt-7 flex items-center gap-2.5 text-[14px] text-[#C9D3E0]">
            <Icon name="clock" className="h-4 w-4 text-cyan" />
            Typical response time: within one business day
          </p>
          <p data-reveal className="mt-3 text-[14px] text-muted">
            Prefer WhatsApp?{' '}
            <a href={BRAND.whatsappUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-electric underline-offset-4 hover:underline">
              Message us
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </div>

        <div
          data-reveal
          data-bg-anchor="form"
          className="relative rounded-[28px] border border-[rgba(100,180,255,0.18)] bg-[rgba(11,22,38,0.84)] p-5 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md sm:p-9 lg:p-11"
        >
          <div aria-hidden="true" className="glow-divider absolute inset-x-10 top-0 opacity-60" />
          <div className="mb-6 flex flex-col gap-2 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.16em] text-text">Consultation request</h3>
            <p className="flex items-center gap-2 text-[13px] text-muted">
              <Icon name="clock" className="h-3.5 w-3.5 text-cyan" />
              30-minute consultation · No obligation
            </p>
          </div>
          <ConsultationForm variant="section" />
        </div>
      </div>
    </section>
  );
}
