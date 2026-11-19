// Boots the cover studio: owns the state, sizes and redraws the live preview, and connects the pickers, caption
// fields, photo loading (pick, drop, paste), panel gestures and PNG export. A `?shot=` query sets up a fixed scene
// for screenshots (./shots.js).

import { createState, formatSize, assignNewPhotos, redistributePhotos, removePhoto, resetPanelCrop } from './coverState.js';
import { renderCover } from './coverRenderer.js';
import { photosFromFiles, samplePhoto, filesFromTransfer } from './photoLibrary.js';
import { attachPanelGestures } from './panelGestures.js';
import { exportCover, exportAllSizes } from './exportPng.js';
import { buildPickers, renderPhotoStrip, renderPanelPhotos, syncControls, setStatus } from './editorPanels.js';
import { forgetPhoto } from './panelPainter.js';
import { sceneFromQuery } from './shots.js';
import { loadLetteringFonts } from './lettering.js';

const $ = (id) => document.getElementById(id);
const state = createState();
const preview = $('preview');
let layout = null;
let usingSamples = false;
let frameRequested = false;

function sizePreview() {
  const frame = $('canvas-frame').getBoundingClientRect();
  const f = formatSize(state);
  const fit = Math.min(frame.width / f.w, frame.height / f.h);
  const cssW = Math.max(120, Math.floor(f.w * fit));
  const cssH = Math.max(120, Math.floor(f.h * fit));
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const k = Math.min(dpr, 1400 / Math.max(cssW, cssH));
  preview.style.width = `${cssW}px`;
  preview.style.height = `${cssH}px`;
  preview.width = Math.round(cssW * k);
  preview.height = Math.round(cssH * k);
}

function draw() {
  frameRequested = false;
  layout = renderCover(preview, state, { highlight: state.photos.length ? state.selected : -1 });
  if (state.selected >= layout.panels.length) {
    state.selected = 0;
    draw();
    return;
  }
  syncControls(state, layout.panels.length);
}

function requestDraw() {
  if (frameRequested) return;
  frameRequested = true;
  requestAnimationFrame(draw);
}

function refreshPhotoLists() {
  renderPhotoStrip(state, (i) => {
    forgetPhoto(state.photos[i].id);
    removePhoto(state, i);
    refreshPhotoLists();
    requestDraw();
  });
  renderPanelPhotos(state, pickForSelected);
}

async function addPhotos(files) {
  const added = await photosFromFiles(files);
  if (!added.length) {
    setStatus('No image found in that — try a JPG, PNG or WebP.');
    return;
  }
  if (usingSamples) {
    state.photos = [];
    usingSamples = false;
  }
  const first = state.photos.length;
  state.photos.push(...added);
  assignNewPhotos(state, first);
  setStatus(`${added.length} photo${added.length > 1 ? 's' : ''} added. Drag inside a panel to frame it.`);
  refreshPhotoLists();
  requestDraw();
}

async function loadSamples(names = ['pier', 'boulevard']) {
  state.photos = await Promise.all(names.map(samplePhoto));
  usingSamples = true;
  redistributePhotos(state);
  refreshPhotoLists();
}

function bindControls() {
  buildPickers({
    format: (id) => { state.format = id; sizePreview(); requestDraw(); },
    layout: (id) => { state.layout = id; state.selected = 0; requestDraw(); },
    grade: (id) => { state.grade = id; requestDraw(); },
  });
  const text = (id, key) => $(id).addEventListener('input', (e) => { state[key] = e.target.value; requestDraw(); });
  text('title', 'title');
  text('subtitle', 'subtitle');
  text('tagline', 'tagline');
  $('stars').addEventListener('input', (e) => { state.stars = Number(e.target.value); requestDraw(); });
  $('grain').addEventListener('input', (e) => { state.grain = Number(e.target.value); requestDraw(); });
  $('vignette').addEventListener('change', (e) => { state.vignette = e.target.checked; requestDraw(); });
  $('zoom').addEventListener('input', (e) => {
    const crop = state.panels[state.selected];
    gestures.zoomBy(state.selected, Number(e.target.value) / crop.zoom);
  });
  $('reset-crop').addEventListener('click', () => { resetPanelCrop(state, state.selected); requestDraw(); });
  $('fill-all').addEventListener('click', () => {
    const photo = state.panels[state.selected].photo;
    if (photo < 0) return;
    redistributePhotos(state);
    state.panels.forEach((p) => { p.photo = photo; });
    refreshPhotoLists();
    requestDraw();
  });
  $('shuffle').addEventListener('click', () => {
    const n = state.photos.length;
    if (!n) return;
    const shift = 1 + Math.floor(Math.random() * Math.max(1, n - 1));
    state.panels.forEach((p) => { p.photo = (p.photo + shift) % n; });
    refreshPhotoLists();
    requestDraw();
  });
  $('use-samples').addEventListener('click', async () => { await loadSamples(); requestDraw(); });
  $('photo-input').addEventListener('change', (e) => { addPhotos(e.target.files); e.target.value = ''; });
  $('export-current').addEventListener('click', () => runExport(() => exportCover(state, state.format)));
  $('export-all').addEventListener('click', () => runExport(() => exportAllSizes(state)));
  window.addEventListener('dragover', (e) => { e.preventDefault(); document.body.classList.add('drop-active'); });
  window.addEventListener('dragleave', () => document.body.classList.remove('drop-active'));
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    document.body.classList.remove('drop-active');
    addPhotos(filesFromTransfer(e.dataTransfer));
  });
  window.addEventListener('paste', (e) => {
    const files = filesFromTransfer(e.clipboardData);
    if (files.length) addPhotos(files);
  });
  window.addEventListener('resize', () => { sizePreview(); requestDraw(); });
}

async function runExport(job) {
  setStatus('Rendering…');
  const result = await job();
  const names = Array.isArray(result) ? result : [result];
  setStatus(`Saved ${names.join(', ')}`);
  document.body.dataset.exported = String(Number(document.body.dataset.exported || 0) + names.length);
}

let gestures = null;

async function start() {
  bindControls();
  gestures = attachPanelGestures(preview, state, () => layout, (what) => {
    if (what === 'select') renderPanelPhotos(state, pickForSelected);
    requestDraw();
  });
  const scene = sceneFromQuery(location.search);
  await Promise.all([loadSamples(scene?.photos), loadLetteringFonts()]);
  if (scene) scene.apply(state);
  refreshPhotoLists();
  sizePreview();
  draw();
  document.body.dataset.ready = 'true';
}

function pickForSelected(photoIndex) {
  state.panels[state.selected].photo = photoIndex;
  renderPanelPhotos(state, pickForSelected);
  requestDraw();
}

start();
