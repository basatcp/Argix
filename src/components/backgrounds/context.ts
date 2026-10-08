import { createContext, useContext } from 'react';
import type { MotionEnv } from './motion';

export interface AnchorRect {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
}

export interface BgContextValue {
  /** Size of the background box in px. */
  w: number;
  h: number;
  env: MotionEnv;
  /** Elements marked data-bg-anchor="name" inside the section, relative to the background box. */
  anchors: Record<string, AnchorRect[]>;
  /** True while the section is on screen. */
  active: boolean;
  /** Motion allowed (not reduced) — pulses, particles and drift render only then. */
  animate: boolean;
}

export const BgContext = createContext<BgContextValue | null>(null);

export function useBg(): BgContextValue {
  const ctx = useContext(BgContext);
  if (!ctx) throw new Error('Background primitives must be rendered inside <SectionBackground>');
  return ctx;
}

/** Pick a value per device tier. */
export function byTier<T>(tier: MotionEnv['tier'], values: { desktop: T; tablet: T; mobile: T }): T {
  return values[tier];
}
