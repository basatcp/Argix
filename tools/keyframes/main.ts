import { createCyberCore } from './CyberCore';
import { KEYFRAMES } from './keyframes';

/**
 * Dev-only page used by scripts/render-keyframes.mjs. Renders each keyframe of
 * the Cyber Core to a transparent PNG and reports screen-space guides
 * (core centre, ring ellipses, orbit path) for the 2D frame player.
 */
const canvas = document.getElementById('c') as HTMLCanvasElement;
const core = createCyberCore(canvas, { reducedMotion: true, quality: 'high', manual: true });

declare global {
  interface Window {
    renderKeyframes: (ringRadii: number[]) => Promise<{ frames: { id: string; png: string }[]; guides: unknown }>;
  }
}

window.renderKeyframes = async (ringRadii) => {
  const frames = KEYFRAMES.map(({ id, state }) => {
    core.renderKeyframe(state);
    return { id, png: canvas.toDataURL('image/png') };
  });
  return { frames, guides: core.guides(ringRadii) };
};
