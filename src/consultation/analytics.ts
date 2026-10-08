/**
 * Analytics hooks for the consultation flow. Nothing needs to be configured for
 * the form to work: each event goes to whatever is present (Google Tag Manager's
 * dataLayer, gtag, Plausible) and is always dispatched as a DOM event, so any
 * other tool can listen with:
 *
 *   window.addEventListener('consultation:analytics', (e) => console.log(e.detail))
 */

export type ConsultationEvent =
  | 'consultation_modal_open'
  | 'consultation_modal_close'
  | 'consultation_form_start'
  | 'consultation_form_submit'
  | 'consultation_form_success'
  | 'consultation_form_error';

export interface ConsultationEventProps {
  /** Where the form lives: the popup or the homepage section. */
  location?: 'modal' | 'section';
  /** What opened the modal (nav, hero, mobile-nav) or why it closed. */
  source?: string;
  service?: string;
  reason?: string;
}

type AnalyticsWindow = Window & {
  dataLayer?: Record<string, unknown>[];
  gtag?: (...args: unknown[]) => void;
  plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
};

export function track(event: ConsultationEvent, props: ConsultationEventProps = {}) {
  if (typeof window === 'undefined') return;
  const w = window as AnalyticsWindow;
  const detail = Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined && v !== ''));
  try {
    w.dataLayer?.push({ event, ...detail });
    w.gtag?.('event', event, detail);
    w.plausible?.(event, { props: detail });
    window.dispatchEvent(new CustomEvent('consultation:analytics', { detail: { event, ...detail } }));
  } catch {
    // Analytics must never break the form.
  }
}
