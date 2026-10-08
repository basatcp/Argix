# Corelayer: Secure Software, AI & Cybersecurity Website

A responsive B2B marketing site for a company that builds software, AI and cloud systems and secures them. The visual identity centres on the **3D Hexagonal Cyber Core**, a real-time WebGL object that opens in stages in the hero and returns as a simplified SVG core in later sections.

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
npm run build     # typecheck + production build to dist/
npm run preview   # serve the production build
```

## Structure

```
src/
  three/CyberCore.ts      WebGL scene, GSAP opening timeline, idle loop
  three/icons.ts          Canvas-drawn line icons for orbiting modules
  components/
    CyberCoreCanvas.tsx   Lazy mount, WebGL detection, static fallback
    MiniCore.tsx          Simplified SVG core (pillars, process, CTA)
    Hero.tsx, Header.tsx, Icons.tsx, Logo.tsx, ui.tsx
    sections/             Offer, Trust, Process, Security, Closing
  data/site.ts            All copy, links and placeholders
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
- **Background**:
  - Two 2D canvases: a static hex grid and traces, plus pulses, nodes and particles at ~30 fps. It pauses off-screen and in hidden tabs.
  - Tablets and phones get fewer traces and particles.
  - The cursor-reactive glow (max 16 px) is limited to desktop with a mouse.
  - With reduced motion it is static.

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

## Before launch (TODOs)

- Connect the consultation form to your CRM or API (see *Connecting a CRM or API*).
- Replace the stats in `STATS` (`src/data/site.ts`) with verified client metrics. They are placeholders.
- Confirm the certification list against verified team credentials.
- Set real `email`, `whatsappUrl`, `linkedinUrl`.
- Replace `https://www.example.com/` canonical / OG / JSON-LD URLs in `index.html`.
- Link Privacy, Terms and Blog.
