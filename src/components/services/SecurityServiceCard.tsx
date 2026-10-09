import type { SecureService } from '../../data/services';
import { hexagon } from '../backgrounds/geometry';
import { Icon } from '../Icons';
import { ConsultButton } from '../page/ConsultButton';

/** Quiet hexagonal geometry in the card's corner; a little more present on hover. */
function HexCorner() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 128 128"
      fill="none"
      className="pointer-events-none absolute right-0 top-0 -z-10 h-32 w-32 overflow-hidden opacity-60 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 group-focus-within:opacity-100"
    >
      <path d={hexagon(100, 28, 68)} stroke="rgba(59,130,246,0.14)" strokeWidth={1} />
      <path d={hexagon(100, 28, 48)} stroke="rgba(59,130,246,0.12)" strokeWidth={1} strokeDasharray="2 5" />
      <path d={hexagon(100, 28, 29)} stroke="rgba(56,189,248,0.2)" strokeWidth={1} />
    </svg>
  );
}

/** Rows each card spans in the grid (md+): header, title, explanation, included, who it's for, links. */
export const SECURE_CARD_ROWS = 'md:row-span-6 md:grid md:grid-rows-subgrid md:gap-y-0';

/**
 * One Secure & Comply service: what it is, what is included, who it is for,
 * a consultation link and, where the Security page covers it in depth, a link there.
 * From md up the card is a subgrid of its list item (SECURE_CARD_ROWS on both),
 * so titles, lists and the "Who it's for" tiles line up across each row of cards.
 */
export function SecurityServiceCard({ service }: { service: SecureService }) {
  const titleId = `${service.slug}-title`;
  return (
    <article
      id={service.slug}
      aria-labelledby={titleId}
      className={`card group relative isolate flex h-full scroll-mt-28 flex-col overflow-hidden p-6 transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-electric/45 hover:shadow-[0_24px_60px_-34px_rgba(59,130,246,0.55)] sm:p-7 md:p-8 ${SECURE_CARD_ROWS}`}
    >
      <HexCorner />
      <div className="flex items-center gap-4">
        <span className="icon-tile transition-colors duration-300 group-hover:border-electric/50">
          <Icon name={service.icon} className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{service.role}</span>
      </div>
      <h3 id={titleId} className="mt-6 text-[20px] font-semibold leading-snug tracking-[-0.01em] text-text md:text-[21px]">
        {service.title}
      </h3>
      <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted md:text-[15px]">{service.explanation}</p>

      <div className="mt-6">
        <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C9D3E0]">What’s included</h4>
        <ul className="mt-3.5 space-y-2.5">
          {service.included.map((item) => (
            <li key={item} className="flex gap-3 text-[14.5px] leading-snug text-[#D5DDE8]">
              <Icon name="check" className="mt-px h-4 w-4 shrink-0 text-cyan" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* stretches to the tallest tile in the row (md+) */}
      <dl className="mt-7 rounded-xl border border-line bg-ink-900/60 p-4">
        <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan">
          <Icon name="users" className="h-4 w-4" />
          Who it’s for
        </dt>
        <dd className="mt-2 text-[14px] leading-relaxed text-[#C9D3E0]">{service.forWho}</dd>
      </dl>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6">
        <ConsultButton source={`services-${service.slug}`} label="Discuss this service" context={`(${service.title})`} variant="link" className="min-h-[44px]" />
        {service.detailsHref && (
          <a
            href={service.detailsHref}
            className="group/details inline-flex min-h-[44px] items-center gap-1.5 rounded text-sm font-medium text-muted transition-colors duration-300 hover:text-text"
          >
            Details
            <span className="sr-only"> on {service.title}</span>
            <Icon
              name="arrowUpRight"
              className="h-4 w-4 transition-transform duration-300 group-hover/details:-translate-y-0.5 group-hover/details:translate-x-0.5"
            />
          </a>
        )}
      </div>
    </article>
  );
}
