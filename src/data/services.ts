import type { IconName } from '../components/Icons';

/**
 * Services page content. Each `slug` is the element id of the service on
 * /services (shared anchor ids: other pages and the footer link to them).
 */

export interface BuildService {
  slug: string;
  title: string;
  icon: IconName;
  summary: string;
  capabilities: string[];
  useCases: string[];
}

export interface SecureService {
  slug: string;
  title: string;
  icon: IconName;
  /** Short functional label shown on the card. */
  role: string;
  explanation: string;
  included: string[];
  forWho: string;
  /** The matching section of the Security page, where one exists. */
  detailsHref?: string;
}

export const BUILD_RUN_INTRO = {
  eyebrow: 'Build & Run',
  title: 'Build It Right, Then Keep It Running',
  lead: 'Custom software, web and mobile apps, integrations, cloud and AI, delivered by engineers who write secure code by default and stay involved after launch.',
};

export const BUILD_RUN: BuildService[] = [
  {
    slug: 'custom-software-development',
    title: 'Custom Software Development',
    icon: 'code',
    summary: 'Software designed around how your business works, from architecture and development through launch and long-term support.',
    capabilities: [
      'Architecture and technical planning',
      'Full-stack development in sprints',
      'Legacy system modernization',
      'Secure coding and code review',
      'Support and maintenance after launch',
    ],
    useCases: [
      'Replacing spreadsheets and manual workflows',
      'Rebuilding a legacy application on a maintainable stack',
      'Internal tools for operations and finance teams',
    ],
  },
  {
    slug: 'web-application-development',
    title: 'Web Application Development',
    icon: 'layout',
    summary: 'Secure portals, dashboards and business systems built for real users, sensitive data and growth.',
    capabilities: [
      'Customer, partner and patient portals',
      'Dashboards and reporting',
      'Multi-tenant SaaS architecture',
      'Role-based access, SSO and audit logs',
      'Performance and accessibility testing',
    ],
    useCases: [
      'A SaaS product, from first release to scale',
      'A self-service portal for customers or patients',
      'One admin system in place of several tools',
    ],
  },
  {
    slug: 'mobile-app-development',
    title: 'Mobile App Development',
    icon: 'mobile',
    summary: 'iOS and Android apps that share secure APIs with your web platform and are ready for app store review.',
    capabilities: [
      'Cross-platform and native apps',
      'Secure sign-in and on-device storage',
      'API and backend integration',
      'Push notifications and offline mode',
      'App store release management',
    ],
    useCases: [
      'A companion app for your web platform',
      'Field and workforce apps that work offline',
      'Apps that handle personal or payment data',
    ],
  },
  {
    slug: 'apis-integrations',
    title: 'APIs & Integrations',
    icon: 'plug',
    summary: 'Reliable connections between your systems, partners and third-party platforms, with access control and logging built in.',
    capabilities: [
      'REST and GraphQL API design',
      'Partner and third-party integrations',
      'Payments, identity and messaging',
      'Healthcare data exchange (HL7, FHIR)',
      'Authentication, rate limits and logs',
    ],
    useCases: [
      'Connecting CRM, ERP and billing systems',
      'Exposing a secure API to partners',
      'Syncing data between old and new platforms',
    ],
  },
  {
    slug: 'websites-ecommerce',
    title: 'Websites & E-Commerce',
    icon: 'cart',
    summary: 'Fast, secure websites and online stores that your team can update without a developer for every change.',
    capabilities: [
      'Company websites with a CMS',
      'Storefronts, catalogs and checkout',
      'Payment gateway integration',
      'Performance, SEO and accessibility',
      'Hardening, backups and updates',
    ],
    useCases: [
      'A website your marketing team can manage',
      'An online store with secure payments',
      'Moving a store to a faster platform',
    ],
  },
  {
    slug: 'devops-cloud',
    title: 'DevOps & Cloud',
    icon: 'cloud',
    summary: 'Secure CI/CD pipelines and cloud environments across Azure and AWS, defined as code and ready to scale.',
    capabilities: [
      'CI/CD pipelines with security checks',
      'Infrastructure as Code',
      'Azure and AWS architecture',
      'Containers and orchestration',
      'Monitoring, logging and cost control',
    ],
    useCases: [
      'Replacing manual deployments with pipelines',
      'Migrating workloads to Azure or AWS',
      'Matching staging and production environments',
    ],
  },
  {
    slug: 'ai-solutions',
    title: 'AI Solutions',
    icon: 'chip',
    summary: 'AI features, assistants, automation and document intelligence integrated into your software, with your data kept under control.',
    capabilities: [
      'Assistants for products and teams',
      'Document processing and extraction',
      'Workflow automation',
      'Search over your own knowledge base',
      'Access controls and data privacy',
    ],
    useCases: [
      'Extracting data from invoices and forms',
      'An internal assistant over company documents',
      'Automating repetitive review and triage',
    ],
  },
];

export const SECURE_COMPLY_INTRO = {
  eyebrow: 'Secure & Comply',
  title: 'Find Weaknesses. Strengthen Controls. Stay Audit-Ready.',
  lead: 'Testing, compliance readiness, monitoring and security leadership from specialists who also understand how software is built.',
};

export const SECURE_COMPLY: SecureService[] = [
  {
    slug: 'cybersecurity',
    title: 'Cybersecurity',
    icon: 'shield',
    role: 'Protect',
    explanation: 'A practical security program for your systems, people and vendors, prioritized by risk and sized to your business.',
    included: [
      'Security posture and risk assessment',
      'Cloud and application security reviews',
      'Security policies and standards',
      'Remediation planning and support',
    ],
    forWho: 'Companies without a dedicated security team, or teams that need a clear plan for where to start.',
    detailsHref: '/security',
  },
  {
    slug: 'penetration-testing',
    title: 'Penetration Testing / VAPT',
    icon: 'target',
    role: 'Test',
    explanation: 'Manual testing and vulnerability assessment of web apps, APIs, mobile apps, networks and cloud environments.',
    included: [
      'Scoping and rules of engagement',
      'Manual testing backed by automated scanning',
      'Findings ranked by severity, with evidence',
      'Remediation guidance and retesting',
    ],
    forWho: 'Teams preparing for a launch, a customer security review or a compliance audit.',
    detailsHref: '/security#penetration-testing',
  },
  {
    slug: 'grc-compliance',
    title: 'GRC & Compliance',
    icon: 'clipboard',
    role: 'Comply',
    explanation: 'Readiness support for SOC 2, ISO 27001, HIPAA and PCI DSS, from gap assessment to audit preparation.',
    included: [
      'Gap assessment against your target framework',
      'Policies, procedures and risk register',
      'Control implementation and remediation support',
      'Evidence preparation for your auditor',
    ],
    forWho: 'Companies that need to meet customer, regulatory or contractual security requirements.',
    detailsHref: '/security#grc-compliance',
  },
  {
    slug: 'soc-monitoring',
    title: 'SOC Monitoring',
    icon: 'activity',
    role: 'Monitor',
    explanation: 'Monitoring, triage and escalation of security events across your cloud, endpoints and applications.',
    included: [
      'Log collection and alert tuning',
      'Event triage and investigation',
      'Escalation with clear next steps',
      'Regular reporting on security activity',
    ],
    forWho: 'Organizations that need eyes on security alerts without staffing an internal SOC.',
    detailsHref: '/security#soc-monitoring',
  },
  {
    slug: 'vciso',
    title: 'vCISO',
    icon: 'userShield',
    role: 'Lead',
    explanation: 'Fractional security leadership for strategy, risk management, compliance oversight and board reporting.',
    included: [
      'Security strategy and roadmap',
      'Risk management and reporting',
      'Vendor and third-party security reviews',
      'Compliance program oversight',
    ],
    forWho: 'Growing companies that need senior security leadership before hiring a full-time CISO.',
    detailsHref: '/security#vciso',
  },
  {
    slug: 'incident-response',
    title: 'Incident Response',
    icon: 'alert',
    role: 'Respond',
    explanation: 'Support to contain, investigate and recover from a security incident, and a tested plan for the next one.',
    included: [
      'Incident response plans and playbooks',
      'Containment and investigation support',
      'Recovery and post-incident review',
      'Tabletop exercises for your team',
    ],
    forWho: 'Any team that handles sensitive data and wants a tested plan before it is needed.',
    detailsHref: '/security#incident-response',
  },
];

/** Compliance wording rule: readiness and preparation, never certification. Same statement as the Security page. */
export { CERTIFICATION_NOTE as COMPLIANCE_NOTE } from './security';

export const INTEGRATED_INTRO = {
  eyebrow: 'Integrated approach',
  title: 'Development and Security Should Not Be Separate',
  lead: 'The team that builds your system also tests, deploys and monitors it, so what we learn in production goes straight back into the next release.',
};

export interface FlowStage {
  key: string;
  label: string;
  icon: IconName;
  text: string;
}

export const FLOW_STAGES: FlowStage[] = [
  { key: 'build', label: 'Build', icon: 'code', text: 'Secure coding and peer review in every sprint.' },
  { key: 'secure', label: 'Secure', icon: 'shield', text: 'Threat modeling, dependency and secret scanning.' },
  { key: 'test', label: 'Test', icon: 'target', text: 'QA, performance and penetration testing before release.' },
  { key: 'deploy', label: 'Deploy', icon: 'rocket', text: 'Automated pipelines with least-privilege access.' },
  { key: 'monitor', label: 'Monitor', icon: 'activity', text: 'Monitoring, patching and incident response.' },
];

export const FLOW_LOOP_NOTE = 'What monitoring finds feeds the next build';

export const SERVICES_CTA = {
  heading: 'Need Help Choosing the Right Service?',
  text: 'Tell us what you are building or what you need to protect. An engineer will recommend where to start, and you will hear back within one business day.',
};
