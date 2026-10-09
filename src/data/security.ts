import type { IconName } from '../components/Icons';

/**
 * Content for the Security page (/security). Section ids are shared anchors:
 * other pages, the footer and the homepage link to /security#<id>.
 *
 * Copy rules: readiness and support, never certification; no SLAs, response
 * times, counts or client claims.
 */

export type SecuritySectionId =
  | 'penetration-testing'
  | 'grc-compliance'
  | 'vciso'
  | 'soc-monitoring'
  | 'incident-response'
  | 'secure-development';

/** In-page index (sub-navigation), in page order. */
export const SECURITY_SECTIONS: { id: SecuritySectionId; label: string }[] = [
  { id: 'penetration-testing', label: 'Penetration Testing' },
  { id: 'grc-compliance', label: 'GRC & Compliance' },
  { id: 'vciso', label: 'vCISO' },
  { id: 'soc-monitoring', label: 'SOC Monitoring' },
  { id: 'incident-response', label: 'Incident Response' },
  { id: 'secure-development', label: 'Secure Development' },
];

export const SECURITY_HERO = {
  eyebrow: 'Security',
  title: 'Protect What You Build',
  lead: 'Cybersecurity, penetration testing, compliance, monitoring, and security leadership designed to reduce risk across your technology environment.',
  cta: 'Talk to a Security Expert',
};

/**
 * Who issues what. Shared wording for every place that mentions compliance
 * frameworks (Security page, Services page), so the legal statement reads the
 * same everywhere. HIPAA and the NIST CSF have no official certification.
 */
export const CERTIFICATION_NOTE =
  'SOC 2 reports and ISO 27001 certificates are issued by independent auditors and accredited certification bodies. HIPAA and the NIST CSF have no official certification. Our role is readiness, remediation and evidence preparation.';

type Item = { title: string; text: string };
type IconItem = Item & { icon: IconName };

// ---------------------------------------------------------------- 1. Penetration testing

export const PENTEST = {
  eyebrow: 'Penetration Testing',
  title: 'Manual Testing, Not Just Scans',
  lead: 'Scanners find known patterns. Our testers work through your systems the way an attacker would: chaining small issues together, probing business logic and checking whether access controls actually hold.',
  note: 'Every test is scoped and scheduled with you in advance and runs only against the targets you authorize.',
  targets: [
    { title: 'Web Applications', text: 'Authentication, sessions, business logic and the OWASP Top 10.', icon: 'layout' },
    { title: 'APIs', text: 'Endpoints and authentication, authorization between users and tenants, and input handling.', icon: 'plug' },
    { title: 'Mobile Applications', text: 'The app on the device, the data it stores and the APIs behind it.', icon: 'mobile' },
    { title: 'Cloud Environments', text: 'Cloud configuration, identity and access, storage and public endpoints.', icon: 'cloud' },
    { title: 'Infrastructure', text: 'External and internal networks, hosts, exposed services and segmentation.', icon: 'server' },
  ] satisfies IconItem[],
  steps: [
    { title: 'Manual Testing', text: 'Hands-on testing of the agreed scope. Tools add coverage; experienced testers find the issues that matter.' },
    { title: 'Ranked Findings', text: 'Every finding ranked by severity, with technical evidence and what it means for your business.' },
    { title: 'Remediation Guidance', text: 'Specific fix steps your developers can act on, plus an executive summary for leadership.' },
    { title: 'Retesting', text: 'Retesting of agreed fixes, with an updated report that confirms what has been resolved.' },
  ] satisfies Item[],
};

// ---------------------------------------------------------------- 2. GRC & compliance

export const GRC = {
  eyebrow: 'GRC & Compliance',
  title: 'Readiness for the Frameworks Your Customers Ask About',
  lead: 'We help you understand where you stand, close the gaps and prepare the evidence an independent auditor or assessor will ask for.',
  /** Each row names the work (readiness or alignment), never the framework alone. */
  frameworks: [
    {
      name: 'SOC 2',
      kind: 'Readiness',
      scope: 'Trust services criteria',
      text: 'Define scope, map your controls to the criteria, close gaps and prepare evidence for your auditor.',
    },
    {
      name: 'ISO 27001',
      kind: 'Readiness',
      scope: 'Information security management',
      text: 'Set up the ISMS, run the risk assessment and prepare the Statement of Applicability before the certification audit.',
    },
    {
      name: 'HIPAA',
      kind: 'Readiness',
      scope: 'Protected health information',
      text: 'Assess administrative, physical and technical safeguards, document the risk analysis and align your controls.',
    },
    {
      name: 'PCI DSS',
      kind: 'Readiness',
      scope: 'Payment card data',
      text: 'Reduce cardholder data scope, assess the requirements and prepare for your assessor or self-assessment.',
    },
    {
      name: 'NIST CSF',
      kind: 'Alignment',
      scope: 'Security program maturity',
      text: 'Assess maturity against the NIST Cybersecurity Framework, define a target profile and prioritize the improvements that matter most.',
    },
    {
      name: 'GDPR',
      kind: 'Readiness',
      scope: 'Personal data protection',
      text: 'Map personal data and strengthen the security of processing, working alongside your legal or privacy advisers.',
    },
  ],
  supportTitle: 'Readiness support covers',
  support: ['Gap assessment', 'Control design and remediation', 'Policies and procedures', 'Evidence preparation'],
  noteTitle: 'Readiness, not certification',
  note: CERTIFICATION_NOTE,
};

// ---------------------------------------------------------------- 3. vCISO

export const VCISO = {
  // Spelled out: the eyebrow is set in capitals, which would turn "vCISO" into "VCISO".
  eyebrow: 'Virtual CISO',
  // Non-breaking hyphen (U+2011) keeps "Full‑Time" on one line in the balanced heading.
  title: 'Security Leadership Without a Full‑Time Hire',
  lead: 'A virtual CISO gives you experienced security leadership for the decisions that matter: what to fix first, where to invest and how to report risk to your board, customers and auditors.',
  fit: 'Suited to companies that need senior security direction but not a full-time CISO, or interim leadership between hires.',
  capabilities: [
    { title: 'Security Strategy', text: 'A security direction tied to your business goals, product plans and customer commitments.' },
    { title: 'Risk Management', text: 'A maintained risk register, with every risk owned, rated and tracked to a decision.' },
    { title: 'Security Roadmap', text: 'Initiatives sequenced by risk, effort and budget, and reviewed as the business changes.' },
    { title: 'Leadership Support', text: 'Board and executive reporting, customer security reviews and vendor assessments.' },
    { title: 'Governance', text: 'Policies, roles and review cycles that keep security decisions consistent and documented.' },
  ] satisfies Item[],
};

// ---------------------------------------------------------------- 4. SOC monitoring

export const SOC = {
  eyebrow: 'SOC Monitoring',
  title: 'Monitoring That Leads to Action',
  lead: 'Security monitoring that filters out the noise before it reaches your team, and escalates what matters with the context needed to respond.',
  flow: [
    { title: 'Monitoring', text: 'Logs and events collected from cloud, applications, identity and endpoints.', icon: 'radar' },
    { title: 'Alert Triage', text: 'Each alert reviewed, false positives filtered out and real issues confirmed.', icon: 'alert' },
    { title: 'Threat Detection', text: 'Related events correlated to identify real threats and attacker behavior.', icon: 'target' },
    { title: 'Escalation', text: 'Confirmed issues passed to your team with evidence and recommended next steps.', icon: 'users' },
    { title: 'Ongoing Visibility', text: 'Regular reporting on activity, trends and gaps in coverage.', icon: 'activity' },
  ] satisfies IconItem[],
  note: 'Coverage, escalation contacts and reporting cadence are agreed with you during onboarding.',
};

// ---------------------------------------------------------------- 5. Incident response

export const IR = {
  eyebrow: 'Incident Response',
  title: 'Prepared Before an Incident, Steady During One',
  lead: 'Incidents are easier to contain when the plan, the contacts and the logs exist before they are needed. We help you prepare, then work alongside your team from investigation to recovery.',
  phases: [
    { title: 'Preparation', text: 'Response plans, roles, contact lists and logging in place before an incident happens.' },
    { title: 'Investigation', text: 'Establish what happened, which systems and data were affected and how the attacker got in.' },
    { title: 'Containment', text: 'Limit the spread: isolate affected systems, revoke compromised access and preserve evidence.' },
    { title: 'Remediation', text: 'Remove the cause, close the entry point and restore systems safely.' },
    { title: 'Post-Incident Review', text: 'Document what happened, what worked and what to change, so the next response starts from a stronger plan.' },
  ] satisfies Item[],
  loopNote: 'Lessons feed back into preparation',
};

// ---------------------------------------------------------------- 6. Secure development

type Stage = { stage: string; practices: Item[] };

export const SECURE_DEV = {
  eyebrow: 'Secure Development',
  title: 'Security Starts Before Launch',
  lead: 'The easiest vulnerability to fix is the one that never ships. Security is part of how we design, write and deliver software, not a test at the end.',
  /** Two lanes of one flow (Design, Code, Build, Release); each practice sits on its stage. */
  lanes: [
    {
      key: 'build' as const,
      label: 'Design and code',
      title: 'While We Design and Build',
      icon: 'code' as IconName,
      stages: [
        {
          stage: 'Design',
          practices: [
            { title: 'Threat Modeling', text: 'How the system could be attacked, mapped before code is written.' },
            { title: 'Access Controls', text: 'Least privilege for users, services and environments, designed in from the start.' },
          ],
        },
        {
          stage: 'Code',
          practices: [{ title: 'Secure Coding', text: 'OWASP-aligned standards and security-focused code review.' }],
        },
      ] satisfies Stage[],
    },
    {
      key: 'secure' as const,
      label: 'Pipeline and release',
      title: 'Every Time Code Ships',
      icon: 'shield' as IconName,
      stages: [
        {
          stage: 'Build',
          practices: [
            { title: 'Dependency Scanning', text: 'Third-party packages checked for known vulnerabilities on every build.' },
            { title: 'Secret Scanning', text: 'Commits and builds checked for exposed keys, tokens and credentials.' },
          ],
        },
        {
          stage: 'Release',
          practices: [{ title: 'Secure CI/CD', text: 'Pipelines with security checks, protected credentials and controlled deployments.' }],
        },
      ] satisfies Stage[],
    },
  ],
};

export const SECURITY_CTA = {
  heading: 'Not Sure Where Your Biggest Risks Are?',
  text: 'Tell us about your systems and your goals. We will help you decide where to start: a penetration test, a readiness assessment or ongoing security support.',
  cta: 'Talk to a Security Expert',
};
