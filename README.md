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

- Replace the stats in `STATS` (`src/data/site.ts`) with verified client metrics. They are placeholders.
- Confirm the certification list against verified team credentials.
- Set real `email`, `consultUrl` (scheduling link), `whatsappUrl`, `linkedinUrl`.
- Replace `https://www.example.com/` canonical / OG / JSON-LD URLs in `index.html`.
- Link Privacy, Terms and Blog.
