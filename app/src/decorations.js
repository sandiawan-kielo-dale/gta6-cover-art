// Poster accents, all drawn as vector paths: the striped retro sun, palm-tree silhouettes, the row of wanted stars
// and the starburst date badge.

/** A five-pointed star path centred at (x, y). */
function starPath(ctx, x, y, outer, inner = outer * 0.45) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath();
}

/** A row of five stars, `lit` of them filled, centred at (x, y). */
export function drawWantedStars(ctx, x, y, size, lit, palette) {
  if (lit <= 0) return;
  const gap = size * 2.35;
  const start = x - gap * 2;
  ctx.save();
  ctx.lineJoin = 'round';
  for (let i = 0; i < 5; i++) {
    starPath(ctx, start + i * gap, y, size);
    ctx.lineWidth = size * 0.32;
    ctx.strokeStyle = palette.ink;
    ctx.stroke();
    if (i < lit) {
      ctx.fillStyle = palette.star;
      ctx.shadowColor = palette.star;
      ctx.shadowBlur = size * 0.8;
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Sunset sky with a striped sun on the horizon, filling rect r. */
export function drawSunsetBackdrop(ctx, r, palette) {
  const sky = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  palette.sky.forEach((c, i) => sky.addColorStop(i / (palette.sky.length - 1), c));
  ctx.fillStyle = sky;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  const radius = Math.min(r.w, r.h) * 0.36;
  const sx = r.x + r.w * 0.5;
  const sy = r.y + r.h * 0.66;
  ctx.save();
  ctx.beginPath();
  ctx.rect(r.x, r.y, r.w, r.h);
  ctx.clip();
  ctx.beginPath();
  ctx.arc(sx, sy, radius, 0, Math.PI * 2);
  const sun = ctx.createLinearGradient(0, sy - radius, 0, sy + radius);
  palette.sun.forEach((c, i) => sun.addColorStop(i / (palette.sun.length - 1), c));
  ctx.fillStyle = sun;
  ctx.shadowColor = palette.sun[1];
  ctx.shadowBlur = radius * 0.5;
  ctx.fill();
  ctx.shadowBlur = 0;
  // Horizontal cuts across the lower half of the sun, thicker toward the horizon.
  ctx.fillStyle = palette.sky[Math.min(3, palette.sky.length - 1)];
  for (let i = 0; i < 6; i++) {
    const t = i / 6;
    const y = sy + radius * (0.05 + t * 0.9);
    ctx.fillRect(sx - radius, y, radius * 2, radius * (0.03 + t * 0.07));
  }
  // Sea below the horizon.
  const sea = ctx.createLinearGradient(0, sy + radius * 0.35, 0, r.y + r.h);
  sea.addColorStop(0, 'rgba(10,0,30,0.0)');
  sea.addColorStop(1, 'rgba(10,0,30,0.65)');
  ctx.fillStyle = sea;
  ctx.fillRect(r.x, sy + radius * 0.35, r.w, r.h);
  ctx.restore();
}

/** One palm tree silhouette: a leaning trunk and drooping fronds, base at (x, y), `h` tall. */
export function drawPalm(ctx, x, y, h, lean, color) {
  const topX = x + lean * h;
  const topY = y - h;
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - h * 0.03, y);
  ctx.quadraticCurveTo(x + lean * h * 0.2, y - h * 0.6, topX - h * 0.012, topY);
  ctx.lineTo(topX + h * 0.012, topY);
  ctx.quadraticCurveTo(x + lean * h * 0.2 + h * 0.03, y - h * 0.6, x + h * 0.03, y);
  ctx.closePath();
  ctx.fill();
  const fronds = [-2.7, -2.2, -1.75, -1.3, -0.85, -0.4, 0.05];
  for (const a of fronds) {
    const len = h * (0.42 + 0.08 * Math.cos(a * 3));
    const ex = topX + Math.cos(a) * len;
    const ey = topY + Math.sin(a) * len * 0.55 + len * 0.32;
    const mx = topX + Math.cos(a) * len * 0.5;
    const my = topY + Math.sin(a) * len * 0.6 - len * 0.05;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(mx, my - len * 0.12, ex, ey);
    ctx.quadraticCurveTo(mx, my + len * 0.02, topX, topY + h * 0.02);
    ctx.fill();
  }
  ctx.restore();
}

/** A spiky starburst badge with two lines of text, centred at (x, y). */
export function drawBadge(ctx, x, y, r, text, palette, font) {
  if (!text.trim()) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((12 * Math.PI) / 180);
  ctx.beginPath();
  const spikes = 18;
  for (let i = 0; i < spikes * 2; i++) {
    const rr = i % 2 ? r * 0.84 : r;
    const a = (i * Math.PI) / spikes;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = palette.badge;
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = r * 0.2;
  ctx.shadowOffsetY = r * 0.06;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = r * 0.06;
  ctx.strokeStyle = palette.ink;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
  ctx.lineWidth = r * 0.035;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.stroke();
  const words = text.toUpperCase().trim().split(/\s+/);
  const lines = words.length > 1 ? [words.slice(0, -1).join(' '), words[words.length - 1]] : words;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lines.forEach((line, i) => {
    let size = r * (lines.length > 1 ? (i ? 0.5 : 0.28) : 0.42);
    ctx.font = `900 ${size}px ${font}`;
    const w = ctx.measureText(line).width;
    if (w > r * 1.2) {
      size *= (r * 1.2) / w;
      ctx.font = `900 ${size}px ${font}`;
    }
    const yy = lines.length > 1 ? (i ? r * 0.17 : -r * 0.26) : 0;
    ctx.lineWidth = size * 0.18;
    ctx.strokeStyle = palette.ink;
    ctx.lineJoin = 'round';
    ctx.strokeText(line, 0, yy);
    ctx.fillText(line, 0, yy);
  });
  ctx.restore();
}
