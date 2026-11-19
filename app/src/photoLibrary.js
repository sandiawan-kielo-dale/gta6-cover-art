// Loads photos on the person's own machine: picked files, dropped files and pasted images are decoded locally with
// createImageBitmap (nothing is uploaded), and very large photos are scaled to a working size so grading stays quick.

const WORKING_LONG_SIDE = 2400;
let nextId = 1;

async function toWorkingImage(source) {
  const long = Math.max(source.width, source.height);
  if (long <= WORKING_LONG_SIDE) return source;
  const k = WORKING_LONG_SIDE / long;
  return createImageBitmap(source, {
    resizeWidth: Math.round(source.width * k),
    resizeHeight: Math.round(source.height * k),
    resizeQuality: 'high',
  });
}

function makePhoto(image, name) {
  return { id: nextId++, name, image, width: image.width, height: image.height };
}

/** Decodes every image file in `files`; files that are not images, or fail to decode, are skipped. */
export async function photosFromFiles(files) {
  const out = [];
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue;
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      out.push(makePhoto(await toWorkingImage(bitmap), file.name));
    } catch {
      // Not decodable in this browser (some HEIC files): skip it and keep the rest.
    }
  }
  return out;
}

/** Loads one of the bundled sample photos from app/samples/. */
export function samplePhoto(name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => resolve(makePhoto(await createImageBitmap(img), `${name}.jpg`));
    img.onerror = () => reject(new Error(`sample ${name} did not load`));
    img.src = `./samples/${name}.jpg`;
  });
}

/** Image files from a drop or paste event's data transfer. */
export function filesFromTransfer(transfer) {
  if (!transfer) return [];
  if (transfer.files && transfer.files.length) return Array.from(transfer.files);
  return Array.from(transfer.items ?? [])
    .filter((item) => item.kind === 'file')
    .map((item) => item.getAsFile())
    .filter(Boolean);
}

/** A small square thumbnail data URL for the photo strip. */
export function thumbnailOf(photo, size = 96) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const s = Math.max(size / photo.width, size / photo.height);
  const w = photo.width * s;
  const h = photo.height * s;
  ctx.drawImage(photo.image, (size - w) / 2, (size - h) / 2, w, h);
  return c.toDataURL('image/jpeg', 0.8);
}
