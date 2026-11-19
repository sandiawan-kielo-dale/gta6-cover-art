// The cover's document model: which photos are loaded, the layout, the colour grade, the lettering and each
// panel's crop (photo, zoom and focus point). Everything the renderer draws is read from this one object, and every
// editor control writes back into it through the helpers below.

export const MAX_PANELS = 9;

export const FORMATS = {
  square: { id: 'square', label: '1:1', w: 1080, h: 1080 },
  portrait: { id: 'portrait', label: '4:5', w: 1080, h: 1350 },
  landscape: { id: 'landscape', label: '16:9', w: 1920, h: 1080 },
};

// Starting crops for panels that share one photo: each panel looks at a different spot at a different zoom, so a
// single selfie already fills a multi-panel poster with varied close-ups instead of nine copies of the same frame.
const CROP_VARIETY = [
  { zoom: 1.0, cx: 0.5, cy: 0.45 },
  { zoom: 2.1, cx: 0.48, cy: 0.24 },
  { zoom: 1.5, cx: 0.7, cy: 0.6 },
  { zoom: 2.6, cx: 0.42, cy: 0.3 },
  { zoom: 1.25, cx: 0.3, cy: 0.5 },
  { zoom: 1.8, cx: 0.62, cy: 0.38 },
  { zoom: 3.0, cx: 0.5, cy: 0.2 },
  { zoom: 1.4, cx: 0.55, cy: 0.75 },
  { zoom: 2.2, cx: 0.25, cy: 0.35 },
];

export function createState() {
  return {
    photos: [],
    layout: 'mosaic',
    grade: 'vice',
    format: 'square',
    title: 'VICE\nNIGHTS',
    subtitle: 'sunset state of mind',
    tagline: 'SUMMER 2026',
    stars: 4,
    grain: 0.55,
    vignette: true,
    selected: 0,
    panels: Array.from({ length: MAX_PANELS }, (_, i) => defaultPanel(i, 0)),
  };
}

/** A fresh crop for panel `index` when `photoCount` photos are loaded. */
export function defaultPanel(index, photoCount) {
  const v = CROP_VARIETY[index % CROP_VARIETY.length];
  return { photo: photoCount ? index % photoCount : -1, zoom: v.zoom, cx: v.cx, cy: v.cy };
}

/** Deals the loaded photos out across every panel again, with the varied default crops. */
export function redistributePhotos(state) {
  state.panels = state.panels.map((_, i) => defaultPanel(i, state.photos.length));
}

/** Gives photos added after `firstNew` their own panels, leaving earlier panel choices alone where possible. */
export function assignNewPhotos(state, firstNew) {
  const count = state.photos.length;
  if (firstNew === 0) {
    redistributePhotos(state);
    return;
  }
  let next = firstNew;
  for (let i = 0; i < state.panels.length && next < count; i += 2) {
    state.panels[i] = { ...defaultPanel(i, count), photo: next };
    next += 1;
  }
}

export function resetPanelCrop(state, index) {
  const keep = state.panels[index].photo;
  state.panels[index] = { ...defaultPanel(index, state.photos.length), photo: keep, zoom: 1, cx: 0.5, cy: 0.45 };
}

/** Removes a photo and points every panel that showed it at a remaining one. */
export function removePhoto(state, photoIndex) {
  state.photos.splice(photoIndex, 1);
  const count = state.photos.length;
  state.panels.forEach((panel, i) => {
    if (!count) panel.photo = -1;
    else if (panel.photo === photoIndex) panel.photo = i % count;
    else if (panel.photo > photoIndex) panel.photo -= 1;
  });
}

export function formatSize(state) {
  return FORMATS[state.format] ?? FORMATS.square;
}
