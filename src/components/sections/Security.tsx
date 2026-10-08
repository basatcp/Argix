import { CERTIFICATIONS, REPORT_ITEMS, SECURE_CODING, SECURITY_DEPT } from '../../data/site';
import { Icon } from '../Icons';
import { SectionHeading } from '../ui';
import { SectionBackground } from '../backgrounds/SectionBackground';

/* SECTION 8: Security department */
export function SecurityDepartment() {
  return (
    <section id="security" aria-labelledby="security-title" className="section-pad relative isolate bg-ink-900">
      <SectionBackground variant="monitor" blend="both" />
      <div aria-hidden="true" className="glow-divider absolute inset-x-0 top-0 opacity-50" />
      <div className="container-site">
        <SectionHeading
          id="security-title"
          eyebrow="Outsourced security"
          title="A Security Department Without Building One"
          lead="Get the leadership, processes and security support you need without hiring an entire internal department."
        />
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SECURITY_DEPT.map((c) => (
            <li key={c.title} data-reveal>
              <article className="card group h-full p-7 transition duration-300 hover:-translate-y-1 hover:border-electric/45">
                <span className="icon-tile">
                  <Icon name={c.icon} className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                </span>
                <h3 className="mt-6 text-[18px] font-semibold tracking-[-0.01em] text-text">{c.title}</h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">{c.text}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* SECTION 9: Secure development split */
function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 rounded-xl border border-line bg-ink-900/60 px-4 py-3.5 text-[15px] text-[#D5DDE8]">
          <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function SecureDevelopment() {
  return (
    <section aria-labelledby="secure-dev-title" className="section-pad relative isolate overflow-hidden">
      <SectionBackground variant="split" />
      <h2 id="secure-dev-title" className="sr-only">
        Secure development and audit-ready reporting
      </h2>
      <div className="container-site relative grid gap-5 lg:grid-cols-2">
        <article data-reveal data-bg-anchor="build-card" className="card p-7 md:p-10" aria-labelledby="secure-coding-title">
          <span className="icon-tile">
            <Icon name="git" className="h-5 w-5" />
          </span>
          <h3 id="secure-coding-title" className="mt-6 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-text md:text-[34px]">
            Secure Coding While We Build
          </h3>
          <CheckList items={SECURE_CODING} />
        </article>
        <article data-reveal data-bg-anchor="secure-card" className="card p-7 md:p-10" aria-labelledby="reports-title">
          <span className="icon-tile">
            <Icon name="fileText" className="h-5 w-5" />
          </span>
          <h3 id="reports-title" className="mt-6 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-text md:text-[34px]">
            Reports Your Auditor Can Use
          </h3>
          <CheckList items={REPORT_ITEMS} />
          <p className="mt-7 flex gap-2.5 border-t border-line pt-5 text-[13px] leading-relaxed text-muted">
            <Icon name="lock" className="mt-0.5 h-4 w-4 shrink-0" />
            A penetration test supports compliance work but does not by itself make a company certified or compliant.
          </p>
        </article>
      </div>
    </section>
  );
}

/* SECTION 10: Certifications */
export function Certifications() {
  return (
    <section id="certifications" aria-labelledby="certs-title" className="section-pad relative isolate bg-ink-900">
      <SectionBackground variant="blueprint" blend="both" />
      <div aria-hidden="true" className="glow-divider absolute inset-x-0 top-0 opacity-50" />
      <div className="container-site">
        <SectionHeading id="certs-title" eyebrow="Credentials" title="Certified People Behind the Work" />
        <ul className="mx-auto mt-14 grid max-w-[1000px] grid-cols-2 gap-3 sm:grid-cols-3">
          {CERTIFICATIONS.map((c) => (
            <li
              key={c.code}
              data-reveal
              className="group flex items-center gap-4 rounded-2xl border border-line bg-card/60 p-4 transition-[border-color,transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-electric/40 hover:shadow-[0_12px_32px_-18px_rgba(59,130,246,0.55)] md:p-5"
            >
              <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0" aria-hidden="true">
                <path
                  d="M20 3 34.7 11.5v17L20 37 5.3 28.5v-17Z"
                  fill="rgba(30,167,255,0.06)"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  className="text-electric/60 transition-colors duration-300 group-hover:text-cyan"
                />
                <path d="m14.5 20.5 3.8 3.8 7.4-8" fill="none" stroke="#39D7FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="min-w-0">
                <span className="block text-[16px] font-semibold tracking-[-0.005em] text-text md:text-[17px]">{c.code}</span>
                <span className="block truncate text-[13px] text-muted">{c.area}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center text-sm text-muted">Certifications belong to individual team members unless otherwise stated.</p>
      </div>
    </section>
  );
}
