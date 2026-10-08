import { BRAND } from '../data/site';
import { consultationConfig, type ConsultationConfig } from './config';
import type { ConsultationValues } from './schema';

export interface SubmissionMeta {
  location: 'modal' | 'section';
}

export interface SubmissionResult {
  /** True when the build runs in preview demo mode and nothing was sent. */
  demo: boolean;
}

export type SubmissionErrorKind = 'config' | 'network' | 'timeout' | 'server';

export class SubmissionError extends Error {
  constructor(
    public kind: SubmissionErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'SubmissionError';
  }
}

const fallback = `please email us at ${BRAND.email}`;

/** Request body for a custom API. Zoho, Salesforce or an email notifier can be fed from here by your backend. */
function customPayload(v: ConsultationValues, meta: SubmissionMeta) {
  return {
    fullName: v.fullName,
    email: v.email,
    company: v.company || null,
    phone: v.phone || null,
    service: v.service,
    projectStage: v.stage || null,
    requirements: v.requirements,
    preferredContactMethod: v.contactMethod || null,
    honeypot: v.website,
    meta: {
      location: meta.location,
      pageUrl: window.location.href,
      referrer: document.referrer || null,
      submittedAt: new Date().toISOString(),
    },
  };
}

/** Formspree accepts any field names; `_gotcha` is its built-in honeypot. */
function formspreePayload(v: ConsultationValues, meta: SubmissionMeta) {
  return {
    name: v.fullName,
    email: v.email,
    company: v.company,
    phone: v.phone,
    service: v.service,
    projectStage: v.stage,
    message: v.requirements,
    preferredContactMethod: v.contactMethod,
    formLocation: meta.location,
    _subject: `Consultation request: ${v.service}`,
    _gotcha: v.website,
  };
}

/**
 * HubSpot Forms API v3. Field names must match properties on your HubSpot form;
 * `consultation_*` are custom contact properties you create in HubSpot.
 */
function hubspotPayload(v: ConsultationValues) {
  const [firstname, ...rest] = v.fullName.split(/\s+/);
  const fields: Record<string, string> = {
    firstname,
    lastname: rest.join(' '),
    email: v.email,
    company: v.company,
    phone: v.phone,
    message: v.requirements,
    consultation_service: v.service,
    consultation_project_stage: v.stage,
    consultation_contact_method: v.contactMethod,
  };
  return {
    fields: Object.entries(fields)
      .filter(([, value]) => value)
      .map(([name, value]) => ({ objectTypeId: '0-1', name, value })),
    context: { pageUri: window.location.href, pageName: document.title },
  };
}

function request(config: ConsultationConfig, v: ConsultationValues, meta: SubmissionMeta): { url: string; body: unknown } | null {
  switch (config.provider) {
    case 'hubspot': {
      const { portalId, formId } = config.hubspot;
      if (!portalId || !formId) return null;
      return {
        url: `https://api.hsforms.com/submissions/v3/integration/submit/${encodeURIComponent(portalId)}/${encodeURIComponent(formId)}`,
        body: hubspotPayload(v),
      };
    }
    case 'formspree':
      return config.endpoint ? { url: config.endpoint, body: formspreePayload(v, meta) } : null;
    default:
      return config.endpoint ? { url: config.endpoint, body: customPayload(v, meta) } : null;
  }
}

/**
 * Sends a consultation request to the configured CRM / API.
 * Resolves only when the endpoint accepted the request; otherwise throws a
 * SubmissionError whose message can be shown to the visitor.
 */
export async function submitConsultationForm(
  values: ConsultationValues,
  meta: SubmissionMeta,
  config: ConsultationConfig = consultationConfig,
): Promise<SubmissionResult> {
  if (config.demo) {
    // Design previews only (VITE_CONSULTATION_DEMO=true): nothing leaves the browser.
    await new Promise((r) => setTimeout(r, 900));
    return { demo: true };
  }

  const req = request(config, values, meta);
  if (!req) {
    console.error('[consultation] No endpoint configured. Set VITE_CONSULTATION_ENDPOINT (see .env.example).');
    throw new SubmissionError('config', `Online booking isn't connected yet. Your details are still here; ${fallback}.`);
  }

  // A bot filled the hidden field. HubSpot has no honeypot of its own, so drop it here;
  // the field is invisible and unreachable for people, so no visitor ever lands in this branch.
  if (config.provider === 'hubspot' && values.website) return { demo: false };

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), config.timeoutMs);
  let response: Response;
  try {
    response = await fetch(req.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new SubmissionError('timeout', `The request took too long. Please try again, or ${fallback}.`);
    }
    throw new SubmissionError('network', `We couldn't reach our server. Check your connection and try again, or ${fallback}.`);
  } finally {
    window.clearTimeout(timer);
  }

  if (!response.ok) {
    throw new SubmissionError('server', `We couldn't send your request (error ${response.status}). Please try again, or ${fallback}.`);
  }
  return { demo: false };
}
