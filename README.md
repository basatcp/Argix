# Corelayer: Secure Software, AI & Cybersecurity Website

A responsive B2B marketing site for a company that builds software, AI and cloud systems and secures them: a homepage plus Services, Industries, Process, Security and FAQ pages. The visual identity centres on the **3D Hexagonal Cyber Core**, a real-time WebGL object that opens in stages in the homepage hero and returns as a simplified SVG core in later sections.

> "Corelayer" is a placeholder brand name. Rename it in `src/data/site.ts`, `index.html` and `public/favicon.svg`.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS 3
- Three.js (plain, code-split, lazy-loaded) for the hero core
- GSAP + ScrollTrigger for the opening timeline, scroll reveals, counters and the process timeline

## Scripts

```bash
npm install
npm run dev       # local dev server
npm run build     # typecheck + production build to dist/ (one HTML file per page)
npm run preview   # serve the production build
```

## Pages and routing

| Route | Page |
| --- | --- |
| `/` | Homepage (hero with the Cyber Core, all summary sections, testimonials, consultation form) |
| `/services` | Build & Run and Secure & Comply services, integrated approach |
| `/industries` | Healthcare, Enterprise & SaaS, E-Commerce & Retail, Startups & MVPs, Fintech |
| `/process` | Six-stage process with a scroll-driven timeline |
| `/security` | Penetration testing, GRC & compliance readiness, vCISO, SOC monitoring, incident response, secure development |
| `/faq` | Grouped questions |

- **Router:** `src/router.tsx` is a small built-in router (no dependency). Pages use plain links (`<a href="/security#vciso">`); one click handler turns same-origin links into in-app navigation with smooth in-page scrolling, back/forward scroll restoration, and title/meta updates. The route table (titles, descriptions) is `src/data/routes.ts`.
- **Layout:** `src/components/layout/PageView.tsx` renders the current page plus the footer, with a short page transition (fade out 160 ms, then fade in with a 12 px rise over 340 ms; none with reduced motion). It also moves focus to the new page's heading. The header and the consultation popup are shared by every page.
- **Shared page parts** (`src/components/page/`): `PageHero` (inner-page hero with breadcrumb and a page-specific diagram), `PageSection` (section rhythm and tones), `FinalCTA`, `ConsultButton` (opens the popup), `Breadcrumbs`, and `Diagram` (kit for the technical diagrams, built on the background system). `src/components/FAQAccordion.tsx` is shared by the homepage FAQ and the FAQ page.
- **Static hosting:** the build writes `dist/<route>/index.html` for every page, each with its own title, description, canonical URL and structured data (breadcrumbs; FAQPage on `/faq`). It also writes `404.html` (noindex; the app shows a not-found page), `sitemap.xml` and `robots.txt`. Any static host works without rewrite rules. Netlify, Vercel, Cloudflare Pages, GitHub Pages and S3 all serve `/services` from `services/index.html`, and nginx does with `try_files $uri $uri/ /index.html`. The domain comes from `SITE_URL` in `src/data/routes.ts`.

## Structure

```
src/
  three/CyberCore.ts      WebGL scene, GSAP opening timeline, idle loop
  three/icons.ts          Canvas-drawn line icons for orbiting modules
  router.tsx              Client-side routing, link handling, page meta
  pages/                  HomePage, ServicesPage, IndustriesPage, ProcessPage, SecurityPage, FaqPage, NotFoundPage
  components/
    CyberCoreCanvas.tsx   Lazy mount, WebGL detection, static fallback
    MiniCore.tsx          Simplified SVG core (pillars, process, CTA)
    Hero.tsx, Header.tsx, Icons.tsx, Logo.tsx, ui.tsx, FAQAccordion.tsx
    layout/PageView.tsx   Routed page + footer, page transitions
    page/                 PageHero, PageSection, FinalCTA, ConsultButton, Breadcrumbs, Diagram kit
    sections/             Homepage sections: Offer, Trust, Process, Security, Closing
    testimonials/         Homepage testimonials
    services/, industries/, process/, security/, faq/   Inner-page components
    backgrounds/          Section background system (see below)
    consultation/         Popup, form, homepage section
  data/                   site.ts (homepage copy), routes.ts, one file per inner page, testimonials.ts
  hooks/                  Reduced-motion + scroll reveal
public/
  cyber-core.webp/.png    Static render of the core (no-WebGL fallback)
  og-image.png            Open Graph image
```

## Consultation requests (lead generation)

Every "Book a Free Consultation" button (header, mobile menu, hero) opens one shared popup. The homepage section `#contact` holds the same form in a larger layout. Both use a single form component and one validation and submission path.

```
src/consultation/
  schema.ts              Fields, options, validation rules
  useConsultationForm.ts Shared state, validation timing, submit, analytics, draft memory
  submit.ts              submitConsultationForm(): provider payloads, timeout, errors
  config.ts              Endpoint configuration (from environment variables)
  analytics.ts           track(): dataLayer / gtag / Plausible + a DOM event
src/components/consultation/
  ConsultationForm.tsx              <ConsultationForm variant="modal" | "section" />
  ConsultationModal.tsx             ConsultationProvider, useConsultation(), the dialog
  ConsultationSection.tsx           Homepage section before the footer
  AnimatedTechnicalBackground.tsx   Canvas backdrop for the section
```

### Connecting a CRM or API

Copy `.env.example` to `.env.local` and set:

| Variable | Use |
| --- | --- |
| `VITE_CONSULTATION_PROVIDER` | `custom` (default), `formspree` or `hubspot` |
| `VITE_CONSULTATION_ENDPOINT` | `custom`: your API URL (POST JSON). `formspree`: `https://formspree.io/f/<id>` |
| `VITE_HUBSPOT_PORTAL_ID`, `VITE_HUBSPOT_FORM_ID` | `hubspot`: public form identifiers. Field names are mapped in `submit.ts` |
| `VITE_CONSULTATION_DEMO` | `true` only for design previews: shows success without sending anything |

Everything in these variables ends up in the public bundle, so never put API keys or tokens there. Salesforce, Zoho, HubSpot private apps and email notifications need a secret, so they belong behind your own endpoint (`custom`). That endpoint receives the JSON built in `customPayload()`; a `honeypot` field should be discarded if it is filled.

With no endpoint configured, the form says that online booking isn't connected yet and keeps the visitor's input; it never pretends a request was sent. A failed request (network, timeout, non-2xx) shows an inline error and keeps everything entered for a retry.

### Behaviour

- **Validation**: required name, work email (format), service and requirements (at least 20 characters, whitespace ignored). The phone number is checked only when given. Errors appear under the field and are linked with `aria-describedby`. On submit, focus moves to the first invalid field.
- **Submission**: the button shows a spinner and "Sending...", and duplicate submits are blocked. On success the form is replaced by a confirmation, and focus moves to its heading.
- **Popup**:
  - Opens centred over a blurred, dimmed page with page scroll locked, and the rest of the page is made `inert`.
  - Focus is trapped inside the dialog. It closes with the close button, a click outside, or Escape, and focus returns to the button that opened it.
  - An unsent draft survives an accidental close.
- **Analytics** (optional, nothing to configure): `consultation_modal_open`, `consultation_modal_close`, `consultation_form_start`, `consultation_form_submit`, `consultation_form_success` and `consultation_form_error`, with `location`, `source`, `service` and `reason` where they apply. Each goes to GTM's `dataLayer`, `gtag` and Plausible when present, and is always dispatched as a `consultation:analytics` DOM event.
- **Background**: the shared background system's `consult` variant (see [Background motion system](#background-motion-system)).
  - Routes converge on the form card, with pulses, inward-drifting nodes, slow expanding rings and a few particles. It pauses off-screen and in hidden tabs.
  - Tablets and phones get fewer traces and particles.
  - The cursor-reactive glow (max 16 px) is limited to desktop with a mouse.
  - With reduced motion it is static.

## Background motion system

All section backgrounds come from one system in `src/components/backgrounds/`. Each section renders `<SectionBackground variant="…" />` as a direct child (the section has `relative isolate`); the background sits behind the content, never takes pointer events, and clips its own layers.

| Section | Variant | Intensity | Elements |
| --- | --- | --- | --- |
| Hero | `hero` | High | circuit routes converging on the core, data pulses, nodes, breathing glow (pointer), particles, parallax. Mounts after the core's first frame |
| Frameworks strip | `strip` | Low | faint grid, data line with an occasional pulse |
| Build / Run / Secure | `pillars` | Medium | modular grid, left-to-right data flows with module nodes feeding into security rings (scan arc, pulse) |
| Services | `network` | Medium | hex grid, routed traces drawing in, nodes, pulses, glow (pointer) |
| Metrics | `metrics` | Low | drifting glow that rises on entry, a few rising particles; underline under each number |
| Industries | `industries` + `CardMotif` | Low-medium | quiet section glow; each card has its own motif (network, modular grid, transaction path, expanding network, secured connection), more visible on hover |
| Process | `process` | Medium-high | blueprint grid and construction diagram (parallax), a circuit bus whose lit length and step taps follow scroll progress |
| Security operations | `monitor` | Medium | node network with rare event blips, scanning rings, centre glow |
| Secure coding | `split` | Medium | data flows on the build side converge with rings and shield geometry on the secure side; a pulse hands off every few seconds |
| Certifications | `blueprint` | Very low | blueprint grid, sparse diagonals, light sweep every ~13 s |
| FAQ | `minimal` | Minimal | oversized hexagon outlines, very slow glow drift |
| Consultation | `consult` | Medium | hex grid, routes converging on the form, nodes drifting inward, pulses, slow expanding rings, glow (pointer), particles |
| Testimonials | `testimonials` | Low-medium | faint network paths and nodes over a low hex pattern, soft light, one slow horizontal data pulse; node activity rises slightly while a card is hovered |
| Footer | `footer` | Almost static | faint hex pattern, glow, 3 slow particles |

Inner pages use the same primitives (`pageVariants.tsx`), all lighter than the homepage hero:

| Where | Variant | Intensity | Elements |
| --- | --- | --- | --- |
| Inner-page heroes | `page-build`, `page-network`, `page-process`, `page-secure`, `page-calm` | Medium (FAQ calm) | routes from the edges converge on the page's diagram, plus one accent per page: build flows and modules, a honeycomb with routed links, a timeline trace with a walking pulse, rings around the diagram over a node map, or oversized hexagons |
| Development content | `build` | Medium | modular grid, groups of left-to-right flows with module nodes, pulses on some lanes |
| Security content | `secure` | Medium | hexagonal field, concentric rings with a scanning arc, node map with rare verification pulses |
| Process timeline | `timeline` | Low (the timeline carries the motion) | low hex pattern, deep grid with parallax, drifting light, a few particles |
| Closing call to action | `cta` | Medium | routes from both sides and below converge on the panel, nodes drifting inward, glow, inward particles |

Inner pages also reuse `network`, `monitor`, `split`, `industries`, `blueprint` and `minimal`. Their diagrams (`src/components/page/Diagram.tsx`) use the same strokes, nodes and pulses, draw in once, pause off-screen and are static with reduced motion.

Primitives: `TechnicalGrid`, `HexGrid`, `CircuitLines`, `DataPulse`, `NetworkNodes`, `SecurityRings`, `RadialGlow`, `LightSweep`, `AmbientParticles`. Geometry is generated per section size from a seed (`geometry.ts`), so lines stay 1 px crisp and each section always looks the same.

Performance:
- **Shared infrastructure** (`motion.ts`): one IntersectionObserver, one animation-frame loop that runs only while a visible layer needs it, and one scroll and pointer listener.
- **Animation methods:** grids are CSS gradients or a tiled SVG; pulses are animated SVG dash offsets; glows, rings and sweeps animate only transform and opacity. The only canvas is the particle layer (≤ 30 particles desktop, ≤ 15 tablet, ≤ 8 mobile, at ~30 fps).
- **Off-screen:** backgrounds get `data-active="false"`, which pauses every CSS animation in them, and their canvas stops drawing.
- **Device tiers:** phones get fewer traces and pulses, no parallax, no pointer effects and almost no particles; tablets get reduced parallax.
- **Reduced motion:** static grids and lines only. There are no pulses, particles, parallax, pointer effects or looping animations.

## Cyber Core metaphor

| Layer | Meaning |
| --- | --- |
| Central energy cube | Development |
| Inner rotating rings | AI + Cloud |
| Rims, back plate, circuits | Infrastructure |
| Six glass-metal outer panels | Cybersecurity (outer shield) |
| Orbiting hex modules | Monitoring + Compliance (plus the other service lines) |

Opening sequence (`src/three/CyberCore.ts`): closed (0–1.2s) → activation (1.2–2.5s) → panels open 12% outward (2.5–4s) → inner reveal (4–5.5s) → modules appear (5.5–7s) → idle loop.

## Performance and accessibility

- The three.js chunk is loaded with dynamic `import()`, so it doesn't block first paint.
- Rendering pauses when the tab is hidden or the hero is off-screen.
- Mobile / low-core devices use fewer particles and circuits, lower DPR and no MSAA. There is no post-processing; glow comes from additive sprites.
- `prefers-reduced-motion` renders the final state as one static frame and disables scroll reveals.
- Without WebGL a static render (`public/cyber-core.webp`) with alt text is shown.
- Skip link, visible focus styles, accessible accordion (`aria-expanded` / `aria-controls` / region), semantic section landmarks with headings.

## Testimonials

The homepage "Client Perspective" section (`src/components/testimonials/`) reads `src/data/testimonials.ts`. The entries there are **placeholders** ("Client Name", "Role", "Company"), not endorsements. While any entry has `placeholder: true`, the section shows a visible note saying the testimonials are samples. Before launch, replace them with quotes clients have approved in writing and set `placeholder: false`. Don't add logos or ratings unless they are approved too.

## Before launch (TODOs)

- Replace the placeholder testimonials in `src/data/testimonials.ts` with verified, approved client testimonials.
- Connect the consultation form to your CRM or API (see *Connecting a CRM or API*).
- Replace the stats in `STATS` (`src/data/site.ts`) with verified client metrics. They are placeholders.
- Confirm the certification list against verified team credentials.
- Set real `email`, `whatsappUrl`, `linkedinUrl`.
- Replace `https://www.example.com` in `index.html` and `SITE_URL` in `src/data/routes.ts` (canonical, OG, JSON-LD, sitemap).
- Link Privacy, Terms and Blog.
