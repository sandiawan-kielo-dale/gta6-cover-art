// Composes the whole cover on a canvas: panels (cropped, graded, framed), the title block or overlay lettering,
// accents and the finishing grain. The preview and every PNG export go through this one function, so what the
// editor shows is what gets saved.

import { computeLayout, panelOutline } from './layouts.js';
import { gradeById } from './colorGrades.js';
import { paintPanel } from './panelPainter.js';
import { drawTitle, drawNeonScript, TITLE_FONT } from './lettering.js';
import { drawSunsetBackdrop, drawPalm, drawWantedStars, drawBadge } from './decorations.js';
import { drawGrain, drawVignette, drawTitleShade, hexAlpha } from './filmEffects.js';

/** Draws `state` onto `canvas` at the canvas's own size and returns the layout used (for hit testing). */
export function renderCover(canvas, state, { highlight = -1 } = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const grade = gradeById(state.grade);
  const pal = grade.palette;
  const layout = computeLayout(state.layout, W, H);
  ctx.save();
  ctx.fillStyle = pal.ink;
  ctx.fillRect(0, 0, W, H);
  layout.panels.forEach((panel, i) => drawPanel(ctx, state, panel, i, grade, W, H));
  drawTitleArea(ctx, state, layout, pal, W, H);
  if (layout.stars) drawWantedStars(ctx, layout.stars.x, layout.stars.y, layout.stars.size, state.stars, pal);
  if (layout.badge) drawBadge(ctx, layout.badge.x, layout.badge.y, layout.badge.r, state.tagline, pal, TITLE_FONT);
  if (state.vignette) drawVignette(ctx, W, H, pal);
  drawGrain(ctx, W, H, state.grain);
  if (highlight >= 0 && layout.panels[highlight]) drawSelection(ctx, layout.panels[highlight], W, H);
  ctx.restore();
  return layout;
}

function photoFor(state, index) {
  const crop = state.panels[index];
  return crop && crop.photo >= 0 ? state.photos[crop.photo] : null;
}

function drawPanel(ctx, state, p, index, grade, W, H) {
  const photo = photoFor(state, index);
  const crop = state.panels[index];
  const art = photo ? paintPanel(photo, crop, p.w, p.h, grade) : null;
  ctx.save();
  if (p.frame === 'polaroid') {
    ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
    ctx.rotate((p.rot * Math.PI) / 180);
    const b = p.w * 0.05;
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = p.w * 0.08;
    ctx.shadowOffsetY = p.w * 0.03;
    ctx.fillStyle = '#fbf6ee';
    ctx.fillRect(-p.w / 2 - b, -p.h / 2 - b, p.w + b * 2, p.h + b * 3.6);
    ctx.shadowColor = 'transparent';
    drawArt(ctx, art, -p.w / 2, -p.h / 2, p.w, p.h, grade);
  } else {
    panelOutline(ctx, p);
    ctx.clip();
    if (p.backdrop && art) {
      ctx.filter = `blur(${Math.round(Math.min(W, H) * 0.008)}px) brightness(0.78) saturate(1.3)`;
      ctx.drawImage(art, p.x - 20, p.y - 20, p.w + 40, p.h + 40);
      ctx.filter = 'none';
    } else {
      drawArt(ctx, art, p.x, p.y, p.w, p.h, grade);
    }
  }
  ctx.restore();
}

function drawArt(ctx, art, x, y, w, h, grade) {
  if (art) {
    ctx.drawImage(art, x, y, w, h);
    return;
  }
  // An empty panel still looks like part of the poster: a little sunset waiting for a photo.
  drawSunsetBackdrop(ctx, { x, y, w, h }, grade.palette);
}

function drawTitleArea(ctx, state, layout, pal, W, H) {
  const t = layout.title;
  if (t.style === 'block') {
    ctx.save();
    ctx.beginPath();
    ctx.rect(t.x, t.y, t.w, t.h);
    ctx.clip();
    drawSunsetBackdrop(ctx, t, pal);
    const silhouette = hexAlpha(pal.ink, 0.92);
    drawPalm(ctx, t.x + t.w * 0.08, t.y + t.h * 1.02, t.h * 0.78, 0.12, silhouette);
    drawPalm(ctx, t.x + t.w * 0.92, t.y + t.h * 1.02, t.h * 0.66, -0.16, silhouette);
    ctx.restore();
    neonFrame(ctx, t, pal, Math.min(W, H));
    const letters = drawTitle(ctx, state.title, { x: t.x + t.w * 0.04, y: t.y + t.h * 0.14, w: t.w * 0.92, h: t.h * 0.62 }, pal);
    drawNeonScript(ctx, state.subtitle, t.x + t.w * 0.55, t.y + t.h * 0.84, t.w * 0.8, letters.size * 0.42, pal);
    return;
  }
  drawTitleShade(ctx, t, W, H, pal);
  const letters = drawTitle(ctx, state.title, { x: t.x - t.w * 0.02, y: t.y - t.h * 0.08, w: t.w * 1.04, h: t.h * 0.9 }, pal);
  drawNeonScript(ctx, state.subtitle, t.x + t.w * 0.6, letters.y + letters.h + letters.size * 0.02, t.w * 0.72, letters.size * 0.52, pal);
}

/** A thin glowing tube just inside the title block's edge. */
function neonFrame(ctx, t, pal, m) {
  const inset = m * 0.012;
  ctx.save();
  ctx.lineWidth = Math.max(1.5, m * 0.0035);
  ctx.strokeStyle = pal.script;
  ctx.shadowColor = pal.glow;
  ctx.shadowBlur = m * 0.012;
  ctx.strokeRect(t.x + inset, t.y + inset, t.w - inset * 2, t.h - inset * 2);
  ctx.restore();
}

function drawSelection(ctx, p, W, H) {
  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
  ctx.rotate((p.rot * Math.PI) / 180);
  ctx.translate(-p.x - p.w / 2, -p.y - p.h / 2);
  panelOutline(ctx, p);
  ctx.lineWidth = Math.max(2, Math.min(W, H) * 0.005);
  ctx.setLineDash([ctx.lineWidth * 3, ctx.lineWidth * 2]);
  ctx.strokeStyle = '#7cf7ff';
  ctx.shadowColor = '#7cf7ff';
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.restore();
}
