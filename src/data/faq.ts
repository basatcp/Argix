/**
 * FAQ page content, grouped by category. Also used at build time for the
 * FAQPage structured data of /faq (vite.config.ts), so keep it plain data.
 */

export interface FaqGroup {
  /** Anchor id of the group, e.g. "compliance" (/faq#compliance). */
  id: string;
  title: string;
  /** One short line under the group title. */
  intro: string;
  items: { id: string; q: string; a: string }[];
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'projects-development',
    title: 'Projects & Development',
    intro: 'How projects are scoped, estimated and delivered, including work on code that already exists.',
    items: [
      {
        id: 'project-cost',
        q: 'How much does a software project cost?',
        a: 'Cost depends on scope, integrations, security and compliance requirements, and how soon you need to launch. We start with a consultation and a discovery phase, then provide either a fixed-scope estimate or an ongoing monthly engagement.',
      },
      {
        id: 'project-timeline',
        q: 'How long does a typical project take?',
        a: 'Timelines depend on scope, the systems involved and how quickly decisions can be made. Discovery produces a delivery plan with milestones, and development runs in short, testable sprints so you see progress throughout.',
      },
      {
        id: 'existing-codebase',
        q: 'Can you work with an existing codebase?',
        a: 'Yes. We start with a code and architecture review to understand structure, dependencies and risk, then extend or refactor the system in place instead of rewriting it by default.',
      },
      {
        id: 'take-over-project',
        q: 'Can you take over a project built by another team?',
        a: 'Yes. A structured handover covers code, infrastructure, access and documentation, followed by a technical and security assessment so you know where the project stands before new work begins.',
      },
      {
        id: 'ongoing-maintenance',
        q: 'Do you provide ongoing maintenance?',
        a: 'Yes. Maintenance can cover updates, dependency and security patching, monitoring, bug fixes and continued feature work, set up as an ongoing monthly engagement.',
      },
    ],
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    intro: 'Testing, remediation and monitoring for your software and infrastructure, whoever built it.',
    items: [
      {
        id: 'secure-other-team',
        q: 'Can you secure software built by another team?',
        a: 'Yes. Existing applications and infrastructure can be assessed, tested and prioritized for remediation. Fixes can be made by your team, by our engineers, or by both together.',
      },
      {
        id: 'pentest-scope',
        q: 'What does penetration testing include?',
        a: 'Manual testing of the agreed scope, such as web applications, APIs, mobile apps, networks or cloud environments. The report includes an executive summary, findings ranked by severity, technical evidence, remediation steps and mapping to your target frameworks.',
      },
      {
        id: 'retesting',
        q: 'Do you provide retesting after remediation?',
        a: 'Yes. Once fixes are in place, we retest the affected findings and update the report to show which issues are resolved.',
      },
      {
        id: 'ongoing-monitoring',
        q: 'Can you provide ongoing monitoring?',
        a: 'Yes. SOC monitoring covers continuous monitoring, triage and escalation of security events, with incident response support when an event needs action.',
      },
    ],
  },
  {
    id: 'compliance',
    title: 'Compliance',
    intro: 'Readiness support for the frameworks your customers, partners and auditors ask about.',
    items: [
      {
        id: 'soc2-readiness',
        q: 'Can you help with SOC 2 readiness?',
        a: 'Yes. We assess your controls against the Trust Services Criteria, help close the gaps, and prepare the policies and evidence your auditor will review. The SOC 2 report itself is issued by an independent auditor.',
      },
      {
        id: 'iso27001-readiness',
        q: 'Can you help with ISO 27001 readiness?',
        a: 'Yes. Support covers gap assessment, risk assessment, ISMS policies and procedures, the Statement of Applicability and preparation for the certification audit, which an accredited certification body carries out.',
      },
      {
        id: 'hipaa-pci',
        q: 'Do you support HIPAA or PCI DSS projects?',
        a: 'Yes. For HIPAA, we help with risk analysis and safeguards for systems that handle protected health information. For PCI DSS, we help reduce scope, strengthen controls and prepare for assessment of systems that handle card data.',
      },
      {
        id: 'guarantee-certification',
        q: 'Can you guarantee certification?',
        a: 'No. Certification is performed by independent accredited bodies. We can support readiness and remediation.',
      },
    ],
  },
  {
    id: 'engagement',
    title: 'Engagement',
    intro: 'How a first conversation becomes a project, and what support looks like once you are live.',
    items: [
      {
        id: 'get-started',
        q: 'How do we get started?',
        a: 'Book a free 30-minute consultation. We discuss your goals, systems and constraints and recommend next steps: usually a discovery phase that produces a delivery plan, followed by a fixed-scope estimate or an ongoing engagement.',
      },
      {
        id: 'discovery-call',
        q: 'Do you offer a discovery call?',
        a: 'Yes. The free consultation is a discovery call with an engineer, focused on your goals, current systems and any security or compliance requirements. There is no obligation to continue.',
      },
      {
        id: 'development-and-security',
        q: 'Can we hire you for development and security together?',
        a: 'Yes. Software engineering, cloud, testing and security can be delivered as one integrated engagement, so security is designed in from architecture through launch instead of added at the end.',
      },
      {
        id: 'after-launch',
        q: 'What happens after launch?',
        a: 'You receive documentation and a structured handover. From there, you can run the system yourselves or retain ongoing support, maintenance, monitoring and security services.',
      },
    ],
  },
];
