import type { SVGProps } from 'react';

/** Minimal stroke icon set (24x24, 1.6 stroke) so the bundle stays free of icon libraries. */
const paths = {
  code: <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14" />,
  layout: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M9 9v11" />
    </>
  ),
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M9.5 7V4M14.5 7V4M9.5 20v-3M14.5 20v-3M7 9.5H4M7 14.5H4M20 9.5h-3M20 14.5h-3" />
      <circle cx="12" cy="12" r="1.6" />
    </>
  ),
  cloud: <path d="M7 18a4 4 0 0 1-1.2-7.8 5 5 0 0 1 9.6-1.4A4.5 4.5 0 0 1 18 18H7Z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </>
  ),
  clipboard: (
    <>
      <path d="M9 4h6v3H9z" />
      <path d="M15 5.5h2.5A1.5 1.5 0 0 1 19 7v12.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5V7a1.5 1.5 0 0 1 1.5-1.5H9" />
      <path d="m9 14 2 2 4-4.5" />
    </>
  ),
  activity: <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />,
  userShield: (
    <>
      <path d="M12 3 19 6v5.5c0 4.4-3 7.9-7 9.5-4-1.6-7-5.1-7-9.5V6l7-3Z" />
      <circle cx="12" cy="10" r="2.2" />
      <path d="M8.5 16a4 4 0 0 1 7 0" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 19 6v5.5c0 4.4-3 7.9-7 9.5-4-1.6-7-5.1-7-9.5V6l7-3Z" />
      <path d="m9 12 2.2 2.2L15.2 10" />
    </>
  ),
  heartPulse: (
    <>
      <path d="M20.5 9.5c0 5-8.5 10.5-8.5 10.5S3.5 14.5 3.5 9.5A4.5 4.5 0 0 1 12 7.2a4.5 4.5 0 0 1 8.5 2.3Z" />
      <path d="M6.5 12h3l1.5-2.5 2 5 1.5-2.5h3" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V5.5A1.5 1.5 0 0 1 5.5 4h8A1.5 1.5 0 0 1 15 5.5V21M15 10h3.5a1.5 1.5 0 0 1 1.5 1.5V21M2.5 21h19" />
      <path d="M8 8h3M8 12h3M8 16h3" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4h2.5l2.2 10.5a1.5 1.5 0 0 0 1.5 1.2h8.3a1.5 1.5 0 0 0 1.4-1.1L20.5 8H6.3" />
      <circle cx="10" cy="19.5" r="1.3" />
      <circle cx="17" cy="19.5" r="1.3" />
    </>
  ),
  rocket: (
    <>
      <path d="M14.5 4.5c2.5-1 4.5-1 5-.5s.5 2.5-.5 5l-6 6-4-4 5.5-6.5Z" />
      <path d="M9 11 5.5 10.5 3.5 13l4 1M13 15l.5 3.5-2.5 2-1-4" />
      <circle cx="15.5" cy="8.5" r="1.3" />
    </>
  ),
  bank: (
    <>
      <path d="M3 9.5 12 4l9 5.5M4.5 20.5h15M3 9.5h18" />
      <path d="M6 12.5v5M10 12.5v5M14 12.5v5M18 12.5v5" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12.5 9 5 9-5M3 17l9 5 9-5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0M15.5 5.8a3 3 0 0 1 0 5.4M17.5 14.5a5.5 5.5 0 0 1 3 5" />
    </>
  ),
  radar: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 12 18 6M12 7.5a4.5 4.5 0 1 0 4.5 4.5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  mobile: (
    <>
      <rect x="6.5" y="3" width="11" height="18" rx="2.5" />
      <path d="M10.5 18h3" />
    </>
  ),
  plug: <path d="M9 3v4M15 3v4M7 7h10v3a5 5 0 0 1-10 0V7ZM12 15v6" />,
  server: (
    <>
      <rect x="4" y="4" width="16" height="7" rx="1.5" />
      <rect x="4" y="13" width="16" height="7" rx="1.5" />
      <path d="M8 7.5h.01M8 16.5h.01" />
    </>
  ),
  git: (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="9" r="2" />
      <path d="M6 8v8M16 9.5c-4 0-6.5 1.5-8.6 6.8" />
    </>
  ),
  fileText: (
    <>
      <path d="M14 3H7a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V7.5L14 3Z" />
      <path d="M14 3v4.5h4.5M9 12.5h6M9 16h6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10.5V16M8 7.5v.01M12 16v-5.5M12 13a2.5 2.5 0 0 1 5 0v3" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M4 20l1.2-3.8A8.5 8.5 0 1 1 8 19l-4 1Z" />
      <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .9a4.5 4.5 0 0 1-2.3-2.3l.9-1-1-2L9 8.5Z" />
    </>
  ),
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = 'h-5 w-5', ...rest }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
