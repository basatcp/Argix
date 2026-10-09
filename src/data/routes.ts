/**
 * The site's pages. Used by the client-side router (navigation, document
 * title and meta) and at build time to write one HTML file per route with the
 * right <title>, description and canonical URL (vite.config.ts), so every page
 * can be opened directly on any static host.
 *
 * Keep this file free of browser and React imports: vite.config.ts imports it.
 */

export type PageKey = 'home' | 'services' | 'industries' | 'process' | 'security' | 'faq';

export interface RouteMeta {
  key: PageKey;
  path: string;
  /** Navigation and breadcrumb label. */
  label: string;
  title: string;
  description: string;
}

export const SITE_NAME = 'Corelayer';
// TODO: Replace with the production domain (also in index.html).
export const SITE_URL = 'https://www.example.com';

export const ROUTES: RouteMeta[] = [
  {
    key: 'home',
    path: '/',
    label: 'Home',
    title: 'Custom Software, AI & Cybersecurity Services | Corelayer',
    description: 'Secure software development, AI, cloud, penetration testing, compliance and cybersecurity services for growing companies.',
  },
  {
    key: 'services',
    path: '/services',
    label: 'Services',
    title: 'Software Development, Cloud & Security Services | Corelayer',
    description:
      'Custom software, web and mobile apps, APIs, AI, DevOps and cloud, plus penetration testing, compliance, SOC monitoring, vCISO and incident response.',
  },
  {
    key: 'industries',
    path: '/industries',
    label: 'Industries',
    title: 'Industries: Healthcare, SaaS, E-Commerce, Startups & Fintech | Corelayer',
    description:
      'We help teams build secure, scalable digital products in industries where reliability, data protection, and compliance matter.',
  },
  {
    key: 'process',
    path: '/process',
    label: 'Process',
    title: 'Our Process: Security at Every Stage of Development | Corelayer',
    description:
      'From discovery through launch and monitoring, security is integrated into the way we design, build, test, and operate technology.',
  },
  {
    key: 'security',
    path: '/security',
    label: 'Security',
    title: 'Cybersecurity, Penetration Testing & Compliance Readiness | Corelayer',
    description:
      'Cybersecurity, penetration testing, compliance, monitoring, and security leadership designed to reduce risk across your technology environment.',
  },
  {
    key: 'faq',
    path: '/faq',
    label: 'FAQ',
    title: 'FAQ: Development, Security & Compliance Questions | Corelayer',
    description: 'Answers to common questions about development, cybersecurity, compliance, project delivery, and ongoing support.',
  },
];

export const NOT_FOUND_META = {
  title: 'Page Not Found | Corelayer',
  description: 'The page you were looking for does not exist.',
};

export function routeByPath(path: string): RouteMeta | undefined {
  return ROUTES.find((r) => r.path === path);
}

export function routeByKey(key: PageKey): RouteMeta {
  return ROUTES.find((r) => r.key === key)!;
}
