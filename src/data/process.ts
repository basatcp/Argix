import type { IconName } from '../components/Icons';

/**
 * The six stages on the Process page. Every stage has two tracks of work:
 * `build` moves the product forward, `secure` is the security work that
 * belongs to the same stage. Ids are the shared anchors (/process#<id>).
 */
export interface ProcessStage {
  id: string;
  title: string;
  /** One sentence: what the stage produces. */
  summary: string;
  icon: IconName;
  build: string[];
  secure: string[];
}

/** Two-digit stage number: 1 -> "01". */
export const pad = (n: number) => String(n).padStart(2, '0');

export const PROCESS_STAGES: ProcessStage[] = [
  {
    id: 'discovery-consultation',
    title: 'Discovery & Consultation',
    summary: 'A shared understanding of what you need, who will use it and what has to be protected.',
    icon: 'users',
    build: ['Goals', 'Users', 'Business requirements', 'Scope'],
    secure: ['Data mapping', 'Access review', 'Initial risk analysis'],
  },
  {
    id: 'strategy-architecture',
    title: 'Strategy & Architecture',
    summary: 'A technical plan and roadmap, with threats and compliance needs addressed in the design.',
    icon: 'layers',
    build: ['Technical architecture', 'Roadmap', 'Platform decisions'],
    secure: ['Threat modeling', 'Security requirements', 'Compliance considerations'],
  },
  {
    id: 'secure-development',
    title: 'Secure Development',
    summary: 'Working features delivered in sprints, with code reviewed and scanned as it is written.',
    icon: 'code',
    build: ['Development sprints', 'Integrations', 'Features'],
    secure: ['Secure coding', 'Dependency scanning', 'Secret scanning', 'Code review'],
  },
  {
    id: 'security-integration',
    title: 'Security Integration',
    summary: 'Delivery pipelines and environments with security controls built in, not added later.',
    icon: 'git',
    build: ['CI/CD', 'Infrastructure', 'Deployments'],
    secure: ['Least privilege', 'Automated checks', 'Environment controls'],
  },
  {
    id: 'testing-penetration-testing',
    title: 'Testing & Penetration Testing',
    summary: 'Software tested for function, performance and security, with findings fixed and retested before launch.',
    icon: 'target',
    build: ['Functional QA', 'Performance', 'Acceptance testing'],
    secure: ['Penetration testing', 'Remediation', 'Retesting'],
  },
  {
    id: 'launch-monitoring',
    title: 'Launch & Monitoring',
    summary: 'A documented production release, with monitoring and incident response ready when it goes live.',
    icon: 'activity',
    build: ['Production release', 'Documentation', 'Handover'],
    secure: ['Monitoring', 'Patching', 'Alerting', 'Incident response'],
  },
];
