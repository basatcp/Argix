import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import { CONTACT_METHODS, PROJECT_STAGES, REQUIREMENTS_MIN, SERVICES, type FieldName } from '../../consultation/schema';
import { useConsultationForm, type FormLocation } from '../../consultation/useConsultationForm';
import { Icon } from '../Icons';
import { useRouter } from '../../router';

export interface ConsultationFormProps {
  variant: FormLocation;
  /** Modal only: close the dialog. */
  onClose?: () => void;
  /** Called when the success state is shown (the modal hides its header then). */
  onSuccessChange?: (success: boolean) => void;
}

/**
 * The consultation form. One component for every placement: `variant` only
 * changes density and the success actions; fields, validation and submission
 * are shared through useConsultationForm.
 */
export function ConsultationForm({ variant, onClose, onSuccessChange }: ConsultationFormProps) {
  const uid = useId();
  const fieldId = useCallback((name: FieldName) => `${uid}-${name}`, [uid]);
  const form = useConsultationForm(variant, fieldId);
  const { navigate } = useRouter();
  const { values, errors, status } = form;
  const successRef = useRef<HTMLHeadingElement>(null);
  const large = variant === 'section';

  useEffect(() => {
    onSuccessChange?.(status === 'success');
    if (status === 'success') successRef.current?.focus();
  }, [status, onSuccessChange]);

  if (status === 'success') {
    return (
      <div className={`cf-success flex flex-col items-center text-center ${large ? 'py-10 md:py-16' : 'py-6 md:py-10'}`} role="status">
        <SuccessMark />
        <h3 ref={successRef} tabIndex={-1} className="mt-7 text-[24px] font-semibold tracking-[-0.02em] text-text outline-none md:text-[28px]">
          Thanks. We’ve Received Your Request.
        </h3>
        <p className="mt-3 max-w-[420px] text-[15.5px] leading-relaxed text-muted">
          Our team will review your details and get back to you shortly.
        </p>
        {form.demo && (
          <p className="mt-4 rounded-lg border border-line px-3 py-1.5 text-xs text-muted">Preview mode: this request was not sent anywhere.</p>
        )}
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {variant === 'modal' ? (
            <>
              <button type="button" className="btn-primary" onClick={onClose}>
                Close
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  onClose?.();
                  // After the popup has closed (the page is interactive again), open the Services page.
                  window.setTimeout(() => navigate('/services'), 320);
                }}
              >
                Explore Our Services
                <Icon name="arrowRight" className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <a href="#services" className="btn-primary">
                Explore Our Services
                <Icon name="arrowRight" className="h-4 w-4" />
              </a>
              <button type="button" className="btn-secondary" onClick={form.reset}>
                Send another request
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const submitting = status === 'submitting';
  const describedBy = (name: FieldName, hint?: boolean) =>
    [hint ? `${fieldId(name)}-hint` : '', errors[name] ? `${fieldId(name)}-error` : ''].filter(Boolean).join(' ') || undefined;
  const control = (name: FieldName, required = false, hint = false) => ({
    id: fieldId(name),
    name,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': describedBy(name, hint),
    'aria-required': required || undefined,
    onBlur: () => form.blurField(name),
  });

  return (
    <form noValidate onSubmit={form.submit} className={`cf cf--${variant}`} aria-busy={submitting || undefined}>
      <p className="mb-5 text-[13px] text-muted">
        Fields marked <span aria-hidden="true" className="text-cyan">*</span>
        <span className="sr-only">with an asterisk</span> are required.
      </p>

      <div className={`grid gap-x-4 sm:grid-cols-2 ${large ? 'gap-y-5' : 'gap-y-4'}`}>
        <Field id={fieldId('fullName')} label="Full Name" required error={errors.fullName}>
          <input
            {...control('fullName', true)}
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            className="cf-input"
            value={values.fullName}
            onChange={(e) => form.setField('fullName', e.target.value)}
          />
        </Field>
        <Field id={fieldId('email')} label="Work Email" required error={errors.email}>
          <input
            {...control('email', true)}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="cf-input"
            value={values.email}
            onChange={(e) => form.setField('email', e.target.value)}
          />
        </Field>
        <Field id={fieldId('company')} label="Company Name" error={errors.company}>
          <input
            {...control('company')}
            type="text"
            autoComplete="organization"
            placeholder="Your company"
            className="cf-input"
            value={values.company}
            onChange={(e) => form.setField('company', e.target.value)}
          />
        </Field>
        <Field id={fieldId('phone')} label="Phone / WhatsApp" error={errors.phone}>
          <input
            {...control('phone')}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+1 234 567 890"
            className="cf-input"
            value={values.phone}
            onChange={(e) => form.setField('phone', e.target.value)}
          />
        </Field>
        <Field id={fieldId('service')} label="What Do You Need Help With?" required error={errors.service}>
          <Select
            {...control('service', true)}
            value={values.service}
            placeholder="Select a service"
            options={SERVICES}
            onChange={(v) => form.setField('service', v)}
          />
        </Field>
        <Field id={fieldId('stage')} label="Project Stage" error={errors.stage}>
          <Select
            {...control('stage')}
            value={values.stage}
            placeholder="Select a stage"
            options={PROJECT_STAGES}
            onChange={(v) => form.setField('stage', v)}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field
            id={fieldId('requirements')}
            label="Project / Security Requirements"
            required
            error={errors.requirements}
            hint={`A few sentences is enough (at least ${REQUIREMENTS_MIN} characters).`}
          >
            <textarea
              {...control('requirements', true, true)}
              rows={large ? 5 : 4}
              placeholder="Tell us briefly what you want to build, improve, or secure..."
              className="cf-input cf-textarea"
              value={values.requirements}
              onChange={(e) => form.setField('requirements', e.target.value)}
            />
          </Field>
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="cf-label">
            Preferred Contact Method <span className="font-normal text-muted">(optional)</span>
          </legend>
          {/* Four across where there is room for "Video Meeting" on one line, otherwise 2 x 2. */}
          <div className={`mt-2 grid grid-cols-2 gap-2.5 ${large ? 'md:grid-cols-4 lg:grid-cols-2' : 'md:grid-cols-4'}`}>
            {CONTACT_METHODS.map((m) => (
              <label key={m.value} className="relative block">
                <input
                  type="radio"
                  name={`${uid}-contactMethod`}
                  value={m.value}
                  checked={values.contactMethod === m.value}
                  onChange={() => form.setField('contactMethod', m.value)}
                  className="peer sr-only"
                />
                <span className="cf-choice">
                  <Icon name={m.icon} className="h-4 w-4 shrink-0" />
                  {m.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Honeypot: hidden from people and assistive technology. */}
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            name={`${uid}-website`}
            value={values.website}
            onChange={(e) => form.setField('website', e.target.value)}
          />
        </label>
      </div>

      {status === 'error' && form.submitError && (
        <div role="alert" className="mt-6 flex gap-3 rounded-xl border border-[#F87171]/35 bg-[#F87171]/[0.07] px-4 py-3.5 text-[14px] leading-relaxed text-[#FECACA]">
          <Icon name="alert" className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#F87171]" />
          <span>{form.submitError}</span>
        </div>
      )}

      <div className={large ? 'mt-8' : 'mt-7'}>
        <button type="submit" className={`btn-primary w-full sm:w-auto ${large ? 'sm:min-w-[280px]' : 'sm:min-w-[260px]'}`} disabled={submitting}>
          {submitting ? (
            <>
              <span aria-hidden="true" className="cf-spinner" />
              Sending...
            </>
          ) : (
            <>
              Book My Free Consultation
              <Icon name="arrowRight" className="h-4 w-4" />
            </>
          )}
        </button>
        <p className="mt-4 max-w-[560px] text-[12.5px] leading-relaxed text-muted">
          By submitting this form, you agree that our team may contact you regarding your inquiry.
        </p>
      </div>
      <p className="sr-only" aria-live="polite">
        {submitting ? 'Sending your request.' : ''}
      </p>
    </form>
  );
}

function Field({ id, label, required, error, hint, children }: { id: string; label: string; required?: boolean; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="cf-label">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-cyan">
            *
          </span>
        )}
      </label>
      <div className="mt-2">{children}</div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-[12.5px] text-muted">
          {hint}
        </p>
      )}
      {hint && error && <span id={`${id}-hint`} className="sr-only">{hint}</span>}
      {error && (
        <p id={`${id}-error`} className="cf-error">
          <Icon name="alert" className="mt-px h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function Select({
  value,
  placeholder,
  options,
  onChange,
  ...rest
}: {
  value: string;
  placeholder: string;
  options: readonly string[];
  onChange: (v: string) => void;
  id: string;
  name: string;
  onBlur: () => void;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
}) {
  return (
    <div className="relative">
      <select {...rest} value={value} onChange={(e) => onChange(e.target.value)} className={`cf-input cf-select ${value ? '' : 'is-empty'}`}>
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Icon name="chevronDown" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </div>
  );
}

function SuccessMark() {
  return (
    <svg viewBox="0 0 64 64" className="cf-check h-16 w-16" aria-hidden="true">
      <circle cx="32" cy="32" r="29" className="cf-check-ring" />
      <path d="m20 33 8 8 16-17" className="cf-check-tick" />
    </svg>
  );
}
