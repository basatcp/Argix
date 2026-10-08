# Corelayer: Secure Software, AI & Cybersecurity Website

A responsive B2B marketing site for a company that builds software, AI and cloud systems and secures them. The visual identity centres on the **Hexagonal Cyber Core**. In the hero it plays as an opening sequence built from approved keyframe images, and it returns as a simplified SVG core in later sections.

> "Corelayer" is a placeholder brand name. Rename it in `src/data/site.ts`, `index.html` and `public/favicon.svg`.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS 3
- GSAP + ScrollTrigger for scroll reveals, counters and the process timeline
- A 2D canvas keyframe player for the hero (no WebGL in production)
- Dev only: `sharp` (frame normalizer), Three.js + Playwright (placeholder keyframe renderer)

## Scripts

```bash
npm install
npm run dev            # local dev server
npm run build          # typecheck + production build to dist/
npm run preview        # serve the production build
npm run frames         # normalise hero keyframes (hero-frames/source -> public/hero/frames)
npm run frames:render  # re-render the placeholder keyframes from the 3D model (needs Playwright)
```

## Hero animation

The hero is driven by eight keyframes, in this order:

| # | Keyframe | Arrives at |
| --- | --- | --- |
| 1 | Closed hexagonal core | 0.0 s (held to 0.8 s) |
| 2 | Activation, stronger centre glow | 1.8 s |
| 3 | Outer panels begin opening | 3.2 s |
| 4 | Internal mechanical structure visible | 4.5 s |
| 5 | Core fully open | 5.7 s |
| 6 | Service nodes appear | 6.25 s |
| 7 | Orbit and modules active | 6.8 s |
| 8 | Final stabilised state | 8.0 s, then idle loop |

### Using approved frames

1. Put the frames in `hero-frames/source` (PNG, JPG or WebP; transparent or on a solid dark background; any size).
2. List them in order in `hero-frames/frames.config.json` (`file`, arrival time `at`, `glow`).
3. Run `npm run frames`. The normalizer:
   - keys out a solid background so the object sits on the page;
   - aligns every frame to the closed frame. Translation is automatic, from the shell's centroid, because the shell opens symmetrically. Scale is set per frame with `"nudge": { "scale": 1.02, "x": 0, "y": 0 }`, since an opening shell can't be told apart from a zoom;
   - crops every frame identically around the core and feathers the edges;
   - measures how each concentric band (core, inner nodes, rings, shell, orbit) moves between consecutive frames;
   - writes WebP frames at 1200 px and 640 px plus `src/hero/frames.generated.json`;
   - writes QA images to `hero-frames/preview`: a contact sheet, plus one onion skin per transition (red is the previous frame, cyan the next; grey means aligned). Adjust `nudge` until the static parts are grey.

The current files in `hero-frames/source` are **placeholders** rendered from the site's original 3D Cyber Core (`tools/keyframes`). `guides.json` belongs to those renders only (it is matched by file hash) and is ignored automatically when other frames are supplied.

### How the player avoids a slideshow look

`src/hero/sequence.ts` never simply dissolves one image into the next. Each transition splits both frames into the concentric bands and scales every band of the outgoing frame towards where the incoming frame has it, while the incoming frame starts from the outgoing geometry, using the per-band scales measured by the normalizer. Both images agree on geometry while they blend, so the panels read as sliding open. On top of that:

- centre-out reveals for activation and module arrival;
- glow interpolation and an energy swell;
- a small opposing rotation of the two ring bands during the internal reveal;
- a camera push-in that settles.

After 8 s only an idle loop runs: about 1.2% float, a slow ±0.35° roll, a faint core pulse, two light glints on the orbit and a few drifting particles. The loop is capped at about 30 fps.

### Performance and loading

- The first three frames for the visitor's breakpoint are preloaded (`vite.config.ts` injects the hints). The first frame shows instantly as a plain image, and the canvas takes over with a pixel-identical frame once frames 1–3 have decoded. The rest load after first paint, and the clock waits at a keyframe if the next frame is late.
- The camera moves via a CSS transform on the canvas, so canvas drawing stays 1:1 copies. Band work is clipped to each band's box, with cached masks.
- The loop pauses when the hero is off-screen or the tab is hidden.
- Mobile uses the 640 px frames and drops ring rotation, glints and particles.
- The final frame is shown statically for `prefers-reduced-motion` (only that frame is downloaded), data-saver mode, a frame that fails to load, or a device whose median frame time over the first ~30 intro frames exceeds 50 ms.
- `?hero=debug` disables the performance fallback and exposes `window.__hero.seek(t)` for frame-accurate QA captures.

## Structure

```
src/
  hero/sequence.ts          Keyframe player (timeline, band morph, idle loop, loading, fallbacks)
  hero/frames.generated.json  Generated by `npm run frames`
  components/
    HeroSequence.tsx        Poster, canvas and static fallback
    MiniCore.tsx            Simplified SVG core (pillars, process, CTA)
    Hero.tsx, Header.tsx, Icons.tsx, Logo.tsx, ui.tsx
    sections/               Offer, Trust, Process, Security, Closing
  data/site.ts              All copy, links and placeholders
  hooks/                    Reduced motion + scroll reveal
hero-frames/
  frames.config.json        Order, timing, glow, bands, nudges
  source/                   Keyframe images (placeholders until approved frames arrive)
scripts/
  normalize-frames.mjs      Frame normalizer
  render-keyframes.mjs      Placeholder keyframe renderer
tools/keyframes/            Dev-only Three.js Cyber Core used to render placeholders
public/
  hero/frames/{lg,sm}/      Normalised keyframes
  og-image.png              Open Graph image
```

## Cyber Core metaphor

| Layer | Meaning |
| --- | --- |
| Central energy cube | Development |
| Inner rotating rings | AI + Cloud |
| Rims, back plate, circuits | Infrastructure |
| Six glass-metal outer panels | Cybersecurity (outer shield) |
| Orbiting hex modules | Monitoring + Compliance (plus the other service lines) |

## Accessibility

- Skip link, visible focus styles, accessible accordion (`aria-expanded` / `aria-controls` / region), semantic section landmarks with headings.
- The hero visual is one labelled image (`role="img"`). The canvas and the frame images are hidden from assistive technology.

## Before launch (TODOs)

- Replace the stats in `STATS` (`src/data/site.ts`) with verified client metrics. They are placeholders.
- Confirm the certification list against verified team credentials.
- Set real `email`, `consultUrl` (scheduling link), `whatsappUrl`, `linkedinUrl`.
- Replace `https://www.example.com/` canonical / OG / JSON-LD URLs in `index.html`.
- Replace the placeholder hero keyframes with the approved frames (see *Using approved frames*).
- Link Privacy, Terms and Blog.
