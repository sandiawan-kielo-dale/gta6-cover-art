// Direct manipulation on the preview: click a panel to select it, drag to move the photo inside it, scroll the wheel
// to zoom, double-click to reset its crop. Moves are converted from screen pixels into the photo's own coordinates,
// taking a tilted panel's rotation into account.

import { hitTestPanel } from './layouts.js';
import { cropWindow, clampCrop } from './panelPainter.js';
import { resetPanelCrop } from './coverState.js';

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 5;

/**
 * Wires gestures on `canvas`. `getLayout()` returns the layout last drawn on it; `onChange(what)` is called with
 * 'select' when the selection changes and 'crop' while a crop moves.
 */
export function attachPanelGestures(canvas, state, getLayout, onChange) {
  let drag = null;

  const toCanvas = (event) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - r.left) / r.width) * canvas.width,
      y: ((event.clientY - r.top) / r.height) * canvas.height,
    };
  };

  const select = (point) => {
    const index = hitTestPanel(getLayout(), point.x, point.y);
    if (index >= 0 && index !== state.selected) {
      state.selected = index;
      onChange('select');
    }
    return index;
  };

  canvas.addEventListener('pointerdown', (event) => {
    const point = toCanvas(event);
    const index = select(point);
    if (index < 0) return;
    canvas.setPointerCapture(event.pointerId);
    drag = { index, last: point };
    canvas.classList.add('dragging');
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const point = toCanvas(event);
    panBy(drag.index, point.x - drag.last.x, point.y - drag.last.y);
    drag.last = point;
  });

  const endDrag = () => {
    drag = null;
    canvas.classList.remove('dragging');
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  canvas.addEventListener('wheel', (event) => {
    const index = select(toCanvas(event));
    if (index < 0) return;
    event.preventDefault();
    zoomBy(index, Math.exp(-event.deltaY * 0.0015));
  }, { passive: false });

  canvas.addEventListener('dblclick', (event) => {
    const index = select(toCanvas(event));
    if (index < 0) return;
    resetPanelCrop(state, index);
    onChange('crop');
  });

  function panBy(index, dx, dy) {
    const panel = getLayout().panels[index];
    const crop = state.panels[index];
    const photo = state.photos[crop.photo];
    if (!panel || !photo) return;
    const a = (-panel.rot * Math.PI) / 180;
    const lx = dx * Math.cos(a) - dy * Math.sin(a);
    const ly = dx * Math.sin(a) + dy * Math.cos(a);
    const { scale } = cropWindow(photo, crop, panel.w, panel.h);
    crop.cx -= lx / scale / photo.width;
    crop.cy -= ly / scale / photo.height;
    clampCrop(photo, crop, panel.w, panel.h);
    onChange('crop');
  }

  function zoomBy(index, factor) {
    const crop = state.panels[index];
    crop.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, crop.zoom * factor));
    const panel = getLayout().panels[index];
    const photo = state.photos[crop.photo];
    if (panel && photo) clampCrop(photo, crop, panel.w, panel.h);
    onChange('crop');
  }

  return { zoomBy };
}
