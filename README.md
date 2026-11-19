# Neon Coast — GTA-style cover art studio

[![make.fun bounty](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/sandiawan-kielo-dale/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard)
[![reward](https://make.fun/badge/gta6-cover-art-01/sandiawan-kielo-dale/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An offline browser app that turns your own photos and a caption into open-world-crime-game-style cover art: the
multi-panel poster look, heavy forward-leaning lettering and a neon sunset colour grade. Export a PNG in
1080 × 1080, 1080 × 1350 or 1920 × 1080 in one click.

## What it does

- **5 layouts** — classic grid (panels around a sunset title block with a striped sun and palms), hero + panels,
  tilted polaroid snapshots over a blurred backdrop, slashed diagonal strips, and full bleed. Every layout adapts to
  square, portrait and landscape.
- **7 colour grades** — Vice Sunset, Neon Night, Gold Coast, Miami Mint, Red Heat, Ink Pop (posterized with comic
  halftone dots) and Natural Punch. Each is a gradient map plus contrast curve and colour wash, and it also drives the
  lettering, title block, stars and badge colours so the whole cover matches.
- **Lettering drawn on the canvas** — chrome sunset fill with a hard horizon line, a light rim, a heavy dark stroke
  and a stepped 3D extrusion, leaned and tilted; lines are justified to the same width. A glowing neon script
  subtitle, a row of wanted stars and a starburst badge. System fonts only (Impact and condensed fallbacks); no font
  file, logo or artwork from any game.
- **Photo handling** — drop, pick or paste several photos. Each panel gets its own photo and crop; one photo
  already fills a grid with varied close-ups. Click a panel to select it, drag to move the photo, scroll (or the
  slider) to zoom, double-click to reset. "Use in every panel" and "Shuffle" re-deal photos.
- **Finish** — seeded film grain and vignette.
- **Export** — "Export PNG" saves the current size; "All 3 sizes" saves all three. The preview and the export are
  drawn by the same renderer.

## How to use

1. Serve `app/` with any static server (or `node serve.ts`, then open `http://localhost:8080`) in desktop Chrome.
2. Drop your photos on the page (the sample photos load first so you see a cover straight away).
3. Pick a layout and a grade, type the title (Enter for a second line), the neon script line and the badge text.
4. Click panels to frame each one; then pick a size at the top and press **Export PNG**.

## File layout

```
app/index.html            the editor page
app/style.css             editor styling
app/src/main.js           boot, state wiring, preview sizing, photo loading and export buttons
app/src/coverState.js     document model: photos, layout, grade, caption, per-panel crops
app/src/layouts.js        poster layouts, panel outlines and hit testing
app/src/colorGrades.js    gradient-map grades, posterize and halftone
app/src/panelPainter.js   crop + grade one panel, with a small cache
app/src/coverRenderer.js  composes the whole cover (preview and export)
app/src/lettering.js      title lettering and neon script
app/src/decorations.js    striped sun, palms, wanted stars, badge
app/src/filmEffects.js    grain, vignette, title shading
app/src/panelGestures.js  select / drag / wheel-zoom on the preview
app/src/photoLibrary.js   local photo decoding (pick, drop, paste) and thumbnails
app/src/editorPanels.js   side-panel controls
app/src/exportPng.js      PNG export at the three post sizes
app/src/shots.js          fixed scenes for the screenshots (?shot=…)
app/samples/              two sample photos
main.ts                   hands the entry in: copies app/ and screenshots/, writes dossier.json
serve.ts                  tiny local static server
```

## Privacy

Photos are decoded in your browser with `createImageBitmap` and never leave your machine. The app makes no network
requests; every file it loads is under `app/`, and exported PNGs are saved straight to your downloads.

## Sample photos

`app/samples/pier.jpg` and `app/samples/boulevard.jpg` were made with an image model and are free to use. They are
the photos in the screenshots.

## License

MIT — see [LICENSE](LICENSE).
