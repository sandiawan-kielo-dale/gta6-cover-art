// Paints one panel's photo: crops the photo to the panel's shape at the panel's zoom and focus point (cover fit, so
// the panel is always full), grades it, and keeps the result in a small cache so dragging one panel does not
// re-grade all the others.

import { applyGrade } from './colorGrades.js';

const cache = new Map();
const CACHE_LIMIT = 48;

/** The part of the photo a panel of w x h shows: source rectangle plus the scale from photo to panel pixels. */
export function cropWindow(photo, crop, w, h) {
  const base = Math.max(w / photo.width, h / photo.height);
  const scale = base * Math.max(1, crop.zoom);
  const vw = w / scale;
  const vh = h / scale;
  const cx = clamp(crop.cx * photo.width, vw / 2, photo.width - vw / 2);
  const cy = clamp(crop.cy * photo.height, vh / 2, photo.height - vh / 2);
  return { sx: cx - vw / 2, sy: cy - vh / 2, sw: vw, sh: vh, scale };
}

/** Keeps a crop's focus point where the panel can actually show it, so a drag past the edge does not stick. */
export function clampCrop(photo, crop, w, h) {
  const win = cropWindow(photo, crop, w, h);
  crop.cx = (win.sx + win.sw / 2) / photo.width;
  crop.cy = (win.sy + win.sh / 2) / photo.height;
}

function clamp(v, lo, hi) {
  return lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v));
}

/** A graded canvas of w x h showing `crop` of `photo`, from cache when nothing changed. */
export function paintPanel(photo, crop, w, h, grade) {
  const pw = Math.max(1, Math.round(w));
  const ph = Math.max(1, Math.round(h));
  const key = `${photo.id}|${crop.zoom.toFixed(3)}|${crop.cx.toFixed(4)}|${crop.cy.toFixed(4)}|${pw}x${ph}|${grade.id}`;
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  const canvas = document.createElement('canvas');
  canvas.width = pw;
  canvas.height = ph;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const win = cropWindow(photo, crop, pw, ph);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(photo.image, win.sx, win.sy, win.sw, win.sh, 0, 0, pw, ph);
  applyGrade(canvas, grade);
  if (grade.tint) skyWash(ctx, pw, ph, grade.tint);
  cache.set(key, canvas);
  if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value);
  return canvas;
}

/** A soft-light wash from the grade's warm sky colour at the top to its cool shade at the bottom. */
function skyWash(ctx, w, h, [top, bottom]) {
  const g = ctx.createLinearGradient(0, 0, w * 0.25, h);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Forgets cached panels of a photo that was removed. */
export function forgetPhoto(photoId) {
  for (const key of cache.keys()) if (key.startsWith(`${photoId}|`)) cache.delete(key);
}
