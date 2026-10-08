#!/usr/bin/env node
/**
 * Normalises the hero keyframes so they can be animated as one object.
 *
 * For every frame listed in hero-frames/frames.config.json:
 *   1. decode, pad to square and resample to a common working size
 *   2. key out a solid background (opaque frames only) so the object sits on the page
 *   3. align it to the closed frame: translation from the shell centroid (the shell
 *      opens symmetrically, so its centroid is stable); scale from per-frame nudges
 * Then, across the set:
 *   4. find the core centre and the closed core radius
 *   5. crop every frame identically around the core and feather the edges
 *   6. estimate, for each transition, how each radial band of the object scales
 *      (panels sliding out, rings growing) so the player can morph between frames
 *   7. write WebP frames (lg + sm) to public/hero/frames and a manifest to
 *      src/hero/frames.generated.json
 *   8. write QA images to hero-frames/preview: a contact sheet and one onion skin
 *      per transition (red = previous frame, cyan = next; grey = aligned)
 *
 * Usage: npm run frames
 */
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');
const CONFIG_PATH = path.resolve(process.env.FRAMES_CONFIG ?? 'hero-frames/frames.config.json');
// Overridable for testing against other frame sets without touching the real output.
const SOURCE_DIR = path.resolve(process.env.FRAMES_SOURCE ?? 'hero-frames/source');
const OUT_DIR = path.resolve(process.env.FRAMES_OUT ?? 'public/hero/frames');
const MANIFEST_PATH = path.resolve(process.env.FRAMES_MANIFEST ?? 'src/hero/frames.generated.json');
const PREVIEW_DIR = path.resolve(process.env.FRAMES_PREVIEW ?? 'hero-frames/preview');
const PUBLIC_PREFIX = '/hero/frames';

const WORK = 1600; // working resolution (square)
const BAND_RES = 384; // band-scale estimation resolution

const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));

/**
 * guides.json is written by the keyframe renderer and describes exactly the
 * frames it rendered (by hash). It is ignored as soon as any source differs,
 * so supplied frames never inherit guides that belong to other images.
 */
async function loadGuides() {
  const file = path.join(SOURCE_DIR, 'guides.json');
  if (!existsSync(file)) return null;
  const g = JSON.parse(await readFile(file, 'utf8'));
  for (const f of config.frames) {
    const hash = createHash('sha1').update(await readFile(path.join(SOURCE_DIR, f.file))).digest('hex');
    if (g.hashes?.[f.file] !== hash) {
      console.log(`guides.json does not describe ${f.file}; ignoring it.`);
      return null;
    }
  }
  return g;
}
const guides = await loadGuides();

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const log = (...a) => console.log('  ', ...a);

// ---------------------------------------------------------------- decoding

/** Decode, pad to a square and resample to WORK x WORK straight-alpha RGBA. */
async function load(file) {
  const src = sharp(path.join(SOURCE_DIR, file)).ensureAlpha();
  const meta = await src.metadata();
  const raw = await src.raw().toBuffer({ resolveWithObject: true });
  const opaque = isOpaque(raw.data);
  const keyed = opaque && config.background !== 'keep' ? keyBackground(raw.data, raw.info.width, raw.info.height) : raw.data;
  const { data } = await sharp(keyed, { raw: { width: raw.info.width, height: raw.info.height, channels: 4 } })
    .resize(WORK, WORK, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'lanczos3' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { rgba: new Uint8ClampedArray(data.buffer, data.byteOffset, data.length), opaque, width: meta.width, height: meta.height };
}

function isOpaque(data) {
  let solid = 0;
  for (let i = 3; i < data.length; i += 4 * 7) if (data[i] > 250) solid++;
  return solid / (data.length / (4 * 7)) > 0.995;
}

/** Turn a solid background into transparency, un-mixing the background colour from soft edges and glows. */
function keyBackground(data, w, h) {
  const samples = [[], [], []];
  const strip = Math.max(2, Math.round(Math.min(w, h) * 0.02));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x >= strip && x < w - strip && y >= strip && y < h - strip) continue;
      if ((x + y) % 3) continue;
      const i = (y * w + x) * 4;
      samples[0].push(data[i]);
      samples[1].push(data[i + 1]);
      samples[2].push(data[i + 2]);
    }
  }
  const bg = samples.map((s) => s.sort((a, b) => a - b)[s.length >> 1]);
  const [t0, t1] = [4, 48];
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const d = Math.max(Math.abs(data[i] - bg[0]), Math.abs(data[i + 1] - bg[1]), Math.abs(data[i + 2] - bg[2]));
    const a = clamp((d - t0) / (t1 - t0), 0, 1);
    if (a <= 0) continue;
    for (let c = 0; c < 3; c++) out[i + c] = clamp(Math.round(bg[c] + (data[i + c] - bg[c]) / a), 0, 255);
    out[i + 3] = Math.round(a * 255);
  }
  log(`keyed background rgb(${bg.join(', ')})`);
  return out;
}

// ---------------------------------------------------------------- resampling

/** Premultiplied box-downscale of a square RGBA image to luminance x alpha. */
function lumaMap(rgba, size, out) {
  const f = size / out;
  const map = new Float32Array(out * out);
  for (let y = 0; y < out; y++) {
    for (let x = 0; x < out; x++) {
      let acc = 0;
      const y0 = Math.floor(y * f);
      const x0 = Math.floor(x * f);
      const y1 = Math.floor((y + 1) * f);
      const x1 = Math.floor((x + 1) * f);
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = (yy * size + xx) * 4;
          acc += ((0.2126 * rgba[i] + 0.7152 * rgba[i + 1] + 0.0722 * rgba[i + 2]) * rgba[i + 3]) / 65025;
        }
      }
      map[y * out + x] = acc / ((y1 - y0) * (x1 - x0));
    }
  }
  return map;
}

function gradient(map, n) {
  const g = new Float32Array(n * n);
  for (let y = 1; y < n - 1; y++) {
    for (let x = 1; x < n - 1; x++) {
      const i = y * n + x;
      const gx = map[i + 1] - map[i - 1];
      const gy = map[i + n] - map[i - n];
      g[i] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return g;
}

function sample(map, n, x, y) {
  if (x < 0 || y < 0 || x > n - 1 || y > n - 1) return 0;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(n - 1, x0 + 1);
  const y1 = Math.min(n - 1, y0 + 1);
  const fx = x - x0;
  const fy = y - y0;
  const a = map[y0 * n + x0] * (1 - fx) + map[y0 * n + x1] * fx;
  const b = map[y1 * n + x0] * (1 - fx) + map[y1 * n + x1] * fx;
  return a * (1 - fy) + b * fy;
}

/** Weighted normalised cross-correlation of `ref` against `mov` scaled by s about (cx, cy) and shifted by (tx, ty). */
function ncc(ref, mov, n, weight, s, cx, cy, tx, ty, step = 1) {
  let sw = 0;
  let sa = 0;
  let sb = 0;
  let saa = 0;
  let sbb = 0;
  let sab = 0;
  for (let y = 0; y < n; y += step) {
    for (let x = 0; x < n; x += step) {
      const i = y * n + x;
      const w = weight[i];
      if (w <= 0) continue;
      const a = ref[i];
      const b = sample(mov, n, (x - cx - tx) / s + cx, (y - cy - ty) / s + cy);
      sw += w;
      sa += w * a;
      sb += w * b;
      saa += w * a * a;
      sbb += w * b * b;
      sab += w * a * b;
    }
  }
  if (sw === 0) return 0;
  const ma = sa / sw;
  const mb = sb / sw;
  const cov = sab / sw - ma * mb;
  const va = saa / sw - ma * ma;
  const vb = sbb / sw - mb * mb;
  return va > 1e-9 && vb > 1e-9 ? cov / Math.sqrt(va * vb) : 0;
}

/**
 * Alpha-weighted centroid of the object inside a disc of radius `r` around `c`
 * (iterated so the disc follows the object). The shell opens symmetrically, so
 * its centroid stays put while panels move; orbit modules outside the disc,
 * which are not symmetric, do not vote.
 */
function shellCentre(rgba, size, c, r) {
  let cx = c.x;
  let cy = c.y;
  for (let iter = 0; iter < 4; iter++) {
    let sx = 0;
    let sy = 0;
    let sw = 0;
    for (let y = 0; y < size; y += 2) {
      for (let x = 0; x < size; x += 2) {
        const a = rgba[(y * size + x) * 4 + 3];
        if (a < 48) continue;
        const px = (x + 0.5) / size;
        const py = (y + 0.5) / size;
        if (Math.hypot(px - cx, py - cy) > r) continue;
        sx += px * a;
        sy += py * a;
        sw += a;
      }
    }
    if (!sw) break;
    cx = sx / sw;
    cy = sy / sw;
  }
  return { x: cx, y: cy };
}

/** Plain alpha-weighted centroid of everything in the frame. */
function objectCentre(rgba, size) {
  return shellCentre(rgba, size, { x: 0.5, y: 0.5 }, 2);
}

/**
 * Resample a WORK-size premultiplied image with an inverse mapping:
 * out(x, y) = src(map(x, y)). `map` receives output pixel coordinates.
 */
function warp(rgba, size, outSize, map) {
  const pre = new Float32Array(size * size * 4);
  for (let i = 0; i < rgba.length; i += 4) {
    const a = rgba[i + 3] / 255;
    pre[i] = rgba[i] * a;
    pre[i + 1] = rgba[i + 1] * a;
    pre[i + 2] = rgba[i + 2] * a;
    pre[i + 3] = rgba[i + 3];
  }
  const out = new Uint8ClampedArray(outSize * outSize * 4);
  for (let y = 0; y < outSize; y++) {
    for (let x = 0; x < outSize; x++) {
      const [sx, sy] = map(x + 0.5, y + 0.5);
      const fx0 = sx - 0.5;
      const fy0 = sy - 0.5;
      const x0 = Math.floor(fx0);
      const y0 = Math.floor(fy0);
      const fx = fx0 - x0;
      const fy = fy0 - y0;
      const o = (y * outSize + x) * 4;
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let k = 0; k < 4; k++) {
        const xx = x0 + (k & 1);
        const yy = y0 + (k >> 1);
        if (xx < 0 || yy < 0 || xx >= size || yy >= size) continue;
        const w = (k & 1 ? fx : 1 - fx) * (k >> 1 ? fy : 1 - fy);
        const i = (yy * size + xx) * 4;
        r += pre[i] * w;
        g += pre[i + 1] * w;
        b += pre[i + 2] * w;
        a += pre[i + 3] * w;
      }
      if (a > 0.5) {
        const inv = 255 / a;
        out[o] = r * inv;
        out[o + 1] = g * inv;
        out[o + 2] = b * inv;
        out[o + 3] = a;
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------- measurement

/** Largest distance (in image-size units) from `c` to a pixel whose alpha exceeds `minAlpha`. */
function extent(rgba, size, c, minAlpha = 48) {
  let max = 0;
  const step = 2;
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      if (rgba[(y * size + x) * 4 + 3] < minAlpha) continue;
      const d = Math.hypot((x + 0.5) / size - c.x, (y + 0.5) / size - c.y);
      if (d > max) max = d;
    }
  }
  return max;
}

// ---------------------------------------------------------------- band scales

function ellipseRadius(dx, dy, ellipse) {
  const c = Math.cos(ellipse.angle);
  const s = Math.sin(ellipse.angle);
  const u = dx * c + dy * s;
  const v = (-dx * s + dy * c) / ellipse.ratio;
  return Math.hypot(u, v);
}

/** For a transition A -> B, the scale about the core that best maps A onto B within each band. */
function bandScales(aG, bG, n, bands, ellipse) {
  const c = (n - 1) / 2;
  const out = {};
  for (let k = 0; k < bands.length; k++) {
    const band = bands[k];
    const lo = k === 0 ? 0 : bands[k - 1].to;
    const hi = band.to ?? 0.5;
    const weight = new Float32Array(n * n);
    let massA = 0;
    let massB = 0;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const r = ellipseRadius((x - c) / n, (y - c) / n, ellipse);
        const inBand = smooth(lo - 0.01, lo + 0.01, r) * (1 - smooth(hi - 0.01, hi + 0.01, r));
        const w = inBand * (0.15 + Math.max(aG[y * n + x], bG[y * n + x]));
        weight[y * n + x] = w;
        massA += inBand * aG[y * n + x];
        massB += inBand * bG[y * n + x];
      }
    }
    // A band that is (nearly) empty in either frame has nothing to morph: content there fades in or out.
    if (k === 0 || Math.min(massA, massB) < 0.25 * Math.max(massA, massB) || Math.max(massA, massB) < 0.5) {
      out[band.name] = 1;
      continue;
    }
    // B(x) ~ A((x - c) / s + c): reference B, moving A scaled by s.
    const identity = ncc(bG, aG, n, weight, 1, c, c, 0, 0);
    let best = { s: 1, score: identity };
    for (let s = 0.86; s <= 1.2001; s += 0.0025) {
      const score = ncc(bG, aG, n, weight, s, c, c, 0, 0);
      if (score > best.score) best = { s, score };
    }
    out[band.name] = best.score - identity > 0.02 ? Math.round(best.s * 10000) / 10000 : 1;
  }
  return out;
}

// ---------------------------------------------------------------- main

console.log(`Normalising ${config.frames.length} frames from ${path.relative(ROOT, SOURCE_DIR)}`);
const frames = [];
for (const f of config.frames) {
  console.log(`- ${f.file}`);
  const img = await load(f.file);
  log(`${img.width}x${img.height}${img.opaque ? ' opaque' : ' transparent'}`);
  frames.push({ ...f, img });
}

// Alignment. Translation is automatic: each frame's shell centroid is moved onto the
// closed frame's. Scale is never guessed (an opening shell is indistinguishable from
// a zoom); set `nudge.scale` per frame, checking the onion-skin images in hero-frames/preview.
const closedCentre = objectCentre(frames[0].img.rgba, WORK);
const closedExtent = extent(frames[0].img.rgba, WORK, closedCentre);
const shellDisc = closedExtent * (config.alignRadius ?? 1.12);
const reference = shellCentre(frames[0].img.rgba, WORK, closedCentre, shellDisc);
if (guides && config.align === 'auto') log('frames come from the keyframe renderer (guides match): already aligned');
const aligned = [];
for (const f of frames) {
  let rgba = f.img.rgba;
  const nudge = f.nudge ?? {};
  let tx = 0;
  let ty = 0;
  // Frames rendered from one fixed camera (matching guides) are aligned by construction.
  const prealigned = config.align === 'auto' && guides;
  if (f !== frames[0] && config.align !== 'none' && !prealigned && f.align !== false) {
    const c = shellCentre(rgba, WORK, reference, shellDisc);
    tx = reference.x - c.x;
    ty = reference.y - c.y;
    if (Math.hypot(tx, ty) < 0.0008) tx = ty = 0;
    log(tx || ty ? `aligned ${f.id}: shift ${(tx * 100).toFixed(2)}%, ${(ty * 100).toFixed(2)}%` : `aligned ${f.id}: already aligned`);
  }
  const s = nudge.scale ?? 1;
  tx += nudge.x ?? 0;
  ty += nudge.y ?? 0;
  if (s !== 1 || tx || ty) {
    // Scale about the reference centre, then shift.
    const cx = reference.x * WORK;
    const cy = reference.y * WORK;
    rgba = warp(rgba, WORK, WORK, (x, y) => [(x - cx - tx * WORK) / s + cx, (y - cy - ty * WORK) / s + cy]);
  }
  aligned.push(rgba);
}

// Core centre and reference radius.
const core = config.core ? { x: config.core[0], y: config.core[1] } : guides?.core ?? reference;
const closedRadius = extent(aligned[0], WORK, core);
const maxRadius = Math.max(...aligned.map((a) => extent(a, WORK, core)));
const cropHalf = maxRadius / (config.objectRadius * 2);
log(`core at ${(core.x * 100).toFixed(1)}%, ${(core.y * 100).toFixed(1)}% | closed radius ${closedRadius.toFixed(3)} | max ${maxRadius.toFixed(3)}`);

// Ellipse of the ring plane: from guides when available, else circular.
const ringGuide = guides ? guides.rings[String(guides.ringRadii[2])] : null;
const ellipse = ringGuide ? { ratio: ringGuide.ry / ringGuide.rx, angle: ringGuide.angle } : { ratio: 1, angle: 0 };

// Crop identically around the core, feather the edges.
const lg = config.output.lg;
const cropped = aligned.map((rgba) => {
  const scale = (cropHalf * 2 * WORK) / lg;
  const ox = core.x * WORK - cropHalf * WORK;
  const oy = core.y * WORK - cropHalf * WORK;
  const out = warp(rgba, WORK, lg, (x, y) => [ox + x * scale, oy + y * scale]);
  const [f0, f1] = config.feather;
  for (let y = 0; y < lg; y++) {
    for (let x = 0; x < lg; x++) {
      const r = Math.hypot((x + 0.5) / lg - 0.5, (y + 0.5) / lg - 0.5);
      if (r < f0) continue;
      const i = (y * lg + x) * 4 + 3;
      out[i] = out[i] * (1 - smooth(f0, f1, r));
    }
  }
  return out;
});

// Bands: config gives edges as multiples of the closed radius; convert to output units.
const toOut = (r) => r / (cropHalf * 2);
const bands = config.bands.map((b) => ({ name: b.name, ...(b.to != null ? { to: Math.round(toOut(b.to * closedRadius) * 10000) / 10000 } : {}) }));
log(`bands (output units): ${bands.map((b) => `${b.name}<${b.to ?? '∞'}`).join(' ')}`);

const bandG = cropped.map((rgba) => gradient(lumaMap(rgba, lg, BAND_RES), BAND_RES));
const transitions = [];
for (let i = 1; i < cropped.length; i++) {
  const scales = bandScales(bandG[i - 1], bandG[i], BAND_RES, bands, ellipse);
  transitions.push({ scales });
  log(`${frames[i - 1].id} -> ${frames[i].id}: ${Object.entries(scales).map(([k, v]) => `${k} ${v}`).join(', ')}`);
}

// Write frames.
await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(path.join(OUT_DIR, 'lg'), { recursive: true });
await mkdir(path.join(OUT_DIR, 'sm'), { recursive: true });
const manifestFrames = [];
let bytes = { lg: 0, sm: 0 };
for (let i = 0; i < frames.length; i++) {
  const f = frames[i];
  const name = `${String(i + 1).padStart(2, '0')}-${f.id}.webp`;
  const base = sharp(Buffer.from(cropped[i].buffer), { raw: { width: lg, height: lg, channels: 4 } });
  const webp = { quality: config.output.quality, alphaQuality: 90, effort: 6, smartSubsample: true };
  const lgBuf = await base.clone().webp(webp).toBuffer();
  const smBuf = await base.clone().resize(config.output.sm, config.output.sm, { kernel: 'lanczos3' }).webp(webp).toBuffer();
  await writeFile(path.join(OUT_DIR, 'lg', name), lgBuf);
  await writeFile(path.join(OUT_DIR, 'sm', name), smBuf);
  bytes.lg += lgBuf.length;
  bytes.sm += smBuf.length;
  manifestFrames.push({
    id: f.id,
    at: f.at,
    ...(f.from != null ? { from: f.from } : {}),
    glow: f.glow ?? 0.5,
    reveal: f.reveal ?? 'uniform',
    ease: f.ease ?? 'inOut',
    src: { lg: `${PUBLIC_PREFIX}/lg/${name}`, sm: `${PUBLIC_PREFIX}/sm/${name}` },
  });
}
log(`wrote ${frames.length} frames: lg ${(bytes.lg / 1024).toFixed(0)} KB, sm ${(bytes.sm / 1024).toFixed(0)} KB`);

// Orbit path in output coordinates (from guides).
const orbit = guides?.orbit
  ? guides.orbit.map(([x, y, front]) => [
      Math.round(((x - core.x) / (cropHalf * 2) + 0.5) * 10000) / 10000,
      Math.round(((y - core.y) / (cropHalf * 2) + 0.5) * 10000) / 10000,
      front,
    ])
  : null;

const manifest = {
  $comment: 'Generated by scripts/normalize-frames.mjs from hero-frames/frames.config.json. Do not edit by hand.',
  sizes: { lg: config.output.lg, sm: config.output.sm },
  core: { x: 0.5, y: 0.5 },
  ellipse: { ratio: Math.round(ellipse.ratio * 10000) / 10000, angle: Math.round(ellipse.angle * 10000) / 10000 },
  feather: 0.008,
  bands,
  ringSpin: config.ringSpin ?? null,
  frames: manifestFrames,
  transitions,
  orbit,
};
// QA images.
await mkdir(PREVIEW_DIR, { recursive: true });
const Q = 480;
const lumaAt = async (rgba) => {
  const { data } = await sharp(Buffer.from(rgba.buffer), { raw: { width: lg, height: lg, channels: 4 } })
    .resize(Q, Q)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = new Uint8ClampedArray(Q * Q);
  for (let i = 0; i < Q * Q; i++) {
    const j = i * 4;
    out[i] = Math.min(255, ((0.2126 * data[j] + 0.7152 * data[j + 1] + 0.0722 * data[j + 2]) * data[j + 3]) / 255 * 1.6);
  }
  return out;
};
const lumas = await Promise.all(cropped.map(lumaAt));
for (let i = 1; i < lumas.length; i++) {
  const rgb = Buffer.alloc(Q * Q * 3);
  for (let p = 0; p < Q * Q; p++) {
    rgb[p * 3] = lumas[i - 1][p];
    rgb[p * 3 + 1] = lumas[i][p];
    rgb[p * 3 + 2] = lumas[i][p];
  }
  await sharp(rgb, { raw: { width: Q, height: Q, channels: 3 } })
    .png()
    .toFile(path.join(PREVIEW_DIR, `onion-${String(i).padStart(2, '0')}-${frames[i - 1].id}--${frames[i].id}.png`));
}
const tiles = await Promise.all(
  cropped.map((rgba) =>
    sharp(Buffer.from(rgba.buffer), { raw: { width: lg, height: lg, channels: 4 } })
      .resize(Q, Q)
      .png()
      .toBuffer(),
  ),
);
const cols = 4;
await sharp({ create: { width: Q * cols, height: Q * Math.ceil(tiles.length / cols), channels: 4, background: '#07111F' } })
  .composite(tiles.map((input, i) => ({ input, left: (i % cols) * Q, top: Math.floor(i / cols) * Q })))
  .png()
  .toFile(path.join(PREVIEW_DIR, 'contact-sheet.png'));
log(`QA images written to ${path.relative(ROOT, PREVIEW_DIR)}`);

await mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Manifest written to ${path.relative(ROOT, MANIFEST_PATH)}`);
