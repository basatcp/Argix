import type { IconName } from '../components/Icons';

export const BRAND = {
  name: 'Corelayer',
  tagline: 'Secure software, AI, cloud and cybersecurity services for modern businesses.',
  // TODO: Replace placeholders with real contact channels before launch.
  email: 'hello@example.com',
  whatsappUrl: 'https://wa.me/10000000000',
  linkedinUrl: 'https://www.linkedin.com/company/example',
};

export const NAV = [
  { label: 'Services', href: '#services' },
  { label: 'Industries', href: '#industries' },
  { label: 'Process', href: '#process' },
  { label: 'Security', href: '#security' },
  { label: 'FAQ', href: '#faq' },
];

export const FRAMEWORKS = ['ISO/IEC 27001', 'SOC 2', 'HIPAA', 'PCI DSS', 'NIST CSF', 'OWASP Top 10', 'GDPR'];

export type Pillar = {
  key: 'build' | 'run' | 'secure';
  title: string;
  layer: string;
  description: string;
  services: string[];
};

export const PILLARS: Pillar[] = [
  {
    key: 'build',
    title: 'Build',
    layer: 'Inner core',
    description: 'Software and digital products designed around how your business works.',
    services: ['Web Application Development', 'Mobile App Development', 'APIs & Integrations', 'Websites & E-Commerce', 'AI Solutions'],
  },
  {
    key: 'run',
    title: 'Run',
    layer: 'Rings & structure',
    description: 'Secure delivery pipelines and infrastructure built for performance and scale.',
    services: ['DevOps', 'Cloud Infrastructure', 'CI/CD', 'Azure', 'AWS', 'Infrastructure as Code'],
  },
  {
    key: 'secure',
    title: 'Secure',
    layer: 'Outer shield',
    description: 'Find weaknesses, strengthen controls and maintain security after launch.',
    services: ['Penetration Testing', 'GRC & Compliance', 'SOC Monitoring', 'vCISO', 'Incident Response'],
  },
];

export const SERVICES: { title: string; text: string; icon: IconName; group: 'Build' | 'Run' | 'Secure' }[] = [
  {
    title: 'Custom Software Development',
    text: 'Software designed around your business, from architecture and development through launch and support.',
    icon: 'code',
    group: 'Build',
  },
  {
    title: 'Web Application Development',
    text: 'Secure portals, dashboards and business systems designed for scalability.',
    icon: 'layout',
    group: 'Build',
  },
  {
    title: 'AI Solutions',
    text: 'AI features, assistants, automation and document intelligence integrated into your software.',
    icon: 'chip',
    group: 'Build',
  },
  {
    title: 'DevOps & Cloud',
    text: 'Secure CI/CD pipelines and cloud environments across Azure and AWS.',
    icon: 'cloud',
    group: 'Run',
  },
  {
    title: 'Penetration Testing',
    text: 'Manual testing of web apps, APIs, mobile, networks and cloud environments.',
    icon: 'target',
    group: 'Secure',
  },
  {
    title: 'GRC & Compliance',
    text: 'Readiness support for SOC 2, ISO 27001, HIPAA and PCI DSS.',
    icon: 'clipboard',
    group: 'Secure',
  },
  {
    title: 'SOC Monitoring',
    text: 'Monitoring, triage and escalation for security events.',
    icon: 'activity',
    group: 'Secure',
  },
  {
    title: 'vCISO',
    text: 'Fractional security leadership, risk strategy and compliance oversight.',
    icon: 'userShield',
    group: 'Secure',
  },
];

// TODO: Replace with verified client metrics. These values are placeholders/demo values.
export const STATS = [
  { value: 50, suffix: '+', label: 'Secure Deployments' },
  { value: 20, suffix: '+', label: 'Team Certifications' },
  { value: 5, suffix: '', label: 'Industries Served' },
  { value: 17, suffix: '+', label: 'Years Combined Leadership Experience' },
];

export const INDUSTRIES: { title: string; text: string; icon: IconName }[] = [
  { title: 'Healthcare', text: 'EHR systems, interoperability, healthcare AI and secure patient-facing platforms.', icon: 'heartPulse' },
  { title: 'Enterprise & SaaS', text: 'Multi-tenant applications, enterprise systems, SSO and audit-ready architecture.', icon: 'building' },
  { title: 'E-Commerce & Retail', text: 'Secure, high-performance stores, payments and integrations.', icon: 'cart' },
  { title: 'Startups & MVPs', text: 'Secure first versions built quickly, with foundations that can scale.', icon: 'rocket' },
  { title: 'Fintech', text: 'Payments, onboarding, financial platforms and regulated workflows.', icon: 'bank' },
];

/** Layers of the mini core, lit cumulatively by the process timeline. */
export type CoreLayer = 'core' | 'structure' | 'rings' | 'pipeline' | 'shield' | 'modules';

export const STEPS: { title: string; build: string; secure: string; layer: CoreLayer; layerLabel: string }[] = [
  {
    title: 'Discovery & Consultation',
    build: 'Define goals, users, scope and success metrics.',
    secure: 'Map sensitive data, access and risk.',
    layer: 'core',
    layerLabel: 'Core defined',
  },
  {
    title: 'Strategy & Architecture',
    build: 'Create scalable architecture and roadmap.',
    secure: 'Threat-model the design before code is written.',
    layer: 'structure',
    layerLabel: 'Structure designed',
  },
  {
    title: 'Secure Development',
    build: 'Develop in short, testable sprints.',
    secure: 'Use secure coding, dependency scanning and secret detection.',
    layer: 'rings',
    layerLabel: 'Inner rings built',
  },
  {
    title: 'Security Integration',
    build: 'Automate builds and deployments.',
    secure: 'Integrate checks into CI/CD and apply least privilege.',
    layer: 'pipeline',
    layerLabel: 'Pipelines connected',
  },
  {
    title: 'Testing & Penetration Testing',
    build: 'QA, performance and acceptance testing.',
    secure: 'Independent penetration testing and retesting.',
    layer: 'shield',
    layerLabel: 'Outer shield tested',
  },
  {
    title: 'Launch & Monitoring',
    build: 'Release, document and hand over.',
    secure: 'Monitoring, patching and incident response.',
    layer: 'modules',
    layerLabel: 'Full system live',
  },
];

export const SECURITY_DEPT: { title: string; text: string; icon: IconName }[] = [
  { title: 'Virtual CISO', text: 'Security strategy, risk, board reporting and vendor reviews.', icon: 'userShield' },
  { title: 'Security Program Management', text: 'Policies, risk registers, awareness, compliance and incident planning.', icon: 'layers' },
  { title: 'Outsourced Security Team', text: 'A broader security function covering governance, testing and monitoring.', icon: 'users' },
  { title: 'SOC Monitoring', text: 'Continuous monitoring and triage of security alerts.', icon: 'radar' },
];

export const SECURE_CODING = [
  'OWASP-aligned secure coding',
  'Threat modeling',
  'Dependency scanning',
  'Secret scanning',
  'Least privilege',
  'Security-integrated CI/CD',
];

export const REPORT_ITEMS = [
  'Executive summary',
  'Findings ranked by severity',
  'Technical evidence',
  'Remediation steps',
  'Retesting',
  'Mapping to target frameworks',
];

// Example certifications held by individual team members.
// TODO: Confirm the final list against verified team credentials.
export const CERTIFICATIONS = [
  { code: 'CISSP', area: 'Security leadership' },
  { code: 'CISM', area: 'Security management' },
  { code: 'CISA', area: 'Audit & assurance' },
  { code: 'ISO 27001 LA', area: 'Lead auditor' },
  { code: 'OSCP', area: 'Offensive security' },
  { code: 'OSEP', area: 'Evasion & breaching' },
  { code: 'OSWE', area: 'Web exploitation' },
  { code: 'CREST', area: 'Penetration testing' },
  { code: 'CEH', area: 'Ethical hacking' },
];

export const FAQS = [
  {
    q: 'How much does a project cost?',
    a: 'Pricing depends on scope. Start with a consultation and discovery phase, then provide either a fixed-scope estimate or an ongoing monthly engagement.',
  },
  {
    q: 'Can you secure software built by another team?',
    a: 'Yes. Existing systems can be assessed, tested and prioritized for remediation.',
  },
  {
    q: 'Can you make us SOC 2 or ISO 27001 certified?',
    a: 'No consultancy issues certification. The team can prepare the company, close gaps and support evidence collection for the independent auditor or certification body.',
  },
  {
    q: 'What happens after launch?',
    a: 'Clients can run the system themselves or retain ongoing support, monitoring and security services.',
  },
  {
    q: 'Do you provide development and cybersecurity together?',
    a: 'Yes. Software engineering, cloud, testing and security can be delivered as one integrated engagement.',
  },
];

export const FOOTER_COLUMNS = [
  {
    title: 'Build & Run',
    links: [
      { label: 'Software Development', href: '#services' },
      { label: 'Web Apps', href: '#services' },
      { label: 'Mobile Apps', href: '#pillars' },
      { label: 'AI Solutions', href: '#services' },
      { label: 'DevOps', href: '#services' },
      { label: 'Cloud', href: '#pillars' },
    ],
  },
  {
    title: 'Secure & Comply',
    links: [
      { label: 'Cybersecurity', href: '#security' },
      { label: 'Penetration Testing', href: '#services' },
      { label: 'GRC', href: '#services' },
      { label: 'SOC Monitoring', href: '#security' },
      { label: 'vCISO', href: '#security' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#pillars' },
      { label: 'Industries', href: '#industries' },
      { label: 'Certifications', href: '#certifications' },
      // TODO: Point to the blog once it exists.
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#contact' },
    ],
  },
];
