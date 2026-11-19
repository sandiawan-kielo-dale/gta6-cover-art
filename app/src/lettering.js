// Cover lettering, drawn from scratch on the canvas with system fonts: the bold caption (forward-leaning, chrome
// sunset fill with a hard horizon line, light rim, heavy dark stroke and a stepped 3D extrusion) and the neon script
// subtitle with layered glow. No font file and no game logo is used; the look comes from the stroke stack.

export const TITLE_FONT =
  'Impact, Haettenschweiler, "Noto Sans ExtraCondensed Black", "Arial Narrow", "Arial Black", "Liberation Sans", sans-serif';
export const SCRIPT_FONT =
  '"Brush Script MT", "Segoe Script", "Snell Roundhand", "Noto Serif Display", "Noto Serif", cursive';
const LEAN = -0.14;
const TILT = (-3 * Math.PI) / 180;

/** Makes sure the system fonts in the stacks are ready, so the first frame and every export use the same face. */
export async function loadLetteringFonts() {
  try {
    await Promise.all([
      document.fonts.load(`900 100px ${TITLE_FONT}`, 'VICE'),
      document.fonts.load(`italic 700 100px ${SCRIPT_FONT}`, 'only'),
    ]);
  } catch {
    // Font loading is a nicety: the stacks fall back to whatever the system has.
  }
}

/** Splits the caption into at most three lines; one long line is balanced into two at a space. */
export function titleLines(text) {
  const lines = text.toUpperCase().split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 3);
  if (lines.length === 1 && lines[0].length > 11 && lines[0].includes(' ')) {
    const words = lines[0].split(/\s+/);
    let best = 1;
    let bestDiff = Infinity;
    for (let i = 1; i < words.length; i++) {
      const diff = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
      if (diff < bestDiff) { bestDiff = diff; best = i; }
    }
    return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
  }
  return lines.length ? lines : [' '];
}

function titleFont(size) {
  return `900 ${size}px ${TITLE_FONT}`;
}

/** Biggest font size at which every line fits `maxW` wide and the stack fits `maxH` tall. */
function fitTitleSize(ctx, lines, maxW, maxH, squeeze) {
  let size = maxH / (lines.length * 0.84);
  ctx.font = titleFont(100);
  for (const line of lines) {
    const w = ctx.measureText(line).width * squeeze;
    if (w > 0) size = Math.min(size, (maxW / w) * 100);
  }
  return size;
}

/** Chrome sunset fill for one line: light top, a hard horizon, deep colour below. */
function chromeFill(ctx, palette, top, size) {
  const g = ctx.createLinearGradient(0, top, 0, top + size);
  const [hi, mid, lo] = palette.fill;
  g.addColorStop(0, hi);
  g.addColorStop(0.46, mid);
  g.addColorStop(0.52, lo);
  g.addColorStop(1, mid);
  return g;
}

/**
 * Draws the caption inside `box` ({x, y, w, h}). Returns the rectangle the letters took, so the subtitle can
 * overlap the bottom line the way poster script usually does.
 */
export function drawTitle(ctx, text, box, palette, { squeeze = 0.92 } = {}) {
  const lines = titleLines(text);
  const maxW = box.w * 0.9;
  const base = fitTitleSize(ctx, lines, maxW, box.h * 0.94, squeeze);
  // Justify: every line grows to the full width (up to 1.3x), like stacked poster type, then the stack is scaled
  // back down if it got too tall for the box.
  ctx.font = titleFont(100);
  let sizes = lines.map((line) => Math.min(base * 1.3, (maxW / Math.max(1, ctx.measureText(line).width * squeeze)) * 100));
  const tall = sizes.reduce((a, s) => a + s * 0.84, 0);
  if (tall > box.h * 0.94) sizes = sizes.map((s) => (s * box.h * 0.94) / tall);
  const blockH = sizes.reduce((a, s) => a + s * 0.84, 0);
  const size = Math.max(...sizes);
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(TILT);
  ctx.transform(1, 0, LEAN, 1, 0, 0);
  ctx.scale(squeeze, 1);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  let y = -blockH / 2;
  lines.forEach((line, i) => {
    const s = sizes[i];
    y += s * 0.84;
    const base = y - s * 0.06;
    const top = base - s * 0.74;
    const depth = Math.max(3, Math.round(s * 0.09));
    ctx.font = titleFont(s);
    // Stepped extrusion, then its own outline so the 3D block reads as one solid.
    ctx.lineWidth = s * 0.2;
    ctx.strokeStyle = palette.stroke;
    ctx.strokeText(line, depth, base + depth);
    ctx.fillStyle = palette.extrude;
    for (let k = depth; k > 0; k--) ctx.fillText(line, k, base + k);
    ctx.lineWidth = s * 0.17;
    ctx.strokeStyle = palette.stroke;
    ctx.strokeText(line, 0, base);
    ctx.lineWidth = s * 0.075;
    ctx.strokeStyle = palette.outline;
    ctx.strokeText(line, 0, base);
    ctx.fillStyle = chromeFill(ctx, palette, top, s * 0.74);
    ctx.fillText(line, 0, base);
  });
  ctx.restore();
  return { x: cx - box.w / 2, y: cy - blockH / 2, w: box.w, h: blockH, size };
}

/** The neon script subtitle centred at (x, y), tilted up a little, glowing in the grade's glow colour. */
export function drawNeonScript(ctx, text, x, y, maxW, size, palette) {
  if (!text.trim()) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((-7 * Math.PI) / 180);
  let s = size;
  ctx.font = `italic 700 ${s}px ${SCRIPT_FONT}`;
  const w = ctx.measureText(text).width;
  if (w > maxW) {
    s *= maxW / w;
    ctx.font = `italic 700 ${s}px ${SCRIPT_FONT}`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.shadowColor = palette.glow;
  ctx.strokeStyle = palette.glow;
  ctx.shadowBlur = s * 0.6;
  ctx.lineWidth = s * 0.14;
  ctx.strokeText(text, 0, 0);
  ctx.shadowBlur = s * 0.25;
  ctx.lineWidth = s * 0.07;
  ctx.strokeText(text, 0, 0);
  ctx.shadowBlur = s * 0.12;
  ctx.fillStyle = palette.script;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

/** Small spaced capitals, for credits lines and badge text. */
export function drawSpacedCaps(ctx, text, x, y, size, color, spacing = 0.18) {
  ctx.save();
  ctx.font = `800 ${size}px ${TITLE_FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = `${size * spacing}px`;
  ctx.fillText(text.toUpperCase(), x, y);
  ctx.restore();
}
