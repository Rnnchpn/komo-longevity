import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, 'site');

async function htmlFiles(dir) {
  const files = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) files.push(...await htmlFiles(path));
      else if (entry.isFile() && entry.name.endsWith('.html')) files.push(path);
    }
  } catch {}
  return files;
}

// 1) Editorial URLs: one crawlable public knowledge hub + article URLs.
const sitemapPath = join(site, 'sitemap.xml');
try {
  let xml = await readFile(sitemapPath, 'utf8');

  // The French Library is now consolidated into /media. Do not ask search engines
  // to index both the legacy Library URL and the editorial hub.
  xml = xml.replace(/\s*<url>\s*<loc>https:\/\/komolongevity\.com\/fr\/library\/?<\/loc>[\s\S]*?<\/url>/g, '');

  const urls = [
    'https://komolongevity.com/media',
    'https://komolongevity.com/review',
    'https://komolongevity.com/media/locomotive-syndrome',
    'https://komolongevity.com/media/walking-is-data',
    'https://komolongevity.com/media/biomechanics-aging',
    'https://komolongevity.com/media/cone-of-economy'
  ];
  const missing = urls.filter((url) => !xml.includes(`<loc>${url}</loc>`));
  if (missing.length) {
    xml = xml.replace('</urlset>', `${missing.map((url) => `  <url><loc>${url}</loc><changefreq>monthly</changefreq></url>`).join('\n')}\n</urlset>`);
  }
  await writeFile(sitemapPath, xml, 'utf8');
} catch (error) {
  console.warn('[media-seo] sitemap patch skipped:', error.message);
}

// 2) On every French public page, KŌMØ Library becomes the single doorway
// to the editorial hub. This removes duplicate navigation between Library and Media.
const frenchFiles = await htmlFiles(join(site, 'fr'));
for (const file of frenchFiles) {
  try {
    let html = await readFile(file, 'utf8');
    const original = html;
    html = html
      .replaceAll('href="/fr/library/#articles"', 'href="/media"')
      .replaceAll('href="/fr/library/"', 'href="/media"')
      .replaceAll('>Bibliothèque<', '>KŌMØ Library<');
    if (html !== original) await writeFile(file, html, 'utf8');
  } catch (error) {
    console.warn('[media-seo] French Library link patch skipped:', file, error.message);
  }
}

// 3) Present /media as the public face of KŌMØ Library.
const mediaPath = join(site, 'assets', 'media', 'index.html');
try {
  let html = await readFile(mediaPath, 'utf8');
  html = html
    .replace('<title>KŌMØ Media — Longévité locomotrice, marche & biomécanique</title>', '<title>KŌMØ Library — Articles, vidéos & longévité locomotrice</title>')
    .replace('content="KŌMØ Media rassemble articles, vidéos et perspectives scientifiques sur la longévité locomotrice, la marche, la biomécanique, la posture et la mobilité."', 'content="KŌMØ Library rassemble articles, vidéos, revues et perspectives scientifiques sur la longévité locomotrice, la marche, la biomécanique, la posture et la mobilité."')
    .replace('content="KŌMØ Media — Science of Movement"', 'content="KŌMØ Library — Science of Movement"')
    .replace('<a class="brand" href="/">KŌMØ MEDIA</a>', '<a class="brand" href="/">KŌMØ LIBRARY</a>')
    .replace('>SCIENCE · MOVEMENT · LONGEVITY<', '>KŌMØ MEDIA · SCIENCE · MOVEMENT · LONGEVITY<')
    .replace('Articles, vidéos et perspectives scientifiques sur la marche, la posture, la biomécanique et la longévité locomotrice.', 'KŌMØ Library réunit articles, vidéos, revues et perspectives scientifiques sur la marche, la posture, la biomécanique et la longévité locomotrice.');
  await writeFile(mediaPath, html, 'utf8');
} catch (error) {
  console.warn('[media-seo] Media/Library identity patch skipped:', error.message);
}

console.log('[media-seo] French KŌMØ Library consolidated into /media, sitemap and internal links updated.');
