import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const targets = [
  join(root, 'site', 'assets', 'media', 'index.html'),
  join(root, 'site', 'assets', 'review', 'index.html'),
  join(root, 'site', 'assets', 'media', 'locomotive-syndrome', 'index.html'),
  join(root, 'site', 'assets', 'media', 'walking-is-data', 'index.html')
];

const replacements = [
  ['/assets/media/visuals/media-hero.svg', '/assets/media/media-hero.webp'],
  ['/assets/media/visuals/locomotive-syndrome.svg', '/assets/media/visuals/locomotive-syndrome.webp'],
  ['/assets/media/visuals/walking-is-data.svg', '/assets/media/visuals/walking-is-data.webp']
];

for (const target of targets) {
  try {
    let html = await readFile(target, 'utf8');
    for (const [from, to] of replacements) html = html.replaceAll(from, to);
    await writeFile(target, html, 'utf8');
  } catch (error) {
    console.warn('[media-webp] skipped', target, error.message);
  }
}

console.log('[media-webp] Generated editorial WebP visuals enabled.');
