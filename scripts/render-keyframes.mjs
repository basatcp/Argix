#!/usr/bin/env node
/**
 * Renders the eight placeholder keyframes of the Cyber Core from the dev-only
 * three.js scene (tools/keyframes) into hero-frames/source, plus the guides
 * the frame player uses (core centre, ring ellipses, orbit path).
 *
 * Only needed while no approved frames have been supplied. Supplied frames
 * replace the files in hero-frames/source; then run `npm run frames`.
 *
 * Usage: npm run frames:render  (requires Playwright + Chromium)
 */
import { createServer } from 'vite';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Playwright is required: npm i -D playwright (or set NODE_PATH to a global install).');
  process.exit(1);
}

const OUT = path.resolve('hero-frames/source');
// Radii (world units) of the inner-ring plane that the player uses as band guides.
const RING_RADII = [0.5, 0.72, 1.02, 1.16, 1.34];

const server = await createServer({ server: { port: 5199, strictPort: true }, logLevel: 'error' });
await server.listen();
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
try {
  const page = await browser.newPage({ viewport: { width: 800, height: 800 }, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await page.goto('http://localhost:5199/tools/keyframes/index.html');
  await page.waitForFunction(() => typeof window.renderKeyframes === 'function');
  const { frames, guides } = await page.evaluate((r) => window.renderKeyframes(r), RING_RADII);
  await mkdir(OUT, { recursive: true });
  const hashes = {};
  for (const f of frames) {
    const png = Buffer.from(f.png.split(',')[1], 'base64');
    await writeFile(path.join(OUT, `${f.id}.png`), png);
    hashes[`${f.id}.png`] = createHash('sha1').update(png).digest('hex');
    console.log('wrote', `${f.id}.png`);
  }
  // Hashes tie the guides to these exact images; the normalizer ignores them for any other frames.
  await writeFile(path.join(OUT, 'guides.json'), JSON.stringify({ hashes, ringRadii: RING_RADII, ...guides }, null, 2) + '\n');
  console.log('wrote guides.json');
} finally {
  await browser.close();
  await server.close();
}
