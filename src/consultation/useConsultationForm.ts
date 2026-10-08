import { useCallback, useRef, useState } from 'react';
import { track } from './analytics';
import { EMPTY_VALUES, FIELD_ORDER, normalise, validate, validateField, type ConsultationErrors, type ConsultationValues, type FieldName } from './schema';
import { SubmissionError, submitConsultationForm } from './submit';

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error';
export type FormLocation = 'modal' | 'section';

/**
 * Unsent drafts per placement, kept in memory for the page's lifetime. Closing
 * the popup by accident and reopening it brings the visitor's input back.
 */
const drafts = new Map<FormLocation, ConsultationValues>();

/**
 * State and behaviour of a consultation form, shared by every placement.
 * Errors appear on blur once a field has content, for every field after the
 * first submit attempt, and clear as soon as the field becomes valid.
 */
export function useConsultationForm(location: FormLocation, fieldId: (name: FieldName) => string) {
  const [values, setValues] = useState<ConsultationValues>(() => drafts.get(location) ?? EMPTY_VALUES);
  const [errors, setErrors] = useState<ConsultationErrors>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [submitError, setSubmitError] = useState('');
  const [demo, setDemo] = useState(false);
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const attempted = useRef(false);
  const started = useRef(false);
  const inFlight = useRef(false);

  const markStarted = useCallback(() => {
    if (started.current) return;
    started.current = true;
    track('consultation_form_start', { location });
  }, [location]);

  const setField = useCallback(
    <K extends keyof ConsultationValues>(name: K, value: ConsultationValues[K]) => {
      markStarted();
      const next = { ...valuesRef.current, [name]: value };
      valuesRef.current = next;
      drafts.set(location, next);
      setValues(next);
      if (name === 'website') return;
      // Re-validate live only once the field has shown an error or a submit was attempted.
      setErrors((e) => (attempted.current || e[name as FieldName] ? { ...e, [name]: validateField(name as FieldName, next) } : e));
    },
    [markStarted, location],
  );

  const blurField = useCallback(
    (name: FieldName) => {
      const current = valuesRef.current;
      const hasContent = typeof current[name] === 'string' && (current[name] as string).trim() !== '';
      // Tabbing past an empty field is not an error yet; it becomes one on submit.
      if (hasContent || attempted.current) setErrors((e) => ({ ...e, [name]: validateField(name, current) }));
    },
    [],
  );

  const submit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (inFlight.current) return;
      attempted.current = true;
      markStarted();
      const values = valuesRef.current;
      const found = validate(values);
      setErrors(found);
      const first = FIELD_ORDER.find((n) => found[n]);
      if (first) {
        track('consultation_form_error', { location, reason: 'validation', service: values.service });
        document.getElementById(fieldId(first))?.focus();
        return;
      }
      inFlight.current = true;
      setStatus('submitting');
      setSubmitError('');
      track('consultation_form_submit', { location, service: values.service });
      try {
        const result = await submitConsultationForm(normalise(values), { location });
        setDemo(result.demo);
        setStatus('success');
        drafts.delete(location);
        track('consultation_form_success', { location, service: values.service });
      } catch (err) {
        const message =
          err instanceof SubmissionError ? err.message : 'Something went wrong while sending your request. Please try again.';
        setSubmitError(message);
        setStatus('error');
        track('consultation_form_error', { location, service: values.service, reason: err instanceof SubmissionError ? err.kind : 'unknown' });
      } finally {
        inFlight.current = false;
      }
    },
    [location, fieldId, markStarted],
  );

  const reset = useCallback(() => {
    drafts.delete(location);
    valuesRef.current = EMPTY_VALUES;
    setValues(EMPTY_VALUES);
    setErrors({});
    setStatus('idle');
    setSubmitError('');
    setDemo(false);
    attempted.current = false;
    started.current = false;
  }, [location]);

  return { values, errors, status, submitError, demo, setField, blurField, submit, reset };
}
