// Fixed scenes for the entry's screenshots, chosen with a query such as
// `?shot=1&layout=mosaic&grade=vice&format=landscape&title=VICE%0ANIGHTS`. Each scene loads the bundled sample
// photos (made with an image model, free to use) and frames them with hand-picked crops so the screenshots show
// faces and details rather than the default spread.

const SAMPLE_CROPS = {
  pier: [
    { zoom: 2.3, cx: 0.4, cy: 0.25 },
    { zoom: 1.0, cx: 0.5, cy: 0.5 },
    { zoom: 2.4, cx: 0.82, cy: 0.66 },
    { zoom: 1.7, cx: 0.75, cy: 0.38 },
    { zoom: 1.6, cx: 0.45, cy: 0.42 },
  ],
  boulevard: [
    { zoom: 2.5, cx: 0.58, cy: 0.21 },
    { zoom: 1.0, cx: 0.5, cy: 0.45 },
    { zoom: 2.3, cx: 0.14, cy: 0.24 },
    { zoom: 3.6, cx: 0.58, cy: 0.17 },
    { zoom: 1.5, cx: 0.55, cy: 0.4 },
  ],
};

/** The order a scene deals sample crops into panels: hero shots first, details after. */
const DEAL = [
  ['boulevard', 1], ['pier', 0], ['boulevard', 2], ['pier', 2], ['boulevard', 0],
  ['pier', 1], ['boulevard', 3], ['pier', 3], ['boulevard', 4],
];

export function sceneFromQuery(search) {
  const q = new URLSearchParams(search);
  if (!q.has('shot')) return null;
  const names = (q.get('photos') ?? 'pier,boulevard').split(',').filter((n) => n in SAMPLE_CROPS);
  return {
    photos: names,
    apply(state) {
      for (const key of ['layout', 'grade', 'format', 'title', 'subtitle', 'tagline']) {
        if (q.has(key)) state[key] = q.get(key);
      }
      if (q.has('stars')) state.stars = Number(q.get('stars'));
      if (q.has('grain')) state.grain = Number(q.get('grain'));
      if (q.has('selected')) state.selected = Number(q.get('selected'));
      const offset = Number(q.get('deal') ?? 0);
      state.panels = state.panels.map((_, i) => {
        const [name, k] = DEAL[(i + offset) % DEAL.length];
        const photo = Math.max(0, names.indexOf(name));
        const crop = SAMPLE_CROPS[names[photo]][k % SAMPLE_CROPS[names[photo]].length];
        return { photo, ...crop };
      });
    },
  };
}
