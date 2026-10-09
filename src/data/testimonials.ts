/**
 * Testimonials for the homepage "Client Perspective" section.
 *
 * TODO: Replace placeholder testimonial data with verified client testimonials before production.
 *
 * PLACEHOLDER CONTENT. These entries are layout samples, not real endorsements:
 * no real client, person, company, job title or result is named or implied.
 * - Use only quotes a client has approved in writing, with the name, role and
 *   company they agreed to show.
 * - Set `placeholder: false` on each verified entry. While any entry is a
 *   placeholder, the section shows a visible note saying so.
 * - Do not add logos, star ratings or scores unless the client has approved them.
 */

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  /** Optional sector tag. */
  industry?: string;
  /** Optional engagement type, e.g. "Development + Security". */
  projectType?: string;
  /** True for sample content that must be replaced before launch. */
  placeholder: boolean;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'The team helped us simplify a complex development and security challenge while keeping the process clear from architecture through launch.',
    name: 'Client Name',
    role: 'Role',
    company: 'Company',
    industry: 'SaaS',
    projectType: 'Development + Security',
    placeholder: true,
  },
  {
    quote: 'Findings came with clear evidence and practical fixes, and the retest confirmed what had actually been resolved.',
    name: 'Client Name',
    role: 'Role',
    company: 'Company',
    industry: 'Fintech',
    projectType: 'Penetration Testing',
    placeholder: true,
  },
  {
    quote: 'Compliance readiness was tied to how our platform is actually built and run, so the work made sense to engineering and leadership.',
    name: 'Client Name',
    role: 'Role',
    company: 'Company',
    industry: 'Healthcare',
    projectType: 'Compliance Readiness',
    placeholder: true,
  },
];
