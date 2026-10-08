import { SectionBackground } from '../backgrounds/SectionBackground';

/**
 * Backdrop of the consultation section: the shared background system's
 * "consult" variant (hex grid, circuit traces converging on the form, nodes
 * drifting inward, pulses, slow expanding rings, a pointer-reactive glow and a
 * few particles). Render it as a direct child of the section.
 */
export function AnimatedTechnicalBackground() {
  return <SectionBackground variant="consult" />;
}
