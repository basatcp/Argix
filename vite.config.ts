import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import hero from './src/hero/frames.generated.json';

/**
 * Preload hints for the hero keyframes: the first three frames (the player starts
 * once they are decoded) for the matching size, or only the final frame when the
 * visitor prefers reduced motion. Media queries mirror HeroSequence.tsx.
 */
function heroFramePreload(): Plugin {
  const sizes = [
    ['lg', '(min-width: 768px)'],
    ['sm', '(max-width: 767px)'],
  ] as const;
  return {
    name: 'hero-frame-preload',
    transformIndexHtml() {
      const tags: HtmlTagDescriptor[] = [];
      const link = (href: string, media: string, high: boolean): HtmlTagDescriptor => ({
        tag: 'link',
        attrs: { rel: 'preload', as: 'image', type: 'image/webp', href, media, ...(high ? { fetchpriority: 'high' } : {}) },
        injectTo: 'head',
      });
      for (const [variant, media] of sizes) {
        hero.frames.slice(0, 3).forEach((f, i) => tags.push(link(f.src[variant], `${media} and (prefers-reduced-motion: no-preference)`, i === 0)));
        tags.push(link(hero.frames[hero.frames.length - 1].src[variant], `${media} and (prefers-reduced-motion: reduce)`, true));
      }
      return tags;
    },
  };
}

export default defineConfig({
  plugins: [react(), heroFramePreload()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ['gsap'],
        },
      },
    },
  },
});
