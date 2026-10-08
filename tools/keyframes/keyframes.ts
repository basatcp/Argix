import type { KeyframeState } from './CyberCore';

const none = [0, 0, 0, 0, 0, 0];
const all = [1, 1, 1, 1, 1, 1];

/**
 * The eight approved keyframes of the opening sequence. Camera, attitude and
 * framing are identical in every frame; only the mechanism changes.
 */
export const KEYFRAMES: { id: string; state: KeyframeState }[] = [
  {
    id: '01-closed',
    state: { glow: 0.22, circuit: 0, indicator: 0.1, unlock: 0, open: 0, iris: 0, reveal: 0, nodes: 0, orbit: 0, modules: none },
  },
  {
    id: '02-activation',
    state: { glow: 0.9, circuit: 1, indicator: 1, unlock: 0, open: 0, iris: 0, reveal: 0.08, nodes: 0, orbit: 0, modules: none },
  },
  {
    id: '03-panels-opening',
    state: { glow: 0.8, circuit: 1, indicator: 0.9, unlock: 1, open: 0.35, iris: 0.45, reveal: 0.15, nodes: 0.1, orbit: 0, modules: none },
  },
  {
    id: '04-internal-structure',
    state: { glow: 0.88, circuit: 1, indicator: 0.9, unlock: 1, open: 0.75, iris: 1, reveal: 0.6, nodes: 0.5, orbit: 0, modules: none },
  },
  {
    id: '05-fully-open',
    state: { glow: 1, circuit: 1, indicator: 0.9, unlock: 1, open: 1, iris: 1, reveal: 1, nodes: 1, orbit: 0, modules: none },
  },
  {
    id: '06-service-nodes',
    state: { glow: 1, circuit: 1, indicator: 0.9, unlock: 1, open: 1, iris: 1, reveal: 1, nodes: 1, orbit: 0.15, modules: [0.55, 0.55, 0.55, 0.55, 0.55, 0.55] },
  },
  {
    id: '07-orbit-modules',
    state: { glow: 1, circuit: 1, indicator: 0.9, unlock: 1, open: 1, iris: 1, reveal: 1, nodes: 1, orbit: 1, modules: all },
  },
  {
    id: '08-final',
    state: { glow: 0.94, circuit: 1, indicator: 0.85, unlock: 1, open: 1, iris: 1, reveal: 1, nodes: 1, orbit: 1, modules: all },
  },
];
