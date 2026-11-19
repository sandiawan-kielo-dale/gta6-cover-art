// Poster layouts: each one turns the export size into panel rectangles (with tilt and frame style), the title area
// and where the wanted stars and the date badge sit. Coordinates are pixels of the cover being drawn, so the same
// layout adapts to 1:1, 4:5 and 16:9.

export const LAYOUTS = [
  { id: 'mosaic', name: 'Classic grid', hint: 'panels around a title block' },
  { id: 'hero', name: 'Hero + panels', hint: 'one big shot and a strip of close-ups' },
  { id: 'snapshots', name: 'Tilted snapshots', hint: 'polaroids thrown over a backdrop' },
  { id: 'slash', name: 'Slashed strips', hint: 'three diagonal cuts' },
  { id: 'fullbleed', name: 'Full bleed', hint: 'one photo, edge to edge' },
];

/** Cells on a cols x rows unit grid, inset by half a gutter so neighbours leave a clean black line. */
function gridCells(W, H, cols, rows, cells, gutter) {
  const cw = W / cols;
  const rh = H / rows;
  return cells.map(([c, r, w, h]) => ({
    x: c * cw + gutter / 2,
    y: r * rh + gutter / 2,
    w: w * cw - gutter,
    h: h * rh - gutter,
    rot: 0,
    skew: 0,
    frame: 'gutter',
  }));
}

function framedGrid(W, H, cols, rows, cells, gutter) {
  // An outer margin as wide as a gutter: the grid then reads as one poster with a border.
  return gridCells(W - gutter, H - gutter, cols, rows, cells, gutter).map((p) => ({
    ...p,
    x: p.x + gutter / 2,
    y: p.y + gutter / 2,
  }));
}

function mosaicLayout(W, H, g) {
  const wide = W / H > 1.3;
  const cells = wide
    ? [
        [0, 0, 5, 6], [5, 0, 6, 3], [11, 0, 5, 4],
        [0, 6, 5, 6], [5, 3, 6, 6, 'title'], [11, 4, 5, 4],
        [5, 9, 6, 3], [11, 8, 5, 4],
      ]
    : [
        [0, 0, 4, 4], [4, 0, 5, 4], [9, 0, 3, 4],
        [0, 4, 3, 4], [3, 4, 6, 4, 'title'], [9, 4, 3, 4],
        [0, 8, 5, 4], [5, 8, 3, 4], [8, 8, 4, 4],
      ];
  const cols = wide ? 16 : 12;
  const rects = framedGrid(W, H, cols, 12, cells, g);
  const titleIndex = cells.findIndex((c) => c[4] === 'title');
  const title = rects[titleIndex];
  const panels = rects.filter((_, i) => i !== titleIndex).slice(0, 9);
  return {
    background: 'ink',
    panels,
    title: { ...title, style: 'block' },
    stars: { x: title.x + title.w / 2, y: title.y + title.h * 0.1, size: title.h * 0.075 },
    badge: null,
  };
}

function heroLayout(W, H, g) {
  const wide = W / H > 1.3;
  if (wide) {
    const rects = framedGrid(W, H, 16, 9, [
      [0, 0, 10, 9], [10, 0, 6, 3], [10, 3, 3, 3], [13, 3, 3, 3], [10, 6, 6, 3],
    ], g);
    const hero = rects[0];
    return {
      background: 'ink',
      panels: rects,
      title: { x: hero.x + hero.w * 0.04, y: hero.y + hero.h * 0.5, w: hero.w * 0.92, h: hero.h * 0.48, style: 'overlay' },
      stars: { x: hero.x + hero.w * 0.5, y: hero.y + hero.h * 0.08, size: hero.h * 0.04 },
      badge: { x: hero.x + hero.w * 0.86, y: hero.y + hero.h * 0.16, r: hero.h * 0.11 },
    };
  }
  const rows = W / H < 0.9 ? 15 : 12;
  const heroRows = rows - 4;
  const rects = framedGrid(W, H, 12, rows, [
    [0, 0, 12, heroRows], [0, heroRows, 3, 4], [3, heroRows, 3, 4], [6, heroRows, 3, 4], [9, heroRows, 3, 4],
  ], g);
  const hero = rects[0];
  return {
    background: 'ink',
    panels: rects,
    title: { x: hero.x + hero.w * 0.04, y: hero.y + hero.h * 0.5, w: hero.w * 0.92, h: hero.h * 0.48, style: 'overlay' },
    stars: { x: hero.x + hero.w * 0.5, y: hero.y + hero.h * 0.07, size: hero.h * 0.04 },
    badge: { x: hero.x + hero.w * 0.85, y: hero.y + hero.h * 0.17, r: hero.h * 0.1 },
  };
}

function snapshotsLayout(W, H) {
  const m = Math.min(W, H);
  const wide = W / H > 1.3;
  const card = (cx, cy, w, h, rot) => ({ x: cx - w / 2, y: cy - h / 2, w, h, rot, skew: 0, frame: 'polaroid' });
  const backdrop = { x: 0, y: 0, w: W, h: H, rot: 0, skew: 0, frame: 'bleed', backdrop: true };
  const cards = wide
    ? [
        card(W * 0.2, H * 0.34, m * 0.42, m * 0.5, -8),
        card(W * 0.5, H * 0.3, m * 0.46, m * 0.54, 4),
        card(W * 0.8, H * 0.36, m * 0.42, m * 0.5, 10),
      ]
    : [
        card(W * 0.27, H * 0.3, m * 0.44, m * 0.5, -9),
        card(W * 0.72, H * 0.27, m * 0.4, m * 0.46, 7),
        card(W * 0.5, H * 0.5, m * 0.46, m * 0.52, -2),
        card(W * 0.22, H * 0.62, m * 0.3, m * 0.34, 12),
      ];
  return {
    background: 'photo',
    panels: [backdrop, ...cards],
    title: wide
      ? { x: W * 0.16, y: H * 0.6, w: W * 0.68, h: H * 0.38, style: 'overlay' }
      : { x: W * 0.04, y: H * 0.7, w: W * 0.92, h: H * 0.27, style: 'overlay' },
    stars: { x: W * 0.5, y: H * 0.055, size: m * 0.035 },
    badge: wide ? { x: W * 0.9, y: H * 0.78, r: m * 0.1 } : { x: W * 0.86, y: H * 0.64, r: m * 0.1 },
  };
}

function slashLayout(W, H, g) {
  const n = 3;
  const skew = W * 0.09;
  const bandW = (W + skew) / n;
  const panels = [];
  for (let i = 0; i < n; i++) {
    const x = i * bandW - skew / 2;
    panels.push({ x: x - skew / 2, y: 0, w: bandW + skew, h: H, rot: 0, skew, frame: 'slash', gutter: g * 1.6 });
  }
  return {
    background: 'ink',
    panels,
    title: { x: W * 0.04, y: H * 0.66, w: W * 0.92, h: H * 0.31, style: 'overlay' },
    stars: { x: W * 0.5, y: H * 0.06, size: Math.min(W, H) * 0.035 },
    badge: { x: W * 0.12, y: H * 0.14, r: Math.min(W, H) * 0.095 },
  };
}

function fullBleedLayout(W, H) {
  const m = Math.min(W, H);
  return {
    background: 'ink',
    panels: [{ x: 0, y: 0, w: W, h: H, rot: 0, skew: 0, frame: 'bleed' }],
    title: { x: W * 0.05, y: H * 0.64, w: W * 0.9, h: H * 0.33, style: 'overlay' },
    stars: { x: W * 0.5, y: H * 0.06, size: m * 0.04 },
    badge: { x: W * 0.85, y: H * 0.15, r: m * 0.11 },
  };
}

/** Panels, title area and accents for layout `id` at W x H pixels. */
export function computeLayout(id, W, H) {
  const g = Math.max(3, Math.round(Math.min(W, H) * 0.011));
  switch (id) {
    case 'hero': return heroLayout(W, H, g);
    case 'snapshots': return snapshotsLayout(W, H);
    case 'slash': return slashLayout(W, H, g);
    case 'fullbleed': return fullBleedLayout(W, H);
    default: return mosaicLayout(W, H, g);
  }
}

/** The outline a panel is clipped to: a rectangle, or a parallelogram for slashed strips. */
export function panelOutline(ctx, p) {
  ctx.beginPath();
  if (p.skew) {
    const inset = (p.gutter ?? 0) / 2;
    ctx.moveTo(p.x + p.skew + inset, p.y);
    ctx.lineTo(p.x + p.w - inset, p.y);
    ctx.lineTo(p.x + p.w - p.skew - inset, p.y + p.h);
    ctx.lineTo(p.x + inset, p.y + p.h);
    ctx.closePath();
  } else {
    ctx.rect(p.x, p.y, p.w, p.h);
  }
}

/** Index of the top-most panel under point (x, y), honouring each panel's tilt; -1 when none. */
export function hitTestPanel(layout, x, y) {
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const p = layout.panels[i];
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    const a = (-p.rot * Math.PI) / 180;
    const dx = x - cx;
    const dy = y - cy;
    let lx = dx * Math.cos(a) - dy * Math.sin(a) + p.w / 2;
    const ly = dx * Math.sin(a) + dy * Math.cos(a) + p.h / 2;
    if (p.skew) lx -= p.skew * (1 - ly / p.h);
    const w = p.skew ? p.w - p.skew : p.w;
    if (lx >= 0 && lx <= w && ly >= 0 && ly <= p.h) return i;
  }
  return -1;
}
