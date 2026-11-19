// PNG export: renders the cover off screen at the exact post size (1080 x 1080, 1080 x 1350 or 1920 x 1080) and
// saves it straight to the person's downloads. The file never leaves the machine.

import { FORMATS } from './coverState.js';
import { renderCover } from './coverRenderer.js';

function slug(text) {
  const s = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s.slice(0, 32) || 'cover';
}

/** Renders `state` at format `formatId` and resolves to { blob, name, width, height }. */
export async function renderPng(state, formatId) {
  const f = FORMATS[formatId];
  const canvas = document.createElement('canvas');
  canvas.width = f.w;
  canvas.height = f.h;
  renderCover(canvas, { ...state, format: formatId });
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  return { blob, name: `${slug(state.title)}-${f.w}x${f.h}.png`, width: f.w, height: f.h };
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Exports one size; resolves to the file name saved. */
export async function exportCover(state, formatId) {
  const png = await renderPng(state, formatId);
  download(png.blob, png.name);
  return png.name;
}

/** Exports all three post sizes one after another. */
export async function exportAllSizes(state) {
  const names = [];
  for (const id of Object.keys(FORMATS)) {
    names.push(await exportCover(state, id));
    await new Promise((r) => setTimeout(r, 250));
  }
  return names;
}
