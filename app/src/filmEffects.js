// Finishing passes over the whole cover: film grain from a seeded noise tile, a vignette, and a faint warm haze
// that ties panels from different photos into one print.

let grainTile = null;

/** A 256 x 256 tile of grey noise from a fixed seed, so every export of the same cover has the same grain. */
function noiseTile() {
  if (grainTile) return grainTile;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(256, 256);
  let seed = 0x9e3779b9;
  for (let i = 0; i < img.data.length; i += 4) {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    const v = 128 + (((seed >>> 0) % 256) - 128) * 0.9;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  grainTile = c;
  return c;
}

/** Overlays film grain at `amount` (0 to 1), scaled with the cover so a preview looks like the export. */
export function drawGrain(ctx, W, H, amount) {
  if (amount <= 0) return;
  const pattern = ctx.createPattern(noiseTile(), 'repeat');
  const scale = Math.max(0.5, Math.min(W, H) / 1080);
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.32 * amount;
  ctx.scale(scale, scale);
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, W / scale, H / scale);
  ctx.restore();
}

export function drawVignette(ctx, W, H, palette) {
  const r = Math.hypot(W, H) / 2;
  const g = ctx.createRadialGradient(W / 2, H / 2, r * 0.45, W / 2, H / 2, r);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, hexAlpha(palette.ink, 0.6));
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/** A soft gradient behind overlay lettering so it reads over any photo. */
export function drawTitleShade(ctx, box, W, H, palette) {
  const top = Math.max(0, box.y - box.h * 0.35);
  const bottom = Math.min(H, box.y + box.h);
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, hexAlpha(palette.ink, 0));
  g.addColorStop(0.6, hexAlpha(palette.ink, 0.5));
  g.addColorStop(1, hexAlpha(palette.ink, 0.78));
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, top, W, bottom - top);
  ctx.restore();
}

export function hexAlpha(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
