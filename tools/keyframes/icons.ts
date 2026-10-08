/**
 * Line icons for the floating system modules, drawn to canvas so they can be
 * used as textures inside the WebGL scene. Each drawer works in a 24x24 space.
 */
export type ModuleIcon = 'development' | 'ai' | 'cloud' | 'security' | 'compliance' | 'monitoring';

type Drawer = (ctx: CanvasRenderingContext2D) => void;

const drawers: Record<ModuleIcon, Drawer> = {
  development: (c) => {
    c.beginPath();
    c.moveTo(8, 7);
    c.lineTo(3, 12);
    c.lineTo(8, 17);
    c.moveTo(16, 7);
    c.lineTo(21, 12);
    c.lineTo(16, 17);
    c.moveTo(13.5, 5);
    c.lineTo(10.5, 19);
    c.stroke();
  },
  ai: (c) => {
    c.strokeRect(7, 7, 10, 10);
    c.beginPath();
    for (const p of [9.5, 14.5]) {
      c.moveTo(p, 7);
      c.lineTo(p, 4);
      c.moveTo(p, 17);
      c.lineTo(p, 20);
      c.moveTo(7, p);
      c.lineTo(4, p);
      c.moveTo(17, p);
      c.lineTo(20, p);
    }
    c.stroke();
    c.beginPath();
    c.arc(12, 12, 1.6, 0, Math.PI * 2);
    c.stroke();
  },
  cloud: (c) => {
    c.beginPath();
    c.moveTo(7, 18);
    c.bezierCurveTo(3.5, 18, 2.5, 13.6, 5.8, 12.4);
    c.bezierCurveTo(5.6, 8.4, 10.6, 6.6, 12.8, 9.6);
    c.bezierCurveTo(14.8, 6.8, 19.6, 8.2, 19.2, 12);
    c.bezierCurveTo(22.4, 12.6, 22, 18, 18, 18);
    c.closePath();
    c.stroke();
  },
  security: (c) => {
    c.beginPath();
    c.moveTo(12, 3);
    c.lineTo(19.5, 6);
    c.lineTo(19.5, 11.5);
    c.bezierCurveTo(19.5, 16, 16.4, 19.4, 12, 21);
    c.bezierCurveTo(7.6, 19.4, 4.5, 16, 4.5, 11.5);
    c.lineTo(4.5, 6);
    c.closePath();
    c.stroke();
    c.beginPath();
    c.moveTo(8.8, 12);
    c.lineTo(11.2, 14.4);
    c.lineTo(15.4, 9.8);
    c.stroke();
  },
  compliance: (c) => {
    c.beginPath();
    c.moveTo(6, 4);
    c.lineTo(15, 4);
    c.lineTo(19, 8);
    c.lineTo(19, 20);
    c.lineTo(6, 20);
    c.closePath();
    c.moveTo(15, 4);
    c.lineTo(15, 8);
    c.lineTo(19, 8);
    c.moveTo(9, 13.5);
    c.lineTo(11.2, 15.7);
    c.lineTo(15.5, 11.2);
    c.stroke();
  },
  monitoring: (c) => {
    c.strokeRect(3, 4.5, 18, 12.5);
    c.beginPath();
    c.moveTo(9, 20.5);
    c.lineTo(15, 20.5);
    c.moveTo(5.5, 11);
    c.lineTo(8.5, 11);
    c.lineTo(10.2, 8);
    c.lineTo(12.8, 14);
    c.lineTo(14.5, 11);
    c.lineTo(18.5, 11);
    c.stroke();
  },
};

export function drawIconCanvas(icon: ModuleIcon, size = 128): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const s = size / 24;
  ctx.scale(s, s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#CFF4FF';
  ctx.lineWidth = 1.5;
  drawers[icon](ctx);
  return canvas;
}

/** Soft radial gradient used for glows and particles. */
export function radialGlowCanvas(size = 128, inner = 'rgba(57,215,255,1)', outer = 'rgba(30,167,255,0)'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.25, 'rgba(57,215,255,0.45)');
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}
