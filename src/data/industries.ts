import type { IconName } from '../components/Icons';
import type { MotifKind } from '../components/backgrounds/CardMotif';

/**
 * Industries page content. Each industry is one section on /industries; `id`
 * is its shared anchor (see the site's cross-links), `motif` picks the panel
 * visual (same concepts as the homepage industry card motifs).
 *
 * Copy rules: no client names, case studies, statistics or certification
 * claims. Standards and regulations are listed as what the work is aligned with
 * or prepared for, never as something the company holds.
 */

export interface IndustryLink {
  label: string;
  href: string;
}

export interface Industry {
  id: 'healthcare' | 'enterprise-saas' | 'ecommerce-retail' | 'startups-mvps' | 'fintech';
  title: string;
  /** Short label for the in-page navigation chips (phones and tablets). */
  short: string;
  icon: IconName;
  motif: MotifKind;
  challenge: string;
  build: string[];
  security: string[];
  solutions: string[];
  /** Laws, regulations and standards that commonly apply in this sector (not certifications held). */
  frameworks: string[];
  services: IndustryLink[];
}

const S = {
  custom: { label: 'Custom Software Development', href: '/services#custom-software-development' },
  web: { label: 'Web Application Development', href: '/services#web-application-development' },
  mobile: { label: 'Mobile App Development', href: '/services#mobile-app-development' },
  apis: { label: 'APIs & Integrations', href: '/services#apis-integrations' },
  ecommerce: { label: 'Websites & E-Commerce', href: '/services#websites-ecommerce' },
  devops: { label: 'DevOps & Cloud', href: '/services#devops-cloud' },
  ai: { label: 'AI Solutions', href: '/services#ai-solutions' },
  pentest: { label: 'Penetration Testing', href: '/security#penetration-testing' },
  grc: { label: 'GRC & Compliance', href: '/security#grc-compliance' },
  soc: { label: 'SOC Monitoring', href: '/security#soc-monitoring' },
  vciso: { label: 'vCISO', href: '/security#vciso' },
  ir: { label: 'Incident Response', href: '/security#incident-response' },
} satisfies Record<string, IndustryLink>;

export const INDUSTRY_DETAILS: Industry[] = [
  {
    id: 'healthcare',
    title: 'Healthcare',
    short: 'Healthcare',
    icon: 'heartPulse',
    motif: 'healthcare',
    challenge:
      'Healthcare platforms hold some of the most sensitive data there is. They have to exchange records between systems that were never built to work together and stay available when care teams depend on them. When a platform handles protected health information, HIPAA safeguards apply from the first release.',
    build: [
      'Patient portals and telehealth platforms',
      'EHR and EMR integrations using HL7 and FHIR',
      'Clinical and operational dashboards',
      'AI-assisted document processing and workflow automation',
      'Mobile apps for patients and care teams',
    ],
    security: [
      'Protected health information encrypted in transit and at rest',
      'Role-based access and audit trails for patient records',
      'Controls mapped to HIPAA administrative and technical safeguards',
      'Risk reviews for vendors and third-party integrations',
      'Clear limits on the data AI features can see and store',
    ],
    solutions: [
      'Patient intake and scheduling portal',
      'Telehealth visit platform',
      'FHIR API layer for data exchange',
      'Remote patient monitoring dashboard',
    ],
    frameworks: ['HIPAA', 'HL7 FHIR', 'SOC 2'],
    services: [S.web, S.apis, S.ai, S.grc, S.pentest],
  },
  {
    id: 'enterprise-saas',
    title: 'Enterprise & SaaS',
    short: 'SaaS',
    icon: 'building',
    motif: 'saas',
    challenge:
      'Enterprise buyers ask hard questions before they sign: how tenant data is isolated, who can access what and what evidence supports SOC 2 or ISO 27001. The platform has to answer them while it scales to new customers and keeps shipping.',
    build: [
      'Multi-tenant SaaS platforms',
      'Enterprise portals and internal business systems',
      'SSO and identity integrations with SAML, OIDC and SCIM',
      'Admin consoles, roles and permission models',
      'Public APIs, webhooks and integrations',
    ],
    security: [
      'Tenant isolation across data, application and infrastructure',
      'SSO, MFA and least-privilege roles',
      'Audit logs that support customer and auditor reviews',
      'Security checks built into CI/CD',
      'Control evidence prepared for SOC 2 and ISO 27001 readiness',
    ],
    solutions: [
      'Multi-tenant B2B platform',
      'Customer admin console with SSO',
      'Internal operations and reporting system',
      'Billing and entitlement service',
    ],
    frameworks: ['SOC 2', 'ISO 27001', 'GDPR'],
    services: [S.custom, S.devops, S.pentest, S.grc, S.vciso],
  },
  {
    id: 'ecommerce-retail',
    title: 'E-Commerce & Retail',
    short: 'E-Commerce',
    icon: 'cart',
    motif: 'commerce',
    challenge:
      'Stores have to stay fast under peak traffic, take payments safely and keep inventory, orders and fulfillment in sync across many systems. Checkout pages, customer accounts and third-party scripts are frequent targets for fraud and data theft.',
    build: [
      'Custom and headless storefronts',
      'Checkout and payment provider integrations',
      'Inventory, ERP and fulfillment integrations',
      'Customer accounts and loyalty features',
      'Mobile shopping apps',
    ],
    security: [
      'Payment flows designed to limit PCI DSS scope',
      'Protection against account takeover and automated abuse',
      'Review and control of third-party scripts on checkout',
      'Authenticated APIs between store, ERP and logistics systems',
      'Customer data handling aligned with privacy rules such as GDPR',
    ],
    solutions: [
      'Headless storefront with a custom checkout',
      'Order management and fulfillment integration',
      'B2B ordering portal',
      'Multi-vendor marketplace',
    ],
    frameworks: ['PCI DSS', 'GDPR', 'OWASP Top 10'],
    services: [S.ecommerce, S.apis, S.mobile, S.pentest, S.soc],
  },
  {
    id: 'startups-mvps',
    title: 'Startups & MVPs',
    short: 'Startups',
    icon: 'rocket',
    motif: 'startup',
    challenge:
      'Startups need to reach users quickly on a limited budget, but early shortcuts in architecture, access and data handling get expensive later. The first enterprise customer or investor review usually brings the first security questionnaire.',
    build: [
      'MVPs and first production releases',
      'Web and mobile applications',
      'Cloud foundations with Infrastructure as Code',
      'AI features and prototypes',
      'Internal admin tools and dashboards',
    ],
    security: [
      'Authentication, secrets and access set up correctly from the start',
      'Threat modeling sized to the product and its stage',
      'Dependency and secret scanning in CI/CD',
      'Groundwork for security questionnaires and SOC 2 readiness',
      'Security leadership through a vCISO as the team grows',
    ],
    solutions: [
      'SaaS MVP with billing and user management',
      'Marketplace or booking platform',
      'AI assistant or automation prototype',
      'Pilot release for a first enterprise customer',
    ],
    frameworks: ['OWASP Top 10', 'SOC 2', 'GDPR'],
    services: [S.custom, S.mobile, S.ai, S.devops, S.vciso],
  },
  {
    id: 'fintech',
    title: 'Fintech',
    short: 'Fintech',
    icon: 'bank',
    motif: 'fintech',
    challenge:
      'Fintech products move money and personal financial data, so every flow is a target and every change has to be accounted for. Teams need to meet the expectations of banking partners, card networks and regulators while they keep shipping.',
    build: [
      'Payment and money movement features',
      'Digital onboarding with KYC and identity checks',
      'Ledger, wallet and transaction services',
      'Banking, card and open banking API integrations',
      'Back-office and case management tools',
    ],
    security: [
      'Strong authentication and session controls',
      'Encryption and key management for financial data',
      'Audit trails for transactions and admin actions',
      'PCI DSS readiness and scope reduction',
      'Monitoring and incident response plans for critical flows',
    ],
    solutions: [
      'Payments or payouts platform',
      'KYC onboarding flow',
      'Customer account and wallet app',
      'Loan application and underwriting workflow',
    ],
    frameworks: ['PCI DSS', 'SOC 2', 'ISO 27001'],
    services: [S.apis, S.pentest, S.grc, S.soc, S.ir],
  },
];
