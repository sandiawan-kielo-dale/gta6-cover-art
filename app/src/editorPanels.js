// The editor's side panels: builds the format, layout and grade pickers, the photo strip and the selected panel's
// photo picker, and keeps every control showing the current state. Changes go back through the `on` callbacks.

import { FORMATS } from './coverState.js';
import { LAYOUTS } from './layouts.js';
import { GRADES } from './colorGrades.js';
import { thumbnailOf } from './photoLibrary.js';

const $ = (id) => document.getElementById(id);
const thumbs = new WeakMap();

function thumbFor(photo) {
  if (!thumbs.has(photo)) thumbs.set(photo, thumbnailOf(photo));
  return thumbs.get(photo);
}

function button(label, attrs = {}) {
  const b = document.createElement('button');
  b.type = 'button';
  b.innerHTML = label;
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, v);
  return b;
}

/** Builds the static pickers once; `on.format`, `on.layout` and `on.grade` receive the chosen id. */
export function buildPickers(on) {
  const formats = $('format-list');
  for (const f of Object.values(FORMATS)) {
    const b = button(`${f.label}<small>${f.w}×${f.h}</small>`, { role: 'radio', 'data-id': f.id });
    b.addEventListener('click', () => on.format(f.id));
    formats.append(b);
  }
  const layouts = $('layout-list');
  for (const l of LAYOUTS) {
    const b = button(`${l.name}<small>${l.hint}</small>`, { 'data-id': l.id });
    b.addEventListener('click', () => on.layout(l.id));
    layouts.append(b);
  }
  const grades = $('grade-list');
  for (const g of GRADES) {
    const b = button(`<span class="swatch"></span>${g.name}`, { 'data-id': g.id });
    b.querySelector('.swatch').style.background = `linear-gradient(90deg, ${g.stops.join(', ')})`;
    b.addEventListener('click', () => on.grade(g.id));
    grades.append(b);
  }
}

/** Redraws the loaded-photo strip with a remove button on each thumbnail. */
export function renderPhotoStrip(state, onRemove) {
  const strip = $('photo-strip');
  strip.replaceChildren();
  state.photos.forEach((photo, i) => {
    const cell = document.createElement('div');
    cell.className = 'thumb';
    const img = document.createElement('img');
    img.src = thumbFor(photo);
    img.alt = photo.name;
    const remove = button('×', { 'aria-label': `Remove ${photo.name}` });
    remove.addEventListener('click', () => onRemove(i));
    cell.append(img, remove);
    strip.append(cell);
  });
}

/** Photo choices for the selected panel. */
export function renderPanelPhotos(state, onPick) {
  const box = $('panel-photos');
  box.replaceChildren();
  if (!state.photos.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'Add a photo to fill this panel.';
    box.append(p);
    return;
  }
  const current = state.panels[state.selected]?.photo;
  state.photos.forEach((photo, i) => {
    const b = button('', { 'aria-pressed': String(i === current), 'aria-label': `Show ${photo.name} in this panel` });
    const img = document.createElement('img');
    img.src = thumbFor(photo);
    img.alt = '';
    b.append(img);
    b.addEventListener('click', () => onPick(i));
    box.append(b);
  });
}

/** Sets every control to match `state` (without firing change handlers). */
export function syncControls(state, panelCount) {
  for (const b of $('format-list').children) b.setAttribute('aria-checked', String(b.dataset.id === state.format));
  for (const b of $('layout-list').children) b.setAttribute('aria-pressed', String(b.dataset.id === state.layout));
  for (const b of $('grade-list').children) b.setAttribute('aria-pressed', String(b.dataset.id === state.grade));
  setValue('title', state.title);
  setValue('subtitle', state.subtitle);
  setValue('tagline', state.tagline);
  setValue('stars', state.stars);
  $('stars-out').textContent = String(state.stars);
  setValue('grain', state.grain);
  $('grain-out').textContent = `${Math.round(state.grain * 100)}%`;
  $('vignette').checked = state.vignette;
  const crop = state.panels[state.selected];
  setValue('zoom', crop.zoom);
  $('zoom-out').textContent = `${crop.zoom.toFixed(2)}×`;
  $('panel-label').textContent = `Panel ${state.selected + 1} of ${panelCount}`;
}

function setValue(id, value) {
  const el = $(id);
  if (document.activeElement !== el && el.value !== String(value)) el.value = value;
}

export function setStatus(text) {
  $('status').textContent = text;
}
