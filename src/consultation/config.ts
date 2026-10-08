/**
 * Where consultation requests are sent. Configured with build-time environment
 * variables (see .env.example); nothing secret belongs here, because everything
 * in a front-end bundle is public. CRMs that need a private key (Salesforce,
 * Zoho, HubSpot private apps) must sit behind your own API endpoint.
 *
 *   VITE_CONSULTATION_PROVIDER   custom | formspree | hubspot   (default: custom)
 *   VITE_CONSULTATION_ENDPOINT   custom: your API URL (POST JSON)
 *                                formspree: https://formspree.io/f/<form id>
 *   VITE_HUBSPOT_PORTAL_ID       hubspot: portal id (public)
 *   VITE_HUBSPOT_FORM_ID         hubspot: form GUID (public)
 *   VITE_CONSULTATION_DEMO       "true" only for design previews: requests are not sent anywhere
 */

export type Provider = 'custom' | 'formspree' | 'hubspot';

export interface ConsultationConfig {
  provider: Provider;
  endpoint: string;
  hubspot: { portalId: string; formId: string };
  demo: boolean;
  timeoutMs: number;
}

const env = import.meta.env;

export const consultationConfig: ConsultationConfig = {
  provider: ((env.VITE_CONSULTATION_PROVIDER as Provider | undefined) ?? 'custom') as Provider,
  endpoint: env.VITE_CONSULTATION_ENDPOINT ?? '',
  hubspot: {
    portalId: env.VITE_HUBSPOT_PORTAL_ID ?? '',
    formId: env.VITE_HUBSPOT_FORM_ID ?? '',
  },
  demo: env.VITE_CONSULTATION_DEMO === 'true',
  timeoutMs: 15000,
};
