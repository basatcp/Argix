/**
 * Consultation request: fields, options and validation. Shared by the modal and
 * the homepage section so both always validate and submit the same data.
 */

export const SERVICES = [
  'Custom Software Development',
  'Web Application Development',
  'Mobile App Development',
  'AI Solutions',
  'Cloud & DevOps',
  'Cybersecurity',
  'Penetration Testing / VAPT',
  'GRC & Compliance',
  'SOC Monitoring',
  'vCISO',
  'Other',
] as const;

export const PROJECT_STAGES = [
  'Exploring an idea',
  'Planning',
  'Already in development',
  'Existing system needs improvement',
  'Security assessment needed',
  'Compliance project',
  'Ongoing support needed',
] as const;

export const CONTACT_METHODS = [
  { value: 'email', label: 'Email', icon: 'mail' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
  { value: 'call', label: 'Call', icon: 'phone' },
  { value: 'video', label: 'Video Meeting', icon: 'video' },
] as const;

export type ContactMethod = (typeof CONTACT_METHODS)[number]['value'];

export interface ConsultationValues {
  fullName: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  stage: string;
  requirements: string;
  contactMethod: ContactMethod | '';
  /** Honeypot. Hidden from people; bots tend to fill it. Passed through for the backend to discard. */
  website: string;
}

export type FieldName = Exclude<keyof ConsultationValues, 'website'>;
export type ConsultationErrors = Partial<Record<FieldName, string>>;

export const EMPTY_VALUES: ConsultationValues = {
  fullName: '',
  email: '',
  company: '',
  phone: '',
  service: '',
  stage: '',
  requirements: '',
  contactMethod: '',
  website: '',
};

export const REQUIREMENTS_MIN = 20;
export const REQUIREMENTS_MAX = 2000;

/** Order used to move focus to the first invalid field. */
export const FIELD_ORDER: FieldName[] = ['fullName', 'email', 'company', 'phone', 'service', 'stage', 'requirements', 'contactMethod'];

// Pragmatic check: one @, a dot in the domain, no spaces. Real verification happens by replying.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s().-]{7,20}$/;

export function validateField(name: FieldName, v: ConsultationValues): string | undefined {
  const value = typeof v[name] === 'string' ? (v[name] as string).trim() : '';
  switch (name) {
    case 'fullName':
      if (!value) return 'Please enter your full name.';
      if (value.length < 2) return 'Please enter your full name.';
      return undefined;
    case 'email':
      if (!value) return 'Please enter your work email.';
      if (!EMAIL.test(value)) return 'Please enter a valid work email.';
      return undefined;
    case 'phone':
      if (value && (!PHONE.test(value) || value.replace(/\D/g, '').length < 7)) {
        return 'Please enter a valid phone or WhatsApp number, including the country code.';
      }
      return undefined;
    case 'service':
      if (!value) return 'Please choose what you need help with.';
      return undefined;
    case 'requirements':
      if (!value) return 'Please tell us briefly what you want to build, improve or secure.';
      if (value.length < REQUIREMENTS_MIN) return `Please add a little more detail (at least ${REQUIREMENTS_MIN} characters).`;
      if (value.length > REQUIREMENTS_MAX) return `Please keep this under ${REQUIREMENTS_MAX} characters.`;
      return undefined;
    default:
      return undefined;
  }
}

export function validate(v: ConsultationValues): ConsultationErrors {
  const errors: ConsultationErrors = {};
  for (const name of FIELD_ORDER) {
    const error = validateField(name, v);
    if (error) errors[name] = error;
  }
  return errors;
}

/** Trimmed copy for submission. */
export function normalise(v: ConsultationValues): ConsultationValues {
  return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, typeof val === 'string' ? val.trim() : val])) as unknown as ConsultationValues;
}
