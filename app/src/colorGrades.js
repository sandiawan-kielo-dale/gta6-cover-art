// Colour grades: each one is a gradient map (shadows to highlights through a run of colours) mixed over the photo,
// with a contrast curve, optional posterize and halftone, plus the palette the lettering, title block and accents use
// so the whole cover shares one look.

export const GRADES = [
  {
    id: 'vice', name: 'Vice Sunset', mix: 0.6, contrast: 1.18, lift: 0.02, vivid: 1.45,
    tint: ['#ff5fa2', '#3a10a0'],
    stops: ['#140430', '#3d0d6b', '#a4166f', '#ff4f6a', '#ffa94d', '#ffe9b8'],
    palette: {
      fill: ['#fff6b8', '#ffb23f', '#ff3f7f'], stroke: '#1d0630', extrude: '#86124f', outline: '#ffffff',
      glow: '#ff4fa8', script: '#ffe3f2', sky: ['#1b0742', '#6c1474', '#e2336b', '#ff8a3d', '#ffd27a'],
      sun: ['#fff27a', '#ff9a3c', '#ff3d7a'], ink: '#0d0318', star: '#ffd23f', badge: '#ff3f7f',
    },
  },
  {
    id: 'neon', name: 'Neon Night', mix: 0.72, contrast: 1.22, lift: 0.0, vivid: 1.3,
    tint: ['#3ff0ff', '#ff2f9a'],
    stops: ['#03041a', '#1d1366', '#7b1fa2', '#ff2f9a', '#6ef2ff', '#efffff'],
    palette: {
      fill: ['#e9ffff', '#62f0ff', '#ff4fd1'], stroke: '#08072a', extrude: '#3a0f7a', outline: '#ff4fd1',
      glow: '#3ff0ff', script: '#d9fbff', sky: ['#04051f', '#1a1060', '#5a1890', '#d42a9a', '#ff6fb5'],
      sun: ['#ffb3f0', '#ff3fae', '#7a2cff'], ink: '#03031a', star: '#62f0ff', badge: '#7a2cff',
    },
  },
  {
    id: 'gold', name: 'Gold Coast', mix: 0.55, contrast: 1.16, lift: 0.03, vivid: 1.4,
    tint: ['#ffcf5a', '#c2185b'],
    stops: ['#1a0b04', '#5e230b', '#b6571a', '#ee9c36', '#ffdc9a', '#fffaf0'],
    palette: {
      fill: ['#fffbe6', '#ffd56b', '#f07a1e'], stroke: '#2a1003', extrude: '#8a3a0c', outline: '#fff4d0',
      glow: '#ffb347', script: '#fff1cf', sky: ['#2a0e07', '#7a2a12', '#d2601e', '#f6a33c', '#ffe3a0'],
      sun: ['#fff6c2', '#ffc54a', '#f06a1e'], ink: '#140703', star: '#ffd56b', badge: '#d2481e',
    },
  },
  {
    id: 'mint', name: 'Miami Mint', mix: 0.55, contrast: 1.18, lift: 0.02, vivid: 1.4,
    tint: ['#ff9a8a', '#0aa3a0'],
    stops: ['#021a22', '#0a4a58', '#1f9b94', '#f2a56f', '#ffdcc0', '#fffaf5'],
    palette: {
      fill: ['#ffffff', '#9ff5df', '#ff8c6b'], stroke: '#03202a', extrude: '#0b5a63', outline: '#ffd2bf',
      glow: '#ff8c9a', script: '#fff0ea', sky: ['#05303d', '#0d6f78', '#3fc1aa', '#ffae86', '#ffe0c8'],
      sun: ['#fff0d0', '#ffb08a', '#ff6f88'], ink: '#021318', star: '#ffb08a', badge: '#0d8f8a',
    },
  },
  {
    id: 'heat', name: 'Red Heat', mix: 0.82, contrast: 1.3, lift: 0.0, vivid: 1.2,
    tint: ['#ffb06a', '#5a0010'],
    stops: ['#000000', '#2e0306', '#97101c', '#ec4a2b', '#ffd3ae', '#fff8ee'],
    palette: {
      fill: ['#ffffff', '#ffe0c2', '#ff3b2b'], stroke: '#000000', extrude: '#6a0710', outline: '#ff3b2b',
      glow: '#ff3b2b', script: '#ffe9dc', sky: ['#050000', '#3a0408', '#9a0f1b', '#ee4a2a', '#ffb889'],
      sun: ['#ffe4c4', '#ff6a3a', '#b80f1e'], ink: '#000000', star: '#ff3b2b', badge: '#b80f1e',
    },
  },
  {
    id: 'ink', name: 'Ink Pop', mix: 1, contrast: 1.15, lift: 0.04, posterize: 6, halftone: true, vivid: 1,
    stops: ['#15112e', '#5a1a63', '#c2246b', '#ff6a5a', '#ffcf3f', '#fff6dc'],
    palette: {
      fill: ['#fff6dc', '#ffcf3f', '#ffcf3f'], stroke: '#15112e', extrude: '#e2336b', outline: '#15112e',
      glow: '#e2336b', script: '#fff6dc', sky: ['#15112e', '#5a1a63', '#e2336b', '#ff8a3d', '#ffcf3f'],
      sun: ['#fff6dc', '#ffcf3f', '#e2336b'], ink: '#15112e', star: '#ffcf3f', badge: '#e2336b',
    },
  },
  {
    id: 'natural', name: 'Natural Punch', mix: 0.12, contrast: 1.12, lift: 0.0, vivid: 1.25,
    tint: ['#ffb36b', '#6a2a9a'],
    stops: ['#120626', '#5a1a4e', '#c04a5a', '#f6a35c', '#fff1dc'],
    palette: {
      fill: ['#ffffff', '#ffe08a', '#ff8a3d'], stroke: '#120a1c', extrude: '#5a1a4e', outline: '#ffffff',
      glow: '#ff7aa8', script: '#ffffff', sky: ['#1b0d33', '#5a1a4e', '#c04a5a', '#f6a35c', '#ffe1a6'],
      sun: ['#fff4b0', '#ffb04a', '#ff5f6d'], ink: '#0b0612', star: '#ffd23f', badge: '#e2336b',
    },
  },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const lutCache = new Map();

/** A 256-entry RGB lookup for the grade's gradient map, from darkest stop to lightest. */
export function gradientMapLut(grade) {
  if (lutCache.has(grade.id)) return lutCache.get(grade.id);
  const stops = grade.stops.map(hexToRgb);
  const lut = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = (i / 255) * (stops.length - 1);
    const k = Math.min(stops.length - 2, Math.floor(t));
    const f = t - k;
    for (let c = 0; c < 3; c++) lut[i * 3 + c] = stops[k][c] + (stops[k + 1][c] - stops[k][c]) * f;
  }
  lutCache.set(grade.id, lut);
  return lut;
}

/** An S-shaped contrast curve as a 256-entry table. */
function contrastCurve(amount, lift) {
  const curve = new Uint8ClampedArray(256);
  for (let i = 0; i < 256; i++) {
    const x = i / 255;
    const s = x < 0.5 ? 0.5 * Math.pow(2 * x, amount) : 1 - 0.5 * Math.pow(2 - 2 * x, amount);
    curve[i] = (lift + s * (1 - lift)) * 255;
  }
  return curve;
}

/** Grades the pixels of a canvas in place. */
export function applyGrade(canvas, grade) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const { width, height } = canvas;
  if (!width || !height) return;
  const image = ctx.getImageData(0, 0, width, height);
  const d = image.data;
  const lut = gradientMapLut(grade);
  const curve = contrastCurve(grade.contrast, grade.lift);
  const mix = grade.mix;
  const levels = grade.posterize ?? 0;
  const vivid = grade.vivid ?? 1.35;
  for (let i = 0; i < d.length; i += 4) {
    let r = curve[d[i]];
    let g = curve[d[i + 1]];
    let b = curve[d[i + 2]];
    let lum = (r * 0.299 + g * 0.587 + b * 0.114) | 0;
    // Push colour away from grey first, so the photo's own blues and skin tones survive under the gradient map.
    r = lum + (r - lum) * vivid;
    g = lum + (g - lum) * vivid;
    b = lum + (b - lum) * vivid;
    if (levels) lum = Math.round(Math.round((lum / 255) * (levels - 1)) * (255 / (levels - 1)));
    const j = lum * 3;
    d[i] = r + (lut[j] - r) * mix;
    d[i + 1] = g + (lut[j + 1] - g) * mix;
    d[i + 2] = b + (lut[j + 2] - b) * mix;
  }
  ctx.putImageData(image, 0, 0);
  if (grade.halftone) halftoneOverlay(ctx, image, width, height, grade.palette.ink);
}

/** Comic-print dots: darker areas get bigger ink dots on a 45-degree screen. */
function halftoneOverlay(ctx, image, width, height, ink) {
  const cell = Math.max(4, Math.round(Math.min(width, height) / 95));
  const d = image.data;
  ctx.save();
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.38;
  for (let y = 0, row = 0; y < height + cell; y += cell * 0.86, row++) {
    const offset = row % 2 ? cell / 2 : 0;
    for (let x = offset; x < width + cell; x += cell) {
      const sx = Math.min(width - 1, Math.max(0, x | 0));
      const sy = Math.min(height - 1, Math.max(0, y | 0));
      const k = (sy * width + sx) * 4;
      const lum = (d[k] * 0.299 + d[k + 1] * 0.587 + d[k + 2] * 0.114) / 255;
      const r = (1 - lum) * cell * 0.62;
      if (r < 0.4) continue;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
