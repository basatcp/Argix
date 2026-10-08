import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { track } from '../../consultation/analytics';
import { Icon } from '../Icons';
import { ConsultationForm } from './ConsultationForm';

interface ConsultationContextValue {
  /** Open the consultation popup. `source` is reported to analytics; focus returns to `trigger` on close. */
  openConsultation: (source: string, trigger?: HTMLElement | null) => void;
}

const ConsultationContext = createContext<ConsultationContextValue>({ openConsultation: () => {} });

export const useConsultation = () => useContext(ConsultationContext);

type Phase = 'closed' | 'opening' | 'open' | 'closing';
const EXIT_MS = 240;

/** Provides `openConsultation` to the page and renders the single modal instance. */
export function ConsultationProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('closed');
  const phaseRef = useRef<Phase>('closed');
  phaseRef.current = phase;
  const trigger = useRef<HTMLElement | null>(null);

  const openConsultation = useCallback((source: string, el?: HTMLElement | null) => {
    if (phaseRef.current === 'open' || phaseRef.current === 'opening') return;
    trigger.current = el ?? (document.activeElement as HTMLElement | null);
    phaseRef.current = 'opening';
    setPhase('opening');
    track('consultation_modal_open', { source });
  }, []);

  const close = useCallback((reason: string) => {
    if (phaseRef.current !== 'open' && phaseRef.current !== 'opening') return;
    phaseRef.current = 'closing';
    setPhase('closing');
    track('consultation_modal_close', { reason });
  }, []);

  useEffect(() => {
    if (phase === 'closing') {
      const t = window.setTimeout(() => {
        phaseRef.current = 'closed';
        setPhase('closed');
      }, EXIT_MS);
      return () => window.clearTimeout(t);
    }
    if (phase === 'closed' && trigger.current) {
      // Runs after the dialog has unmounted and the page is no longer inert.
      // Back to the button that opened the dialog (or the header CTA if it is gone).
      const el = trigger.current;
      trigger.current = null;
      const target = document.body.contains(el) && el.offsetParent !== null ? el : document.querySelector<HTMLElement>('[data-consultation-trigger]');
      target?.focus({ preventScroll: true });
    }
  }, [phase]);

  const onOpened = useCallback(() => {
    if (phaseRef.current !== 'opening') return;
    phaseRef.current = 'open';
    setPhase('open');
  }, []);

  const value = useMemo(() => ({ openConsultation }), [openConsultation]);

  return (
    <ConsultationContext.Provider value={value}>
      {children}
      {phase !== 'closed' && <ConsultationModal phase={phase} onOpened={onOpened} onClose={close} />}
    </ConsultationContext.Provider>
  );
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function ConsultationModal({ phase, onOpened, onClose }: { phase: Phase; onOpened: () => void; onClose: (reason: string) => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pressedOnOverlay = useRef(false);
  const [success, setSuccess] = useState(false);

  // Enter: lock page scroll, make the page inert, move focus into the dialog.
  useEffect(() => {
    const root = document.getElementById('root');
    const html = document.documentElement;
    html.classList.add('cm-lock');
    root?.setAttribute('inert', '');
    root?.setAttribute('aria-hidden', 'true');

    const panel = panelRef.current;
    const touch = window.matchMedia('(pointer: coarse)').matches;
    // On touch screens, focusing a field would pop the keyboard over the dialog; focus the dialog itself.
    const first = touch ? null : panel?.querySelector<HTMLElement>('input, select, textarea');
    (first ?? panel)?.focus({ preventScroll: true });

    return () => {
      html.classList.remove('cm-lock');
      root?.removeAttribute('inert');
      root?.removeAttribute('aria-hidden');
    };
    // Runs once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After the first paint in the 'opening' state, switch to 'open' so the CSS transition runs
  // (also when it is reopened while still animating out).
  useEffect(() => {
    if (phase !== 'opening') return;
    let inner = 0;
    const outer = requestAnimationFrame(() => (inner = requestAnimationFrame(onOpened)));
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [phase, onOpened]);

  // Escape closes; Tab stays inside the dialog. Listened for on the document so it
  // works wherever focus happens to be (e.g. after a click on the backdrop).
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeRef.current('escape');
        return;
      }
      if (e.key !== 'Tab') return;
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!active || !panel.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, []);

  return createPortal(
    <div
      className="cm-overlay fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6"
      data-state={phase}
      onMouseDown={(e) => (pressedOnOverlay.current = e.target === e.currentTarget)}
      onClick={(e) => {
        // Only a click that starts and ends on the backdrop closes (not a text selection dragged out of a field).
        if (pressedOnOverlay.current && e.target === e.currentTarget) onClose('overlay');
        pressedOnOverlay.current = false;
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consultation-modal-title"
        aria-describedby={success ? undefined : 'consultation-modal-desc'}
        tabIndex={-1}
        className="cm-panel relative w-full max-w-[800px] overflow-y-auto overscroll-contain rounded-[26px] border border-[rgba(100,180,255,0.18)] outline-none"
      >
        <div aria-hidden="true" className="glow-divider absolute inset-x-10 top-0 opacity-70" />
        <button
          type="button"
          aria-label="Close consultation form"
          onClick={() => onClose('button')}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-muted transition-colors hover:border-line hover:text-text sm:right-5 sm:top-5"
        >
          <Icon name="close" className="h-5 w-5" />
        </button>

        <div className="px-5 pb-7 pt-8 sm:px-9 sm:pb-9 sm:pt-10 md:px-11">
          <header className={success ? 'sr-only' : 'mb-7 pr-10 md:mb-8'}>
            <p className="eyebrow">
              <span className="h-px w-6 bg-cyan" aria-hidden="true" />
              Free Consultation
            </p>
            <h2 id="consultation-modal-title" className="mt-4 text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-text sm:text-[32px]">
              Tell Us What You’re Building or Protecting
            </h2>
            <p id="consultation-modal-desc" className="mt-3 max-w-[620px] text-[15px] leading-relaxed text-muted sm:text-[15.5px]">
              Share a few details about your project and our team will review your requirements and discuss the right development, AI,
              cloud, or security approach.
            </p>
            <p className="mt-4 flex items-center gap-2 text-[13.5px] text-[#C9D3E0]">
              <Icon name="clock" className="h-4 w-4 text-cyan" />
              30-minute consultation · No obligation
            </p>
          </header>
          <ConsultationForm variant="modal" onClose={() => onClose('success-close')} onSuccessChange={setSuccess} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
